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
  
  // Base resident credit
  credits.push({
    category: 'Resident (Base)',
    points: rules.base_resident,
    description: 'Basic credit for all Israeli residents (includes travel credit)'
  });
  
  // Gender credit
  if (inputs.gender === 'female') {
    credits.push({
      category: 'Women',
      points: rules.women,
      description: 'Additional credit for female residents'
    });
  }
  
  // Single parent
  if (inputs.isSingleParent) {
    credits.push({
      category: 'Single Parent',
      points: rules.single_parent,
      description: 'Credit for single parents raising children'
    });
  }
  
  // Spouse with no income
  if (inputs.hasSpouseNoIncome && inputs.maritalStatus === 'married') {
    credits.push({
      category: 'Spouse No Income',
      points: rules.spouse_no_income,
      description: 'Credit for supporting spouse without income'
    });
  }
  
  // Children credits
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
        description: `Credit for child in year ${yearDesc} of life`
      });
    }
  });
  
  // Army service
  if (inputs.hasArmyService) {
    const points = inputs.armyServiceMonths >= 23 ? rules.army_service_long : rules.army_service_short;
    credits.push({
      category: 'Army Service',
      points,
      description: `Credit for ${inputs.armyServiceMonths} months of service (36 months post-service)`
    });
  }
  
  // New immigrant
  if (inputs.isNewImmigrant && inputs.immigrationDate) {
    const monthsSinceImmigration = calculateMonthsSince(inputs.immigrationDate);
    if (monthsSinceImmigration < rules.new_immigrant_duration_months) {
      const points = rules.new_immigrant_monthly * (rules.new_immigrant_duration_months - monthsSinceImmigration);
      credits.push({
        category: 'New Immigrant',
        points: parseFloat(points.toFixed(2)),
        description: `Credit for new immigrants (months remaining: ${rules.new_immigrant_duration_months - monthsSinceImmigration})`
      });
    }
  }
  
  // Education credits
  if (inputs.educationLevel === 'bachelor') {
    credits.push({
      category: 'Bachelor Degree',
      points: rules.academic_degree_annual,
      description: `Academic degree credit (up to ${rules.academic_degree_years} years)`
    });
  } else if (inputs.educationLevel === 'master') {
    credits.push({
      category: 'Bachelor Degree',
      points: rules.academic_degree_annual,
      description: 'Academic degree credit'
    });
    credits.push({
      category: 'Master Degree',
      points: rules.masters_degree_annual,
      description: 'Advanced degree credit'
    });
  } else if (inputs.educationLevel === 'doctorate') {
    credits.push({
      category: 'Bachelor + Master + PhD',
      points: rules.academic_degree_annual + rules.masters_degree_annual + 1,
      description: 'Doctoral degree credits'
    });
  } else if (inputs.educationLevel === 'professional') {
    credits.push({
      category: 'Professional Certificate',
      points: rules.professional_certificate_annual,
      description: 'Technician/Teacher/Engineer certificate'
    });
  }
  
  return credits;
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
