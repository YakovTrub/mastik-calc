export interface IncomeSourceResult {
  sourceId: string;
  sourceName: string;
  sourceType: 'employee' | 'self_employed';
  grossIncome: number;
  
  // Deductions
  bituachLeumiEmployee: number;
  bituachLeumiEmployer: number;
  pensionEmployee: number;
  pensionEmployer: number;
  severanceEmployer: number;
  
  // Tax calculation
  taxableBase: number;
  incomeTaxBeforeCredits: number;
  creditPointsUsed: number;
  creditValueUsed: number;
  incomeTaxAfterCredits: number;
  localityDiscount: number;
  finalIncomeTax: number;
  
  // Net
  netIncome: number;
  totalDeductions: number;
}

export interface MultiSourceCalculationResult {
  sources: IncomeSourceResult[];
  totalGrossIncome: number;
  totalNetIncome: number;
  totalDeductions: number;
  totalIncomeTax: number;
  totalBituachLeumi: number;
  totalPension: number;
  totalCreditPoints: number;
  totalCreditValue: number;
  creditPointsRemaining: number;
}
