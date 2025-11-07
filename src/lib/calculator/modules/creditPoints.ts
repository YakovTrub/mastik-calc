import type { CalculatorInputs, CreditPointBreakdown, CreditPointsConfig } from '@/types/calculator';

export function calculateCreditPoints(
  inputs: CalculatorInputs,
  config: CreditPointsConfig
): CreditPointBreakdown[] {
  const credits: CreditPointBreakdown[] = [];
  
  // Base resident credit (2.25 pts = 2 pts + 0.25 travel credit)
  if (inputs.isResident) {
    credits.push({
      category: 'Resident (Base)',
      points: config.base_resident,
      description: 'Basic credit for all Israeli residents (includes 0.25 travel credit)'
    });
  }
  
  // Gender credit (0.5 pts for women)
  if (inputs.gender === 'female' && inputs.isResident) {
    credits.push({
      category: 'Women',
      points: config.women,
      description: 'Additional credit for female residents'
    });
  }
  
  // Working youth (16-18 years old)
  if (inputs.dateOfBirth && inputs.isResident) {
    const age = calculateAge(inputs.dateOfBirth);
    if (age >= 16 && age <= 18) {
      credits.push({
        category: 'Working Youth',
        points: config.working_youth,
        description: 'Credit for working youth aged 16-18'
      });
    }
  }
  
  // Single parent - additional +1 point per child
  if (inputs.isSingleParent && inputs.numberOfChildren > 0 && inputs.isResident) {
    const additionalPoints = inputs.numberOfChildren * 1;
    credits.push({
      category: 'Single Parent',
      points: additionalPoints,
      description: `Additional credit for single parent (+1 per child, ${inputs.numberOfChildren} children)`
    });
  }
  
  // Spouse with no income (1 pt)
  if (inputs.hasSpouseNoIncome && inputs.maritalStatus === 'married' && inputs.isResident) {
    credits.push({
      category: 'Spouse No Income',
      points: config.spouse_no_income,
      description: 'Credit for supporting spouse without income (pensioner/disabled)'
    });
  }
  
  // Children credits - New 2024 system for 0-5 years
  if (inputs.isResident) {
    inputs.childrenAges.forEach((age, index) => {
      if (age <= 5) {
        // New 2024 system: Year 0: 2.5, Year 1: 4.5, Year 2: 4.5, Year 3: 3.5, Year 4-5: 2.5
        let points = 2.5; // Default for ages 0, 4, 5
        let yearDesc = age === 0 ? '0 (birth)' : '4-5';
        
        if (age === 1 || age === 2) {
          points = 4.5;
          yearDesc = age === 1 ? '1' : '2';
        } else if (age === 3) {
          points = 3.5;
          yearDesc = '3';
        } else if (age >= 4) {
          yearDesc = '4-5';
        }
        
        credits.push({
          category: `Child ${index + 1} (Age ${age})`,
          points,
          description: `Credit for child year ${yearDesc} (${points} pts = ≈₪${Math.round(points * config.value_per_point_monthly)} monthly)`
        });
      } else if (age >= 6 && age <= 17) {
        // Ages 6-17: +1 point per parent (or +2 for single parent)
        const points = inputs.isSingleParent ? 2 : 1;
        credits.push({
          category: `Child ${index + 1} (Age ${age})`,
          points,
          description: `Credit for child age 6-17 (${points} pt${points > 1 ? 's' : ''} ${inputs.isSingleParent ? 'single parent' : 'per parent'})`
        });
      } else if (age === 18) {
        // Age 18: 0.5 points
        credits.push({
          category: `Child ${index + 1} (Age ${age})`,
          points: 0.5,
          description: 'Credit for child age 18 (0.5 pts)'
        });
      }
    });
  }
  
  // Disabled child credit
  if (inputs.hasDisability && inputs.numberOfChildren > 0 && inputs.isResident) {
    credits.push({
      category: 'Disabled Child',
      points: config.disabled_child,
      description: 'Credit for parent of disabled child (may split between parents)'
    });
  }
  
  // Army/National service - check 36-month validity from discharge
  if (inputs.hasArmyService && inputs.armyDischargeDate && inputs.isResident) {
    const monthsSinceDischarge = calculateMonthsSince(inputs.armyDischargeDate);
    
    if (monthsSinceDischarge <= 36) {
      const points = inputs.armyServiceMonths >= 23 ? config.army_service_long : config.army_service_short;
      const serviceType = inputs.armyServiceMonths >= 23 ? 'long service (≥23 months)' : 'short service (12-22 months)';
      const remainingMonths = 36 - monthsSinceDischarge;
      
      credits.push({
        category: 'Army Service',
        points,
        description: `Credit for ${serviceType} (${remainingMonths} months remaining of 36-month benefit)`
      });
    }
  }
  
  // New immigrant - Oleh Chadash (3, 2, 1 points per month)
  if (inputs.isNewImmigrant && inputs.immigrationDate && inputs.isResident) {
    const monthsSinceImmigration = calculateMonthsSince(inputs.immigrationDate);
    const immigrationYear = inputs.immigrationDate.getFullYear();
    const isAfter2022 = immigrationYear >= 2023;
    
    let monthlyPoints = 0;
    let maxDuration = isAfter2022 ? 54 : 42;
    
    if (monthsSinceImmigration < maxDuration) {
      if (isAfter2022) {
        // After 2022: 1 pt (months 1-12), 3 pts (months 13-30), 2 pts (months 31-42), 1 pt (months 43-54)
        if (monthsSinceImmigration < 12) {
          monthlyPoints = 1;
        } else if (monthsSinceImmigration < 30) {
          monthlyPoints = 3;
        } else if (monthsSinceImmigration < 42) {
          monthlyPoints = 2;
        } else {
          monthlyPoints = 1;
        }
      } else {
        // Before 2022: 3 pts (months 1-18), 2 pts (months 19-30), 1 pt (months 31-42)
        if (monthsSinceImmigration < 18) {
          monthlyPoints = 3;
        } else if (monthsSinceImmigration < 30) {
          monthlyPoints = 2;
        } else {
          monthlyPoints = 1;
        }
      }
      
      credits.push({
        category: 'New Immigrant',
        points: monthlyPoints,
        description: `Oleh Chadash monthly credit (month ${monthsSinceImmigration + 1} of ${maxDuration}, ${monthlyPoints} pts/month ≈ ₪${Math.round(monthlyPoints * 242)}/month)`
      });
    }
  }
  
  // Education credits with time-based expiry
  if (inputs.isResident && inputs.graduationDate) {
    const monthsSinceGraduation = calculateMonthsSince(inputs.graduationDate);
    const yearsSinceGraduation = Math.floor(monthsSinceGraduation / 12);
    
    if (inputs.educationLevel === 'bachelor' && yearsSinceGraduation < config.academic_degree_years) {
      credits.push({
        category: 'Bachelor Degree',
        points: config.academic_degree_annual,
        description: `Academic degree credit (year ${yearsSinceGraduation + 1} of ${config.academic_degree_years})`
      });
    } else if (inputs.educationLevel === 'master' && yearsSinceGraduation < config.masters_degree_years) {
      credits.push({
        category: 'Master Degree',
        points: config.academic_degree_annual + config.masters_degree_annual,
        description: `Advanced degree credit (year ${yearsSinceGraduation + 1} of ${config.masters_degree_years})`
      });
    } else if (inputs.educationLevel === 'doctorate' && yearsSinceGraduation < config.masters_degree_years) {
      const docPoints = config.academic_degree_annual + config.masters_degree_annual + 1;
      credits.push({
        category: 'Doctoral Degree',
        points: docPoints,
        description: `Doctoral degree credit (year ${yearsSinceGraduation + 1} of ${config.masters_degree_years})`
      });
    } else if (inputs.educationLevel === 'professional' && yearsSinceGraduation < config.professional_certificate_years) {
      credits.push({
        category: 'Professional Certificate',
        points: config.professional_certificate_annual,
        description: `Professional certificate (year ${yearsSinceGraduation + 1} of ${config.professional_certificate_years})`
      });
    }
  }
  
  return credits;
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
