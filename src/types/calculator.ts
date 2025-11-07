export interface CalculatorInputs {
  // Basic info
  grossSalary: number;
  pensionBase?: number; // If different from gross
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
  bituach_leumi_threshold_1: number;
  bituach_leumi_threshold_2: number;
  bituach_leumi_rate_1: number;
  bituach_leumi_rate_2: number;
  employer_rate_1: number;
  employer_rate_2: number;
}

export interface PensionConfig {
  employee_rate: number;
  employer_pension_rate: number;
  employer_severance_rate: number;
  recognized_wage_ceiling: number;
  max_recognized_employee_7pct: number;
  employer_recognized_base: number;
  severance_info_base: number;
}

export interface CreditPointsConfig {
  value_per_point_monthly: number;
  base_resident: number;
  women: number;
  working_youth: number;
  single_parent: number;
  spouse_no_income: number;
  children_year_1_2: number;
  children_year_3: number;
  children_year_4_5: number;
  disabled_child: number;
  army_service_short: number;
  army_service_long: number;
  academic_degree_annual: number;
  academic_degree_years: number;
  masters_degree_annual: number;
  masters_degree_years: number;
  professional_certificate_annual: number;
  professional_certificate_years: number;
}
