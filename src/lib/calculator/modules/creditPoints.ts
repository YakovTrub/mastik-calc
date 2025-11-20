import type { CalculatorInputs, CreditPointBreakdown, CreditPointsConfig } from '@/types/calculator';

/**
 * Calculate credit points according to 2025 Israeli tax rules
 * 
 * Constants:
 * - VALUE_POINT_MONTH = 242 NIS
 * - VALUE_POINT_YEAR = 2,904 NIS
 * - VALUE_POINT_HALF = 121 NIS per month (0.5 point)
 * - VALUE_POINT_QUARTER = 60.5 NIS per month (0.25 point)
 */
export function calculateCreditPoints(
  inputs: CalculatorInputs,
  config: CreditPointsConfig
): CreditPointBreakdown[] {
  const credits: CreditPointBreakdown[] = [];
  
  // C_RESIDENT: 2.25 points (2 for residency + 0.25 travel compensation)
  if (inputs.isResident) {
    credits.push({
      category: 'Resident (Base)',
      points: config.base_resident,
      description: 'Israeli resident with taxable income (includes 0.25 travel compensation)'
    });
  }
  
  // C_WOMAN: 0.5 point for working women
  if (inputs.gender === 'female' && inputs.isResident) {
    credits.push({
      category: 'Woman',
      points: config.women,
      description: 'Credit for working women'
    });
  }
  
  // C_WORKING_TEEN: 1 point for ages 16-18 (girls also get C_WOMAN)
  if (inputs.dateOfBirth && inputs.isResident) {
    const age = calculateAge(inputs.dateOfBirth);
    if (age >= 16 && age <= 18) {
      credits.push({
        category: 'Working Youth',
        points: config.working_youth,
        description: 'Credit for working teenagers aged 16-18'
      });
    }
  }
  
  // C_FOREIGN_WORKER: credits for legally employed foreign workers
  // Note: This would require additional input fields. Placeholder for future implementation.
  // - Caregivers: 2.25 points
  // - Other foreign workers: 1 point
  // - Female foreign workers: additional 0.5 point (already covered by C_WOMAN)
  
  // C_OLIM: New immigrant credits based on year of aliyah
  if (inputs.isNewImmigrant && inputs.immigrationDate && inputs.isResident) {
    const monthsSinceImmigration = calculateMonthsSince(inputs.immigrationDate);
    const immigrationYear = inputs.immigrationDate.getFullYear();
    const isAfter2021 = immigrationYear >= 2022;
    
    let monthlyPoints = 0;
    let maxDuration = isAfter2021 ? 54 : 42;
    
    if (monthsSinceImmigration < maxDuration) {
      if (isAfter2021) {
        // Rules for immigrants from 2022 onward (54 months total)
        if (monthsSinceImmigration < 12) {
          monthlyPoints = 1; // Months 0-11 (first year)
        } else if (monthsSinceImmigration < 30) {
          monthlyPoints = 3; // Months 12-29
        } else if (monthsSinceImmigration < 42) {
          monthlyPoints = 2; // Months 30-41
        } else {
          monthlyPoints = 1; // Months 42-53
        }
      } else {
        // Rules for immigrants up to 2021 (42 months total)
        if (monthsSinceImmigration < 18) {
          monthlyPoints = 3; // Months 0-17
        } else if (monthsSinceImmigration < 30) {
          monthlyPoints = 2; // Months 18-29
        } else {
          monthlyPoints = 1; // Months 30-41
        }
      }
      
      credits.push({
        category: 'New Immigrant (Oleh Chadash)',
        points: monthlyPoints,
        description: `Month ${monthsSinceImmigration + 1} of ${maxDuration} (${monthlyPoints} pts = ₪${monthlyPoints * 242}/month)`
      });
    }
  }
  
  // C_SPOUSE_DEPENDENT: credit for supporting dependent spouse
  // Conditions: spouse must be Israeli resident, have no/low income, and meet dependency conditions
  // (retirement age, blindness, disability ≥90%, or disability pension)
  // Note: This would require additional input fields. Placeholder for future implementation.
  if (inputs.hasSpouseNoIncome && inputs.maritalStatus === 'married' && inputs.isResident) {
    // Assuming joint filing for now. Would need input for filing type.
    credits.push({
      category: 'Dependent Spouse',
      points: config.spouse_no_income || 1.0, // Using existing config or default to joint filing
      description: 'Credit for supporting dependent spouse (joint filing)'
    });
  }
  
  // C_ALIMONY_EX_SPOUSE: 1 point for paying alimony to former spouse after new marriage
  // Note: This would require additional input fields. Placeholder for future implementation.
  
  // C_CHILDREN: composite variable for all child credits
  if (inputs.isResident && inputs.childrenAges.length > 0) {
    inputs.childrenAges.forEach((age, index) => {
      const birthYear = new Date().getFullYear() - age;
      let points = 0;
      let description = '';
      
      // Determine which rule set applies based on birth year
      if (birthYear >= 2024) {
        // Children born from 2024 onward
        if (age === 0) {
          points = 2.5;
          description = 'Birth year (2024+)';
        } else if (age === 1 || age === 2) {
          points = 4.5;
          description = `Age ${age} (2024+)`;
        } else if (age === 3) {
          points = 3.5;
          description = 'Age 3 (2024+)';
        } else if (age >= 4 && age <= 5) {
          points = 2.5;
          description = `Age ${age} (2024+)`;
        }
      } else if (birthYear >= 2017 && birthYear <= 2023) {
        // Children born 2017-2023
        if (age === 0) {
          points = 1.5;
          description = 'Birth year (2017-2023)';
        } else if (age >= 1 && age <= 5) {
          points = 2.5;
          description = `Age ${age} (2017-2023)`;
        }
      } else {
        // Standard rules for all other years
        if (age === 0) {
          points = 1.5;
          description = 'Birth year (standard)';
        } else if (age >= 1 && age <= 17) {
          points = 1.0;
          description = `Age ${age} (standard)`;
        } else if (age === 18) {
          points = 0.5;
          description = 'Age 18';
        }
      }
      
      // Children aged 6-17: special rule introduced in 2024
      if (age >= 6 && age <= 17) {
        // Each parent gets 1 point per child (or 2 for single parent)
        points = inputs.isSingleParent ? 2.0 : 1.0;
        description = `Age ${age} - ${inputs.isSingleParent ? 'Single parent (2 pts)' : 'Per parent (1 pt)'}`;
      }
      
      if (points > 0) {
        credits.push({
          category: `Child ${index + 1}`,
          points,
          description: `${description} = ₪${Math.round(points * config.value_per_point_monthly)}/month`
        });
      }
    });
  }
  
  // C_CHILDREN_SPECIAL_NEEDS: 2 points per qualifying dependent
  // Note: Currently using hasDisability flag. Would need more specific inputs for proper implementation.
  if (inputs.hasDisability && inputs.numberOfChildren > 0 && inputs.isResident) {
    const points = 2.0; // 2 points per qualifying dependent
    credits.push({
      category: 'Special Needs Child/Dependent',
      points,
      description: 'Credit for child or adult with disabilities (severe disability, blindness, disability ≥50%)'
    });
  }
  
  // C_SINGLE_PARENT: 1 point per child (remains valid even after remarriage)
  if (inputs.isSingleParent && inputs.numberOfChildren > 0 && inputs.isResident) {
    const points = inputs.numberOfChildren * 1.0;
    credits.push({
      category: 'Single Parent',
      points,
      description: `Single parent credit (1 pt × ${inputs.numberOfChildren} children)`
    });
  }
  
  // C_CHILD_SUPPORT: 1 point total for child support (alimony for children)
  // If both parents support children, point is split proportionally
  // Note: This would require additional input fields. Placeholder for future implementation.
  
  // Army/National service - check 36-month validity from discharge
  if (inputs.hasArmyService && inputs.armyDischargeDate && inputs.isResident) {
    const monthsSinceDischarge = calculateMonthsSince(inputs.armyDischargeDate);
    
    if (monthsSinceDischarge <= 36) {
      const points = inputs.armyServiceMonths >= 23 ? config.army_service_long : config.army_service_short;
      const serviceType = inputs.armyServiceMonths >= 23 ? 'long service (≥23 months)' : 'short service (12-22 months)';
      const remainingMonths = 36 - monthsSinceDischarge;
      
      credits.push({
        category: 'Army/National Service',
        points,
        description: `Credit for ${serviceType} (${remainingMonths} months remaining of 36-month benefit)`
      });
    }
  }
  
  // C_EDUCATION: academic or teaching degrees
  // Only one track may be chosen per year (except BA + PhD, which may be combined)
  if (inputs.isResident && inputs.graduationDate) {
    const monthsSinceGraduation = calculateMonthsSince(inputs.graduationDate);
    const yearsSinceGraduation = Math.floor(monthsSinceGraduation / 12);
    
    switch (inputs.educationLevel) {
      case 'bachelor':
        // Bachelor: 1 point per year, up to 3 years
        if (yearsSinceGraduation < 3) {
          credits.push({
            category: 'Bachelor Degree (BA)',
            points: 1.0,
            description: `Academic degree credit (year ${yearsSinceGraduation + 1} of 3)`
          });
        }
        break;
        
      case 'master':
        // Master: 0.5 point per year, up to 2 years
        if (yearsSinceGraduation < 2) {
          credits.push({
            category: 'Master Degree (MA)',
            points: 0.5,
            description: `Master degree credit (year ${yearsSinceGraduation + 1} of 2)`
          });
        }
        break;
        
      case 'doctorate':
        // PhD (immediately after BA): 0.5 point per year, up to 2 years
        // Note: BA + PhD can be combined. Would need additional logic for this.
        if (yearsSinceGraduation < 2) {
          credits.push({
            category: 'Doctoral Degree (PhD)',
            points: 0.5,
            description: `PhD credit (year ${yearsSinceGraduation + 1} of 2)`
          });
        }
        break;
        
      case 'professional':
        // Teaching diploma (no academic degree): 1 point per year, up to 3 years
        // OR Professional training: 1 point per year, up to 3 years (≥1,700 hours)
        // Note: Would need to distinguish between teaching diploma and professional training
        if (yearsSinceGraduation < 3) {
          credits.push({
            category: 'Professional Certificate/Training',
            points: 1.0,
            description: `Professional certificate credit (year ${yearsSinceGraduation + 1} of 3)`
          });
        }
        break;
    }
    
    // Medical/dental degree: 1 point per year for 3 years, then 0.5 point per year for 2 years
    // Note: This would require a separate education level input. Placeholder for future implementation.
  }
  
  // C_PROFESSIONAL_TRAINING: 1 point per year for vocational training programs
  // Conditions: program ≥1,700 hours, max 3 years, cannot be combined with academic credits
  // Note: Currently handled under 'professional' education level above.
  
  return credits;
}

/**
 * Calculate total credit points and monetary values
 */
export function calculateCreditSummary(
  credits: CreditPointBreakdown[],
  config: CreditPointsConfig,
  monthsWorked: number = 12
) {
  const totalPoints = credits.reduce((sum, credit) => sum + credit.points, 0);
  const annualCredit = totalPoints * config.value_per_point_annual;
  const monthlyCredit = totalPoints * config.value_per_point_monthly;
  const proratedAnnualCredit = (totalPoints * config.value_per_point_monthly * monthsWorked);
  
  return {
    totalCreditPoints: totalPoints,
    annualTaxCreditNIS: annualCredit,
    monthlyTaxCreditNIS: monthlyCredit,
    annualTaxCreditProratedNIS: proratedAnnualCredit
  };
}

function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

function calculateMonthsSince(date: Date): number {
  const now = new Date();
  const months = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
  return months;
}
