import taxRules from '@/config/taxRules2025.json';
import type { CalculatorInputs, CalculationResult, DeductionBreakdown, CreditPointBreakdown } from '@/types/calculator';

export function calculateNetSalary(inputs: CalculatorInputs): CalculationResult {
  const { grossSalary } = inputs;
  
  // Step 1: Calculate Bituach Leumi (Social Security)
  const bituachLeumi = calculateBituachLeumi(grossSalary);
  
  // Step 2: Calculate Pension
  const pensionEmployee = grossSalary * taxRules.pension.employee_rate;
  const pensionEmployer = grossSalary * taxRules.pension.employer_pension_rate;
  const severanceEmployer = grossSalary * taxRules.pension.employer_severance_rate;
  
  // Step 3: Calculate Taxable Base
  const taxableBase = grossSalary 
    - bituachLeumi 
    - pensionEmployee 
    - inputs.voluntaryPension;
  
  // Step 4: Calculate Income Tax Before Credits
  const incomeTaxBeforeCredits = calculateIncomeTax(taxableBase);
  
  // Step 5: Calculate Credit Points
  const creditPointsData = calculateCreditPoints(inputs);
  const creditPoints = creditPointsData.reduce((sum, item) => sum + item.points, 0);
  const creditValue = creditPoints * taxRules.credit_points.value_per_point_monthly;
  
  // Step 6: Calculate Income Tax After Credits
  const incomeTaxAfterCredits = Math.max(0, incomeTaxBeforeCredits - creditValue);
  
  // Step 7: Apply Locality Discount
  const localityDiscount = calculateLocalityDiscount(inputs.locality, incomeTaxAfterCredits, grossSalary);
  const finalIncomeTax = incomeTaxAfterCredits - localityDiscount;
  
  // Step 8: Calculate Total Deductions and Net Salary
  const totalDeductions = finalIncomeTax + bituachLeumi + pensionEmployee;
  const netSalary = grossSalary - totalDeductions;
  
  // Breakdown
  const breakdown: DeductionBreakdown[] = [
    {
      category: 'Income Tax',
      amount: finalIncomeTax,
      isTaxDeductible: false,
      description: 'Progressive income tax after credits and discounts'
    },
    {
      category: 'Bituach Leumi & Health',
      amount: bituachLeumi,
      isTaxDeductible: true,
      description: 'Social security and health insurance contributions'
    },
    {
      category: 'Pension (Employee)',
      amount: pensionEmployee,
      isTaxDeductible: true,
      description: '6% mandatory pension contribution'
    }
  ];
  
  if (inputs.voluntaryPension > 0) {
    breakdown.push({
      category: 'Voluntary Pension',
      amount: inputs.voluntaryPension,
      isTaxDeductible: true,
      description: 'Additional voluntary pension contribution'
    });
  }
  
  return {
    grossSalary,
    taxableBase,
    incomeTaxBeforeCredits,
    creditPoints,
    creditValue,
    incomeTaxAfterCredits,
    bituachLeumiEmployee: bituachLeumi,
    pensionEmployee,
    pensionEmployer,
    severanceEmployer,
    localityDiscount,
    totalDeductions,
    netSalary,
    breakdown
  };
}

function calculateBituachLeumi(grossSalary: number): number {
  const rules = taxRules.social_security;
  let bituachLeumi = 0;
  
  if (grossSalary <= rules.bituach_leumi_threshold_1) {
    bituachLeumi = grossSalary * rules.bituach_leumi_rate_1;
  } else if (grossSalary <= rules.bituach_leumi_threshold_2) {
    bituachLeumi = (rules.bituach_leumi_threshold_1 * rules.bituach_leumi_rate_1) +
                   ((grossSalary - rules.bituach_leumi_threshold_1) * rules.bituach_leumi_rate_2);
  } else {
    bituachLeumi = (rules.bituach_leumi_threshold_1 * rules.bituach_leumi_rate_1) +
                   ((rules.bituach_leumi_threshold_2 - rules.bituach_leumi_threshold_1) * rules.bituach_leumi_rate_2);
  }
  
  return bituachLeumi;
}

function calculateIncomeTax(taxableIncome: number): number {
  let tax = 0;
  let previousMax = 0;
  
  for (const bracket of taxRules.income_tax_brackets) {
    const min = bracket.min;
    const max = bracket.max || Infinity;
    
    if (taxableIncome > min) {
      const taxableInBracket = Math.min(taxableIncome, max) - min;
      tax += taxableInBracket * bracket.rate;
    }
    
    if (taxableIncome <= max) break;
    previousMax = max;
  }
  
  return tax;
}

export function calculateCreditPoints(inputs: CalculatorInputs): CreditPointBreakdown[] {
  const credits: CreditPointBreakdown[] = [];
  const rules = taxRules.credit_points;
  
  // Base resident credit (2.25 pts = 2 pts + 0.25 travel credit)
  credits.push({
    category: 'Resident (Base)',
    points: rules.base_resident,
    description: 'Basic credit for all Israeli residents (includes 0.25 travel credit)'
  });
  
  // Gender credit (0.5 pts for women)
  if (inputs.gender === 'female') {
    credits.push({
      category: 'Women',
      points: rules.women,
      description: 'Additional credit for female residents'
    });
  }
  
  // Working youth (16-18 years old) or spouse under 18
  if (inputs.dateOfBirth) {
    const age = calculateAge(inputs.dateOfBirth);
    if (age >= 16 && age <= 18) {
      credits.push({
        category: 'Working Youth',
        points: rules.working_youth,
        description: 'Credit for working youth aged 16-18'
      });
    }
  }
  
  // Single parent (1 pt)
  if (inputs.isSingleParent) {
    credits.push({
      category: 'Single Parent',
      points: rules.single_parent,
      description: 'Credit for single/divorced parents raising children alone'
    });
  }
  
  // Spouse with no income (1 pt, or 0.5 if filing separately)
  if (inputs.hasSpouseNoIncome && inputs.maritalStatus === 'married') {
    credits.push({
      category: 'Spouse No Income',
      points: rules.spouse_no_income,
      description: 'Credit for supporting spouse without income (pensioner/disabled)'
    });
  }
  
  // Children credits (age-dependent, applies to children under 6)
  inputs.childrenAges.forEach((age, index) => {
    if (age <= 5) {
      let points = rules.children_year_4_5;
      let yearDesc = '4-5';
      
      if (age <= 2) {
        points = rules.children_year_1_2;
        yearDesc = '1-2';
      } else if (age === 3) {
        points = rules.children_year_3;
        yearDesc = '3';
      }
      
      credits.push({
        category: `Child ${index + 1} (Age ${age})`,
        points,
        description: `Credit for child in year ${yearDesc} (${points} pts = ≈${Math.round(points * 2904)} ₪/year)`
      });
    }
  });
  
  // Disabled child credit (2 pts per disabled child)
  if (inputs.hasDisability && inputs.numberOfChildren > 0) {
    credits.push({
      category: 'Disabled Child',
      points: rules.disabled_child,
      description: 'Credit for parent of disabled child (may split between parents)'
    });
  }
  
  // Army/National service (1-2 pts, valid for 36 months post-service)
  if (inputs.hasArmyService) {
    const points = inputs.armyServiceMonths >= 23 ? rules.army_service_long : rules.army_service_short;
    const serviceType = inputs.armyServiceMonths >= 23 ? 'long service (≥23 months)' : 'short service (12-22 months)';
    credits.push({
      category: 'Army Service',
      points,
      description: `Credit for ${serviceType}, valid for 36 months post-discharge`
    });
  }
  
  // New immigrant - Oleh Chadash (variable pts, gradual reduction over 42-54 months)
  if (inputs.isNewImmigrant && inputs.immigrationDate) {
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
  
  // Education credits (mutually exclusive: academic OR professional)
  if (inputs.educationLevel === 'bachelor') {
    credits.push({
      category: 'Bachelor Degree',
      points: rules.academic_degree_annual,
      description: `Academic degree credit (1 pt/year for up to ${rules.academic_degree_years} years from 2023+)`
    });
  } else if (inputs.educationLevel === 'master') {
    // Master's includes bachelor credit
    credits.push({
      category: 'Bachelor Degree',
      points: rules.academic_degree_annual,
      description: 'Academic degree credit (base)'
    });
    credits.push({
      category: 'Master Degree',
      points: rules.masters_degree_annual,
      description: `Advanced degree credit (0.5 pt/year for up to ${rules.masters_degree_years} years from 2023+)`
    });
  } else if (inputs.educationLevel === 'doctorate') {
    // Doctorate includes bachelor + master + PhD credits
    const docPoints = rules.academic_degree_annual + rules.masters_degree_annual + 1;
    credits.push({
      category: 'Bachelor + Master + PhD',
      points: docPoints,
      description: 'Doctoral/Medical/Dental degree credits (cumulative academic credits)'
    });
  } else if (inputs.educationLevel === 'professional') {
    // Professional certificate (cannot combine with academic)
    credits.push({
      category: 'Professional Certificate',
      points: rules.professional_certificate_annual,
      description: `Technician/Teacher/Engineer certificate (1 pt/year for up to ${rules.professional_certificate_years} years, 2023+)`
    });
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

function calculateLocalityDiscount(locality: string, incomeTax: number, grossSalary: number): number {
  if (!locality || locality === 'none') return 0;
  
  const localityData = taxRules.locality_discounts.find(
    loc => loc.name === locality || loc.name_he === locality
  );
  
  if (!localityData) return 0;
  
  if (grossSalary <= localityData.max_income) {
    return incomeTax * localityData.discount_percent;
  }
  
  return 0;
}

function calculateMonthsSince(date: Date): number {
  const now = new Date();
  const months = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
  return months;
}
