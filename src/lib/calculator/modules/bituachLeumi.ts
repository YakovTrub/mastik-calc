import type { BituachLeumiConfig } from '@/types/calculator';

export function calculateBituachLeumiEmployee(
  grossSalary: number,
  config: BituachLeumiConfig
): number {
  const { bituach_leumi_threshold_1, bituach_leumi_threshold_2, bituach_leumi_rate_1, bituach_leumi_rate_2 } = config;
  
  let bituachLeumi = 0;
  
  if (grossSalary <= bituach_leumi_threshold_1) {
    bituachLeumi = grossSalary * bituach_leumi_rate_1;
  } else if (grossSalary <= bituach_leumi_threshold_2) {
    bituachLeumi = (bituach_leumi_threshold_1 * bituach_leumi_rate_1) +
                   ((grossSalary - bituach_leumi_threshold_1) * bituach_leumi_rate_2);
  } else {
    bituachLeumi = (bituach_leumi_threshold_1 * bituach_leumi_rate_1) +
                   ((bituach_leumi_threshold_2 - bituach_leumi_threshold_1) * bituach_leumi_rate_2);
  }
  
  return bituachLeumi;
}

export function calculateBituachLeumiSelfEmployed(
  profit: number,
  config: BituachLeumiConfig
): { contribution: number; deductibleAmount: number } {
  const { 
    bituach_leumi_threshold_1, 
    bituach_leumi_threshold_2, 
    self_employed_rate_1, 
    self_employed_rate_2,
    self_employed_min_income,
    self_employed_deduction_rate
  } = config;
  
  // Apply minimum income floor
  const adjustedProfit = Math.max(profit, self_employed_min_income);
  
  let contribution = 0;
  
  if (adjustedProfit <= bituach_leumi_threshold_1) {
    contribution = adjustedProfit * self_employed_rate_1;
  } else if (adjustedProfit <= bituach_leumi_threshold_2) {
    contribution = (bituach_leumi_threshold_1 * self_employed_rate_1) +
                   ((adjustedProfit - bituach_leumi_threshold_1) * self_employed_rate_2);
  } else {
    contribution = (bituach_leumi_threshold_1 * self_employed_rate_1) +
                   ((bituach_leumi_threshold_2 - bituach_leumi_threshold_1) * self_employed_rate_2);
  }
  
  // 52% of BL contribution is deductible from taxable income
  const deductibleAmount = contribution * self_employed_deduction_rate;
  
  return { contribution, deductibleAmount };
}

export function calculateBituachLeumiCombined(
  employeeSalary: number,
  selfEmployedProfit: number,
  config: BituachLeumiConfig
): { employeeContribution: number; selfEmployedContribution: number; selfEmployedDeductible: number } {
  const { bituach_leumi_threshold_1, self_employed_rate_1, self_employed_rate_2 } = config;
  
  // Employee portion uses standard rates
  const employeeContribution = calculateBituachLeumiEmployee(employeeSalary, config);
  
  // Self-employed portion: adjust based on employee salary
  let selfEmployedContribution = 0;
  let remainingThreshold1 = Math.max(0, bituach_leumi_threshold_1 - employeeSalary);
  
  if (remainingThreshold1 > 0) {
    const profitAtRate1 = Math.min(selfEmployedProfit, remainingThreshold1);
    selfEmployedContribution += profitAtRate1 * self_employed_rate_1;
    
    const profitAtRate2 = Math.max(0, selfEmployedProfit - remainingThreshold1);
    selfEmployedContribution += profitAtRate2 * self_employed_rate_2;
  } else {
    selfEmployedContribution = selfEmployedProfit * self_employed_rate_2;
  }
  
  const selfEmployedDeductible = selfEmployedContribution * config.self_employed_deduction_rate;
  
  return { employeeContribution, selfEmployedContribution, selfEmployedDeductible };
}

export function calculateBituachLeumiMultipleJobs(
  salaries: number[],
  config: BituachLeumiConfig
): number[] {
  const { bituach_leumi_threshold_1, bituach_leumi_threshold_2, bituach_leumi_rate_1, bituach_leumi_rate_2 } = config;
  
  const totalSalary = salaries.reduce((sum, s) => sum + s, 0);
  const maxContribution = calculateBituachLeumiEmployee(Math.min(totalSalary, bituach_leumi_threshold_2), config);
  
  let contributions: number[] = [];
  let accumulatedSalary = 0;
  
  salaries.forEach((salary) => {
    let contribution = 0;
    const startThreshold = accumulatedSalary;
    const endThreshold = accumulatedSalary + salary;
    
    // Calculate for tier 1
    if (startThreshold < bituach_leumi_threshold_1) {
      const tier1Amount = Math.min(salary, bituach_leumi_threshold_1 - startThreshold);
      contribution += tier1Amount * bituach_leumi_rate_1;
    }
    
    // Calculate for tier 2
    if (endThreshold > bituach_leumi_threshold_1 && startThreshold < bituach_leumi_threshold_2) {
      const tier2Start = Math.max(startThreshold, bituach_leumi_threshold_1);
      const tier2End = Math.min(endThreshold, bituach_leumi_threshold_2);
      const tier2Amount = Math.max(0, tier2End - tier2Start);
      contribution += tier2Amount * bituach_leumi_rate_2;
    }
    
    contributions.push(contribution);
    accumulatedSalary = endThreshold;
  });
  
  // Ensure total doesn't exceed maximum
  const totalContributions = contributions.reduce((sum, c) => sum + c, 0);
  if (totalContributions > maxContribution) {
    const ratio = maxContribution / totalContributions;
    contributions = contributions.map(c => c * ratio);
  }
  
  return contributions;
}

export function calculateBituachLeumiEmployer(
  grossSalary: number,
  config: BituachLeumiConfig
): number {
  // Employer BL uses same thresholds but different rates (employer rates include no health)
  const { bituach_leumi_threshold_1, bituach_leumi_threshold_2, employer_rate_1, employer_rate_2 } = config;
  
  let bituachLeumi = 0;
  
  if (grossSalary <= bituach_leumi_threshold_1) {
    bituachLeumi = grossSalary * employer_rate_1;
  } else if (grossSalary <= bituach_leumi_threshold_2) {
    bituachLeumi = (bituach_leumi_threshold_1 * employer_rate_1) +
                   ((grossSalary - bituach_leumi_threshold_1) * employer_rate_2);
  } else {
    bituachLeumi = (bituach_leumi_threshold_1 * employer_rate_1) +
                   ((bituach_leumi_threshold_2 - bituach_leumi_threshold_1) * employer_rate_2);
  }
  
  return bituachLeumi;
}
