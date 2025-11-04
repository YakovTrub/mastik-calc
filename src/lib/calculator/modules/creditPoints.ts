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
  
  // Single parent (1 pt)
  if (inputs.isSingleParent && inputs.isResident) {
    credits.push({
      category: 'Single Parent',
      points: config.single_parent,
      description: 'Credit for single/divorced parents raising children alone'
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
  
  // Children credits
  if (inputs.isResident) {
    inputs.childrenAges.forEach((age, index) => {
      if (age <= 5) {
        let points = config.children_year_4_5;
        let yearDesc = '4-5';
        
        if (age <= 2) {
          points = config.children_year_1_2;
          yearDesc = '1-2';
        } else if (age === 3) {
          points = config.children_year_3;
          yearDesc = '3';
        }
        
        credits.push({
          category: `Child ${index + 1} (Age ${age})`,
          points,
          description: `Credit for child in year ${yearDesc} (${points} pts = ≈${Math.round(points * config.value_per_point_monthly * 12)} ₪/year)`
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
  
  // Army/National service
  if (inputs.hasArmyService && inputs.isResident) {
    const points = inputs.armyServiceMonths >= 23 ? config.army_service_long : config.army_service_short;
    const serviceType = inputs.armyServiceMonths >= 23 ? 'long service (≥23 months)' : 'short service (12-22 months)';
    credits.push({
      category: 'Army Service',
      points,
      description: `Credit for ${serviceType}, valid for 36 months post-discharge`
    });
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
  
  // Education credits (mutually exclusive)
  if (inputs.isResident) {
    if (inputs.educationLevel === 'bachelor') {
      credits.push({
        category: 'Bachelor Degree',
        points: config.academic_degree_annual,
        description: `Academic degree credit (1 pt/year for up to ${config.academic_degree_years} years from 2023+)`
      });
    } else if (inputs.educationLevel === 'master') {
      credits.push({
        category: 'Bachelor Degree',
        points: config.academic_degree_annual,
        description: 'Academic degree credit (base)'
      });
      credits.push({
        category: 'Master Degree',
        points: config.masters_degree_annual,
        description: `Advanced degree credit (0.5 pt/year for up to ${config.masters_degree_years} years from 2023+)`
      });
    } else if (inputs.educationLevel === 'doctorate') {
      const docPoints = config.academic_degree_annual + config.masters_degree_annual + 1;
      credits.push({
        category: 'Bachelor + Master + PhD',
        points: docPoints,
        description: 'Doctoral/Medical/Dental degree credits (cumulative academic credits)'
      });
    } else if (inputs.educationLevel === 'professional') {
      credits.push({
        category: 'Professional Certificate',
        points: config.professional_certificate_annual,
        description: `Technician/Teacher/Engineer certificate (1 pt/year for up to ${config.professional_certificate_years} years, 2023+)`
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
