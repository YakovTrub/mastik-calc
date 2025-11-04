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
