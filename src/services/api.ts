const API_BASE_URL = 'http://localhost:8000/api/v1';

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
  children: number;
  spouse: boolean;
  spouse_income: number;
  disabled: boolean;
  new_immigrant: boolean;
  student: boolean;
  reserve_duty: boolean;
  pension_rate: number;
}

export interface ApiCalculationResult {
  gross_salary: number;
  net_salary: number;
  tax_breakdown: {
    income_tax: number;
    national_insurance: number;
    health_tax: number;
    pension_employee: number;
    total_deductions: number;
  };
  credit_points: number;
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
    const response = await fetch('http://localhost:8000/health');
    return response.json();
  }
}

export const apiService = new ApiService();
