import type { CalculatorInputs, CalculationResult } from '@/types/calculator';
import type { ApiCalculatorInputs, ApiCalculationResult } from '@/services/api';

export function transformToApiInputs(inputs: CalculatorInputs): ApiCalculatorInputs {
  // Calculate age from date of birth or use default
  const age = inputs.dateOfBirth 
    ? new Date().getFullYear() - new Date(inputs.dateOfBirth).getFullYear()
    : 30;

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
    children: inputs.numberOfChildren,
    spouse: inputs.maritalStatus !== 'single',
    spouse_income: 0, // Not captured in current form
    disabled: inputs.hasDisability,
    new_immigrant: inputs.isNewImmigrant,
    student: inputs.educationLevel !== 'none',
    reserve_duty: inputs.hasArmyService,
    pension_rate: inputs.voluntaryPension || 6,
  };
}

export function transformFromApiResult(apiResult: ApiCalculationResult): CalculationResult {
  return {
    grossSalary: apiResult.gross_salary,
    taxableBase: apiResult.gross_salary, // Adjust based on API response
    incomeTaxBeforeCredits: apiResult.tax_breakdown.income_tax,
    creditPoints: apiResult.credit_points,
    creditValue: 0, // Calculate based on credit points
    incomeTaxAfterCredits: apiResult.tax_breakdown.income_tax,
    bituachLeumiEmployee: apiResult.tax_breakdown.national_insurance,
    pensionEmployee: apiResult.tax_breakdown.pension_employee,
    pensionEmployer: 0, // Not provided by API
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
        amount: apiResult.tax_breakdown.national_insurance,
        isTaxDeductible: true,
        description: 'National insurance contribution',
      },
      {
        category: 'Health Tax',
        amount: apiResult.tax_breakdown.health_tax,
        isTaxDeductible: true,
        description: 'Health insurance tax',
      },
      {
        category: 'Pension',
        amount: apiResult.tax_breakdown.pension_employee,
        isTaxDeductible: true,
        description: 'Employee pension contribution',
      },
    ],
  };
}
