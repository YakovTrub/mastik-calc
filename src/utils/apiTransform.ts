import type { CalculatorInputs, CalculationResult } from '@/types/calculator';
import type { ApiCalculatorInputs, ApiCalculationResult } from '@/services/api';

export function transformToApiInputs(inputs: CalculatorInputs): ApiCalculatorInputs {
  // Calculate age from date of birth or use default
  const age = inputs.dateOfBirth 
    ? new Date().getFullYear() - new Date(inputs.dateOfBirth).getFullYear()
    : 30;

  // Map gender from form to API format
  const genderMap: Record<string, 'male' | 'female' | 'other'> = {
    'male': 'male',
    'female': 'female',
  };
  const apiGender = genderMap[inputs.gender] || 'other';

  // Map education level to API format
  const educationLevelMap: Record<string, 'BA' | 'MA' | 'PhD' | 'Teaching' | 'Medical' | 'Dental' | undefined> = {
    'bachelor': 'BA',
    'master': 'MA',
    'doctorate': 'PhD',
    'professional': 'Teaching',
  };

  return {
    employment_type: inputs.employmentType,
    gross_salary: inputs.grossSalary,
    pension_base: inputs.pensionBase,
    jobs: inputs.jobs.map(job => ({
      id: job.id,
      gross_salary: job.grossSalary,
      pension_rate: job.pensionRate,
      credit_points_percent: job.creditPointsPercent,
    })),
    // Only include self_employed_income when employment type is self-employed/combined
    self_employed_income:
      (inputs.employmentType === 'self_employed' || inputs.employmentType === 'combined') && inputs.selfEmployedIncome
        ? {
            type: inputs.selfEmployedIncome.type,
            revenue: inputs.selfEmployedIncome.revenue,
            expense_rate: inputs.selfEmployedIncome.expenseRate,
            actual_expenses: inputs.selfEmployedIncome.actualExpenses,
          }
        : undefined,
    age,
    gender: apiGender,
    children: inputs.numberOfChildren,
    children_ages: inputs.childrenAges || [],
    spouse: inputs.maritalStatus !== 'single' || inputs.hasSpouseNoIncome,
    spouse_dependent: inputs.hasSpouseNoIncome,
    spouse_income: inputs.hasSpouseNoIncome ? 0 : inputs.grossSalary * 0, // spouse_income from form, defaulting to 0
    disability_percent: inputs.hasDisability ? 50 : undefined, // Default to 50% if disabled, not captured in form
    disabled: inputs.hasDisability,
    is_single_parent: inputs.isSingleParent,
    is_widow_widower: inputs.maritalStatus === 'widowed',
    disabled_dependents: 0, // Not captured in current form
    alimony_payment: 0, // Not captured in current form
    child_support_payment: 0, // Not captured in current form
    new_immigrant: inputs.isNewImmigrant,
    date_of_aliyah: inputs.immigrationDate ? inputs.immigrationDate.toISOString().split('T')[0] : undefined,
    student: inputs.educationLevel !== 'none',
    education_level: educationLevelMap[inputs.educationLevel],
    education_years_active: inputs.educationLevel !== 'none' ? 1 : 0, // Not captured in current form
    professional_training: false, // Not captured in current form
    reserve_duty: inputs.hasArmyService,
    foreign_worker: false, // Not captured in current form
    foreign_worker_type: undefined,
    city: inputs.locality || undefined,
    pension_rate: inputs.voluntaryPension || 6,
  };
}

export function transformFromApiResult(apiResult: ApiCalculationResult): CalculationResult {
  return {
    grossSalary: apiResult.gross_salary,
    taxableBase: apiResult.taxable_base, // Adjust based on API response
    incomeTaxBeforeCredits: apiResult.tax_breakdown.income_tax,
    creditPoints: apiResult.credit_points,
    creditValue: apiResult.tax_credit_annual, // Use the monetary value from API
    incomeTaxAfterCredits: apiResult.tax_breakdown.income_tax,
    bituachLeumiEmployee: apiResult.tax_breakdown.national_insurance_employee,
    pensionEmployee: apiResult.tax_breakdown.pension_employee,
    pensionEmployer: apiResult.tax_breakdown.pension_employer, // Now provided by API
    severanceEmployer: 0, // Not provided by API
    localityDiscount: 0, // Not provided by API
    totalDeductions: apiResult.tax_breakdown.total_deductions,
    netSalary: apiResult.net_salary,
    breakdown: [
      {
        category: 'Income Tax',
        amount: apiResult.tax_breakdown.income_tax,
        isTaxDeductible: true,
        description: 'Income tax deduction',
      },
      {
        category: 'National Insurance',
        amount: apiResult.tax_breakdown.national_insurance_employee,
        isTaxDeductible: true,
        description: 'National insurance contribution',
      },
      // {
      //   category: 'Health Tax',
      //   amount: apiResult.tax_breakdown.health_tax,
      //   isTaxDeductible: true,
      //   description: 'Health insurance tax',
      // },
      {
        category: 'Pension',
        amount: apiResult.tax_breakdown.pension_employee,
        isTaxDeductible: true,
        description: 'Employee pension contribution',
      },
    ],
  };
}
