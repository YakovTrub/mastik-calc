const API_BASE_URL = 'http://localhost:8000/api/v1';
// const API_BASE_URL = "https://sf79tpnltb.execute-api.us-east-1.amazonaws.com/api/v1"


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
  
  
  gender?: 'male' | 'female' | 'other';
  
  children: number;
  
  children_ages?: number[];
  
  spouse: boolean;
  
  spouse_dependent?: boolean;
  spouse_income: number;
  
  disabled: boolean;
  
  disability_percent?: number;
  
  
  is_single_parent?: boolean;
  is_widow_widower?: boolean;
  
  
  disabled_dependents?: number;
  
  
  alimony_payment?: number;
  
  
  child_support_payment?: number;
  
  new_immigrant: boolean;
  
  date_of_aliyah?: string;
  
  student: boolean;
  
  education_level?: 'BA' | 'MA' | 'PhD' | 'Teaching' | 'Medical' | 'Dental';
  
  education_years_active?: number;
  
  
  professional_training?: boolean;
  
  reserve_duty: boolean;
  
  
  foreign_worker?: boolean;

  foreign_worker_type?: 'caregiver' | 'other';
  
  
  city?: string;
  
  pension_rate: number;
}

export interface ApiCalculationResult {
  gross_salary: number;
  net_salary: number;
  tax_breakdown: {
    income_tax: number;
    
    national_insurance_employee: number;  // Employee portion (deducted from salary)
    national_insurance_employer: number;   // Employer portion (informational only)
    health_tax: number;
    pension_employee: number;   // Employee contribution (deducted from salary)
    pension_employer: number;    //  Employer contribution (informational only)
    total_deductions: number;    // Employee deductions only
  };
  
  credit_points: number;
  
  
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
    
    // const response = await fetch('https://sf79tpnltb.execute-api.us-east-1.amazonaws.com/health');
    const response = await fetch('http://localhost:8000/health');
    return response.json();
  }
}

export const apiService = new ApiService();
