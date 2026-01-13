// const API_BASE_URL = 'http://localhost:8000/api/v1';
// const API_BASE_URL = 'https://w2t7itknf1.execute-api.us-east-1.amazonaws.com/api/v1';
const API_BASE_URL = "https://w2t7itknf1.execute-api.us-east-1.amazonaws.com/api/v1"

// export interface ApiCalculatorInputs {
//   employment_type: 'employee' | 'self_employed' | 'combined' | 'multiple_employers';
//   gross_salary: number;
//   pension_base?: number;
//   jobs: Array<{
//     id: string;
//     gross_salary: number;
//     pension_rate: number;
//     credit_points_percent: number;
//   }>;
//   self_employed_income?: {
//     type: 'esek_patur' | 'esek_murshe' | 'esek_zair';
//     revenue: number;
//     expense_rate: number;
//     actual_expenses?: number;
//   };
//   age: number;
//   children: number;
//   spouse: boolean;
//   spouse_income: number;
//   disabled: boolean;
//   new_immigrant: boolean;
//   student: boolean;
//   reserve_duty: boolean;
//   pension_rate: number;
// }

// export interface ApiCalculationResult {
//   gross_salary: number;
//   net_salary: number;
//   tax_breakdown: {
//     income_tax: number;
//     national_insurance: number;
//     health_tax: number;
//     pension_employee: number;
//     total_deductions: number;
//   };
//   credit_points: number;
//   effective_tax_rate: number;
// }

// ISSUE #1-5: Updated to match backend changes
export interface ApiCalculatorInputs {
  employment_type: 'employee' | 'self_employed' | 'combined' | 'multiple_employers';
  gross_salary: number;
  pension_base?: number;
  jobs: Array<{
    id: string;
    gross_salary: number;
    pension_rate: number;
    credit_points_percent: number;
  }>;
  self_employed_income?: {
    type: 'esek_patur' | 'esek_murshe' | 'esek_zair';
    revenue: number;
    expense_rate: number;
    actual_expenses?: number;
  };
  age: number;
  
  // ISSUE #1: Added for comprehensive credit points calculation
  gender?: 'male' | 'female' | 'other';
  
  children: number;
  // ISSUE #1: Added for age-based child credit calculation
  children_ages?: number[];
  
  spouse: boolean;
  // ISSUE #1: Added to distinguish dependent spouse vs regular spouse
  spouse_dependent?: boolean;
  spouse_income: number;
  
  disabled: boolean;
  // ISSUE #1: Added for disability validation (50%+, 74%+, 90%+)
  disability_percent?: number;
  
  // ISSUE #1: Added for C_SINGLE_PARENT calculation
  is_single_parent?: boolean;
  is_widow_widower?: boolean;
  
  // ISSUE #1: Added for C_CHILDREN_SPECIAL_NEEDS (2 points each)
  disabled_dependents?: number;
  
  // ISSUE #1: Added for C_ALIMONY_EX_SPOUSE
  alimony_payment?: number;
  
  // ISSUE #1: Added for C_CHILD_SUPPORT
  child_support_payment?: number;
  
  new_immigrant: boolean;
  // ISSUE #1: Added for C_OLIM calculation (format: YYYY-MM-DD)
  date_of_aliyah?: string;
  
  student: boolean;
  // ISSUE #1: Added for C_EDUCATION (BA, MA, PhD, Teaching, Medical, etc.)
  education_level?: 'BA' | 'MA' | 'PhD' | 'Teaching' | 'Medical' | 'Dental';
  // ISSUE #1: Years active in education program (max 3 for BA, 2 for MA/PhD)
  education_years_active?: number;
  
  // ISSUE #1: Added for C_PROFESSIONAL_TRAINING (max 3 years)
  professional_training?: boolean;
  
  reserve_duty: boolean;
  
  // ISSUE #1: Added for C_FOREIGN_WORKER calculation
  foreign_worker?: boolean;
  // ISSUE #1: 'caregiver' (2.25 points) or 'other' (1 point)
  foreign_worker_type?: 'caregiver' | 'other';
  
  // ISSUE #1: Added for city tax relief (issue #7)
  city?: string;
  
  pension_rate: number;
}

export interface ApiCalculationResult {
  gross_salary: number;
  net_salary: number;
  tax_breakdown: {
    income_tax: number;
    // ISSUE #4 & #5: Separated employee and employer contributions
    national_insurance_employee: number;  // Employee portion (deducted from salary)
    national_insurance_employer: number;   // Employer portion (informational only)
    health_tax: number;
    pension_employee: number;   // Employee contribution (deducted from salary)
    pension_employer: number;    // ISSUE #5: Employer contribution (informational only)
    total_deductions: number;    // Employee deductions only
  };
  // ISSUE #1: Total number of credit points (not monetary value)
  credit_points: number;
  
  // ISSUE #2: Monetary values of credit points using 2025 constants
  tax_credit_annual: number;     // credit_points × 2,904 NIS
  tax_credit_monthly: number;    // credit_points × 242 NIS
  
  effective_tax_rate: number;
}

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async calculateSalary(inputs: ApiCalculatorInputs): Promise<ApiCalculationResult> {
    return this.request<ApiCalculationResult>('/calculator/calculate', {
      method: 'POST',
      body: JSON.stringify(inputs),
    });
  }

  async getTaxBrackets() {
    return this.request('/calculator/tax-brackets');
  }

  async getTaxConstants() {
    return this.request('/calculator/constants');
  }

  async healthCheck() {
    
    const response = await fetch('https://w2t7itknf1.execute-api.us-east-1.amazonaws.com/health');
    // const response = await fetch('http://localhost:8000/health');
    return response.json();
  }
}

export const apiService = new ApiService();
