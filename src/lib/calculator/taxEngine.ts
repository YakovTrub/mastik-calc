import taxRules from '@/config/taxRules2025.json';
import type { CalculatorInputs, CalculationResult, DeductionBreakdown } from '@/types/calculator';
import { calculateBituachLeumiEmployee, calculateBituachLeumiEmployer } from './modules/bituachLeumi';
import { calculatePension } from './modules/pension';
import { calculateProgressiveIncomeTax } from './modules/incomeTax';
import { calculateCreditPoints } from './modules/creditPoints';
import { calculateLocalityDiscount } from './modules/locality';
import { calculateDonationCredit } from './modules/donations';
import { calculateDisabilityExemption } from './modules/disability';
import { calculateTotalFringeBenefits } from './modules/fringeBenefits';

export function calculateNetSalary(inputs: CalculatorInputs): CalculationResult {
  const { grossSalary, pensionBase, fringeBenefits, donations, hasDisabilityExemption } = inputs;
  
  // Use pension base if specified, otherwise use gross salary
  const effectivePensionBase = pensionBase || grossSalary;
  
  // Step 1: Calculate fringe benefits (added to taxable gross)
  const totalFringeBenefits = calculateTotalFringeBenefits(fringeBenefits);
  
  // Step 2: Calculate Pension
  const pensionResult = calculatePension(
    grossSalary,
    effectivePensionBase,
    {
      employee_rate: taxRules.pension.employee_rate,
      employer_pension_rate: taxRules.pension.employer_pension_rate,
      employer_severance_rate: taxRules.pension.employer_severance_rate,
      recognized_wage_ceiling: taxRules.pension.recognized_wage_ceiling,
      max_recognized_employee_7pct: taxRules.pension.max_recognized_employee_7pct,
      employer_recognized_base: taxRules.pension.employer_recognized_base,
      severance_info_base: taxRules.pension.severance_info_base
    }
  );
  
  // Step 3: Build Taxable Gross (before BL)
  const taxableGross0 = grossSalary + totalFringeBenefits + pensionResult.taxableBenefitToEmployee;
  
  // Step 4: Calculate Bituach Leumi (Employee & Employer)
  const bituachLeumiEmployee = calculateBituachLeumiEmployee(
    taxableGross0,
    {
      bituach_leumi_threshold_1: taxRules.social_security.bituach_leumi_threshold_1,
      bituach_leumi_threshold_2: taxRules.social_security.bituach_leumi_threshold_2,
      bituach_leumi_rate_1: taxRules.social_security.bituach_leumi_rate_1,
      bituach_leumi_rate_2: taxRules.social_security.bituach_leumi_rate_2,
      employer_rate_1: taxRules.social_security.employer_rate_1,
      employer_rate_2: taxRules.social_security.employer_rate_2
    }
  );
  
  const bituachLeumiEmployer = calculateBituachLeumiEmployer(
    taxableGross0,
    {
      bituach_leumi_threshold_1: taxRules.social_security.bituach_leumi_threshold_1,
      bituach_leumi_threshold_2: taxRules.social_security.bituach_leumi_threshold_2,
      bituach_leumi_rate_1: taxRules.social_security.bituach_leumi_rate_1,
      bituach_leumi_rate_2: taxRules.social_security.bituach_leumi_rate_2,
      employer_rate_1: taxRules.social_security.employer_rate_1,
      employer_rate_2: taxRules.social_security.employer_rate_2
    }
  );
  
  // Step 5: Calculate Keren Hishtalmut contributions
  const kerenHistalmutEmployee = inputs.hasKerenHistalmut 
    ? grossSalary * (inputs.kerenHistalmutEmployeeRate / 100)
    : 0;
  
  const kerenHistalmutEmployer = inputs.hasKerenHistalmut
    ? grossSalary * (inputs.kerenHistalmutEmployerRate / 100)
    : 0;
  
  // Step 6: Calculate Taxable Base for Income Tax
  const taxableBase = taxableGross0 
    - bituachLeumiEmployee 
    - pensionResult.employeeContribution 
    - kerenHistalmutEmployee;
  
  // Step 7: Apply Disability Exemption (if applicable)
  const disabilityResult = calculateDisabilityExemption(
    taxableBase,
    hasDisabilityExemption,
    taxRules.disability_exemption
  );
  
  // Step 7: Calculate Progressive Income Tax
  const incomeTaxBeforeCredits = calculateProgressiveIncomeTax(
    disabilityResult.residualBase,
    taxRules.income_tax_brackets
  );
  
  // Step 8: Calculate Credit Points
  const creditPointsData = calculateCreditPoints(inputs, taxRules.credit_points);
  const creditPoints = creditPointsData.reduce((sum, item) => sum + item.points, 0);
  const creditValue = creditPoints * taxRules.credit_points.value_per_point_monthly;
  
  // Step 9: Apply Credit Points
  const incomeTaxAfterCredits = Math.max(0, incomeTaxBeforeCredits - creditValue);
  
  // Step 10: Calculate Donation Credit (§46)
  const donationCredit = calculateDonationCredit(donations, taxRules.donations);
  const incomeTaxAfterDonations = Math.max(0, incomeTaxAfterCredits - donationCredit);
  
  // Step 11: Apply Locality Discount
  const localityResult = calculateLocalityDiscount(
    inputs.locality,
    incomeTaxAfterDonations,
    grossSalary,
    taxRules.locality_discounts
  );
  
  const finalIncomeTax = Math.max(0, incomeTaxAfterDonations - localityResult.discount);
  
  // Step 12: Calculate Total Deductions and Net Salary
  const totalDeductions = finalIncomeTax + bituachLeumiEmployee + pensionResult.employeeContribution + kerenHistalmutEmployee;
  const netSalary = grossSalary - totalDeductions;
  
  // Build Breakdown
  const breakdown: DeductionBreakdown[] = [
    {
      category: 'Income Tax',
      amount: finalIncomeTax,
      isTaxDeductible: false,
      description: 'Progressive income tax after credits, donations, and locality discounts'
    },
    {
      category: 'Bituach Leumi & Health',
      amount: bituachLeumiEmployee,
      isTaxDeductible: true,
      description: 'Social security and health insurance contributions'
    },
    {
      category: 'Pension (Employee)',
      amount: pensionResult.employeeContribution,
      isTaxDeductible: true,
      description: `6% mandatory pension contribution (includes ${pensionResult.taxCredit35Percent.toFixed(2)}₪ tax credit @ 35%)`
    }
  ];
  
  if (kerenHistalmutEmployee > 0) {
    breakdown.push({
      category: 'Keren Hishtalmut (Employee)',
      amount: kerenHistalmutEmployee,
      isTaxDeductible: true,
      description: `Study fund contribution: ${inputs.kerenHistalmutEmployeeRate}% employee + ${inputs.kerenHistalmutEmployerRate}% employer`
    });
  }
  
  if (inputs.voluntaryPension > 0) {
    breakdown.push({
      category: 'Voluntary Pension',
      amount: inputs.voluntaryPension,
      isTaxDeductible: true,
      description: 'Additional voluntary pension contribution'
    });
  }
  
  if (totalFringeBenefits > 0) {
    breakdown.push({
      category: 'Fringe Benefits (Taxable)',
      amount: 0,
      isTaxDeductible: false,
      description: `Car: ${fringeBenefits.car}₪, Phone: ${fringeBenefits.phone}₪, Meals: ${fringeBenefits.meals}₪, Other: ${fringeBenefits.other}₪`
    });
  }
  
  if (donationCredit > 0) {
    breakdown.push({
      category: 'Donation Credit (§46)',
      amount: -donationCredit,
      isTaxDeductible: false,
      description: `35% tax credit on ${donations}₪ donations (max ${taxRules.donations.monthly_cap}₪/month)`
    });
  }
  
  if (disabilityResult.exemptedAmount > 0) {
    breakdown.push({
      category: 'Disability Exemption',
      amount: -disabilityResult.exemptedAmount,
      isTaxDeductible: false,
      description: `Tax-exempt income for disability (up to ${taxRules.disability_exemption.monthly_exemption_limit}₪/month)`
    });
  }
  
  return {
    grossSalary,
    taxableBase,
    incomeTaxBeforeCredits,
    creditPoints,
    creditValue,
    incomeTaxAfterCredits,
    bituachLeumiEmployee,
    pensionEmployee: pensionResult.employeeContribution,
    pensionEmployer: pensionResult.employerPension,
    severanceEmployer: pensionResult.employerSeverance,
    localityDiscount: localityResult.discount,
    totalDeductions,
    netSalary,
    breakdown
  };
}

// Re-export for backwards compatibility
export { calculateCreditPoints } from './modules/creditPoints';
