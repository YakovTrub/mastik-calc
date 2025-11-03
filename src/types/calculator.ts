export interface CalculatorInputs {
  grossSalary: number;
  gender: 'male' | 'female';
  dateOfBirth: Date | null;
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  numberOfChildren: number;
  childrenAges: number[];
  hasArmyService: boolean;
  armyServiceMonths: number;
  isNewImmigrant: boolean;
  immigrationDate: Date | null;
  hasDisability: boolean;
  locality: string;
  voluntaryPension: number;
  hasSecondJob: boolean;
  secondJobIncome: number;
  educationLevel: 'none' | 'bachelor' | 'master' | 'doctorate' | 'professional';
  isSingleParent: boolean;
  hasSpouseNoIncome: boolean;
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
