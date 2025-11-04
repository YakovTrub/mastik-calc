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
