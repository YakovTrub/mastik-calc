export type EmploymentType = 'employee' | 'self_employed' | 'combined' | 'multiple_employers';

export interface JobIncome {
  id: string;
  grossSalary: number;
  pensionRate: number;
  creditPointsPercent: number; // Percentage of credit points allocated to this job
}

export type SelfEmploymentType = 'esek_patur' | 'esek_murshe' | 'esek_zair';

export interface SelfEmployedIncome {
  type: SelfEmploymentType;
  revenue: number;
  expenseRate: number; // 30% default or actual expenses percentage
  actualExpenses?: number;
}

export interface CalculatorInputs {
  // Employment type
  employmentType: EmploymentType;
  
  // For employees (single job)
  grossSalary: number;
  pensionBase?: number;
  
  // For multiple employers
  jobs: JobIncome[];
  
  // For self-employed
  selfEmployedIncome: SelfEmployedIncome | null;
  
  // Basic info
  isResident: boolean;
  
  // Personal details
  gender: 'male' | 'female';
  dateOfBirth: Date | null;
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  
  // Family
  numberOfChildren: number;
  childrenAges: number[];
  isSingleParent: boolean;
  hasSpouseNoIncome: boolean;
  
  // Service & Immigration
  hasArmyService: boolean;
  armyServiceMonths: number;
  armyDischargeDate: Date | null;
  isNewImmigrant: boolean;
  immigrationDate: Date | null;
  
  // Disability
  hasDisability: boolean;
  hasDisabilityExemption: boolean;
  
  // Location
  locality: string;
  
  // Additional income & deductions
  voluntaryPension: number;
  hasSecondJob: boolean;
  secondJobIncome: number;
  hasTeumMas: boolean; // Tax coordination for multiple jobs
  
  // Education
  educationLevel: 'none' | 'bachelor' | 'master' | 'doctorate' | 'professional';
  graduationDate: Date | null;
  
  // Fringe benefits (taxable)
  fringeBenefits: {
    car: number;
    phone: number;
    meals: number;
    other: number;
  };
  
  // Donations (§46)
  donations: number;
  
  // Keren Hishtalmut
  hasKerenHistalmut: boolean;
  kerenHistalmutEmployeeRate: number;
  kerenHistalmutEmployerRate: number;
}

export interface CalculationResult {
  grossSalary: number;
  taxableBase: number;
  incomeTaxBeforeCredits: number;
  creditPoints: number;
  creditValue: number;
  incomeTaxAfterCredits: number;
  bituachLeumiEmployee: number;
  pensionEmployee: number;
  pensionEmployer: number;
  severanceEmployer: number;
  localityDiscount: number;
  totalDeductions: number;
  netSalary: number;
  breakdown: DeductionBreakdown[];
}

export interface DeductionBreakdown {
  category: string;
  amount: number;
  isTaxDeductible: boolean;
  description: string;
}

export interface CreditPointBreakdown {
  category: string;
  points: number;
  description: string;
}

// Configuration types
export interface TaxBracket {
  min: number;
  max: number | null;
  rate: number;
}

export interface BituachLeumiConfig {
  // Employee rates
  bituach_leumi_threshold_1: number;
  bituach_leumi_threshold_2: number;
  bituach_leumi_rate_1: number;
  bituach_leumi_rate_2: number;
  employer_rate_1: number;
  employer_rate_2: number;
  
  // Self-employed rates
  self_employed_rate_1: number;
  self_employed_rate_2: number;
  self_employed_min_income: number;
  self_employed_deduction_rate: number; // 52% of BL deducted from income
}

export interface PensionConfig {
  employee_rate: number;
  employer_pension_rate: number;
  employer_severance_rate: number;
  recognized_wage_ceiling: number;
  max_recognized_employee_7pct: number;
  employer_recognized_base: number;
  severance_info_base: number;
  self_employed_min_rate: number;
  self_employed_employer_rate: number;
  self_employed_max_rate: number;
  self_employed_max_annual: number;
}

export interface CreditPointsConfig {
  value_per_point_monthly: number;
  value_per_point_annual: number;
  base_resident: number;
  women: number;
  working_youth: number;
  foreign_worker_caregiver: number;
  foreign_worker_other: number;
  spouse_dependent_joint: number;
  spouse_dependent_separate: number;
  spouse_no_income?: number; // Legacy, maps to spouse_dependent_joint
  alimony_ex_spouse: number;
  child_support: number;
  single_parent_per_child: number;
  disabled_child_or_dependent: number;
  army_service_long: number;
  army_service_short: number;
  academic_degree_ba_annual: number;
  academic_degree_ba_years: number;
  academic_degree_ma_annual: number;
  academic_degree_ma_years: number;
  academic_degree_phd_annual: number;
  academic_degree_phd_years: number;
  teaching_diploma_annual: number;
  teaching_diploma_years: number;
  medical_degree_years_1_3: number;
  medical_degree_years_4_5: number;
  professional_training_annual: number;
  professional_training_years: number;
}
