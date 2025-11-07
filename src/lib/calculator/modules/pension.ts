import type { PensionConfig } from '@/types/calculator';

export interface PensionResult {
  employeeContribution: number;
  employerPension: number;
  employerSeverance: number;
  taxCredit35Percent: number;
  taxableBenefitToEmployee: number;
}

export function calculatePension(
  grossSalary: number,
  pensionBase: number,
  config: PensionConfig
): PensionResult {
  const {
    employee_rate,
    employer_pension_rate,
    employer_severance_rate,
    recognized_wage_ceiling,
    max_recognized_employee_7pct,
    employer_recognized_base,
    severance_info_base
  } = config;
  
  // Employee pension contribution (6%)
  const employeeContribution = pensionBase * employee_rate;
  
  // Employer pension contributions
  const employerPension = pensionBase * employer_pension_rate;
  const employerSeverance = pensionBase * employer_severance_rate;
  
  // Tax credit 35% on employee contribution (max 7% of 9,700 = 679₪)
  const taxCredit35Percent = Math.min(employeeContribution, max_recognized_employee_7pct) * 0.35;
  
  // If pension base exceeds employer_recognized_base (33,290₪), 
  // the employer pension portion above becomes a taxable benefit to the employee
  let taxableBenefitToEmployee = 0;
  if (pensionBase > employer_recognized_base) {
    const excessBase = pensionBase - employer_recognized_base;
    taxableBenefitToEmployee = excessBase * employer_pension_rate;
  }
  
  return {
    employeeContribution,
    employerPension,
    employerSeverance,
    taxCredit35Percent,
    taxableBenefitToEmployee
  };
}

export function calculateSelfEmployedPension(
  profit: number,
  config: PensionConfig
): PensionResult {
  const { self_employed_min_rate, self_employed_employer_rate, max_recognized_employee_7pct } = config;
  
  // Self-employed must contribute minimum 4.45% + 12.55%
  const totalRate = self_employed_min_rate + self_employed_employer_rate;
  const totalContribution = profit * totalRate;
  
  // Split into employee and employer portions for calculation
  const employeeContribution = profit * self_employed_min_rate;
  const employerPension = profit * self_employed_employer_rate;
  
  // 35% tax credit on up to 679₪/month (8,148₪/year)
  const taxCredit35Percent = Math.min(employeeContribution, max_recognized_employee_7pct) * 0.35;
  
  return {
    employeeContribution,
    employerPension,
    employerSeverance: 0,
    taxCredit35Percent,
    taxableBenefitToEmployee: 0
  };
}
