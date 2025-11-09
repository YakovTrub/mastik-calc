import taxRules from '@/config/taxRules2025.json';
import type { CalculatorInputs, CalculationResult, DeductionBreakdown } from '@/types/calculator';
import { calculateBituachLeumiSelfEmployed } from './modules/bituachLeumi';
import { calculateSelfEmployedPension } from './modules/pension';
import { calculateProgressiveIncomeTax } from './modules/incomeTax';
import { calculateCreditPoints } from './modules/creditPoints';
import { calculateLocalityDiscount } from './modules/locality';
import { calculateSelfEmployedProfit } from './modules/selfEmployed';
import { calculateDonationCredit } from './modules/donations';
import { calculateDisabilityExemption } from './modules/disability';

export function calculateSelfEmployedIncome(inputs: CalculatorInputs): CalculationResult {
  if (!inputs.selfEmployedIncome) {
    throw new Error('Self-employed income data is required');
  }

  const profit = calculateSelfEmployedProfit(inputs.selfEmployedIncome);
  
  // Step 1: Calculate Bituach Leumi for self-employed
  const bituachLeumiResult = calculateBituachLeumiSelfEmployed(profit, {
    bituach_leumi_threshold_1: taxRules.social_security.bituach_leumi_threshold_1,
    bituach_leumi_threshold_2: taxRules.social_security.bituach_leumi_threshold_2,
    bituach_leumi_rate_1: taxRules.social_security.bituach_leumi_rate_1,
    bituach_leumi_rate_2: taxRules.social_security.bituach_leumi_rate_2,
    employer_rate_1: taxRules.social_security.employer_rate_1,
    employer_rate_2: taxRules.social_security.employer_rate_2,
    self_employed_rate_1: taxRules.social_security.self_employed_rate_1,
    self_employed_rate_2: taxRules.social_security.self_employed_rate_2,
    self_employed_min_income: taxRules.social_security.self_employed_min_income,
    self_employed_deduction_rate: taxRules.social_security.self_employed_deduction_rate
  });

  // Step 2: Calculate Pension
  const pensionResult = calculateSelfEmployedPension(profit, {
    employee_rate: taxRules.pension.employee_rate,
    employer_pension_rate: taxRules.pension.employer_pension_rate,
    employer_severance_rate: taxRules.pension.employer_severance_rate,
    recognized_wage_ceiling: taxRules.pension.recognized_wage_ceiling,
    max_recognized_employee_7pct: taxRules.pension.max_recognized_employee_7pct,
    employer_recognized_base: taxRules.pension.employer_recognized_base,
    severance_info_base: taxRules.pension.severance_info_base,
    self_employed_min_rate: taxRules.pension.self_employed_min_rate,
    self_employed_employer_rate: taxRules.pension.self_employed_employer_rate,
    self_employed_max_rate: taxRules.pension.self_employed_max_rate,
    self_employed_max_annual: taxRules.pension.self_employed_max_annual
  });

  // Step 3: Calculate Keren Hishtalmut (if applicable)
  const kerenHistalmutEmployee = inputs.hasKerenHistalmut 
    ? profit * (inputs.kerenHistalmutEmployeeRate / 100)
    : 0;

  // Step 4: Calculate Taxable Base
  // For self-employed: profit - pension - keren - (52% of BL)
  const taxableBase = profit 
    - pensionResult.employeeContribution 
    - kerenHistalmutEmployee
    - bituachLeumiResult.deductibleAmount;

  // Step 5: Apply Disability Exemption (if applicable)
  const disabilityResult = calculateDisabilityExemption(
    taxableBase,
    inputs.hasDisabilityExemption,
    taxRules.disability_exemption
  );

  // Step 6: Calculate Progressive Income Tax
  const incomeTaxBeforeCredits = calculateProgressiveIncomeTax(
    disabilityResult.residualBase,
    taxRules.income_tax_brackets
  );

  // Step 7: Calculate Credit Points
  const creditPointsData = calculateCreditPoints(inputs, taxRules.credit_points);
  const creditPoints = creditPointsData.reduce((sum, item) => sum + item.points, 0);
  const creditValue = creditPoints * taxRules.credit_points.value_per_point_monthly;

  // Step 8: Apply Credit Points
  const incomeTaxAfterCredits = Math.max(0, incomeTaxBeforeCredits - creditValue);

  // Step 9: Calculate Donation Credit
  const donationCredit = calculateDonationCredit(inputs.donations, taxRules.donations);
  const incomeTaxAfterDonations = Math.max(0, incomeTaxAfterCredits - donationCredit);

  // Step 10: Apply Locality Discount
  const localityResult = calculateLocalityDiscount(
    inputs.locality,
    incomeTaxAfterDonations,
    profit,
    taxRules.locality_discounts
  );

  const finalIncomeTax = Math.max(0, incomeTaxAfterDonations - localityResult.discount);

  // Step 11: Calculate VAT for Osek Murshe (18% of revenue)
  const vat = inputs.selfEmployedIncome.type === 'esek_murshe' 
    ? inputs.selfEmployedIncome.revenue * 0.18 
    : 0;

  // Step 12: Calculate Total Deductions and Net Income
  const totalDeductions = finalIncomeTax + bituachLeumiResult.contribution + pensionResult.employeeContribution + kerenHistalmutEmployee + vat;
  const netSalary = profit - totalDeductions;

  // Build Breakdown
  const breakdown: DeductionBreakdown[] = [
    {
      category: 'Income Tax',
      amount: finalIncomeTax,
      isTaxDeductible: false,
      description: `Progressive income tax after credits (${creditPoints.toFixed(2)} points = ₪${creditValue.toFixed(2)})`
    },
    {
      category: 'Bituach Leumi (Self-Employed)',
      amount: bituachLeumiResult.contribution,
      isTaxDeductible: true,
      description: `National insurance (52% deductible = ₪${bituachLeumiResult.deductibleAmount.toFixed(2)})`
    },
    {
      category: 'Pension (Self-Employed)',
      amount: pensionResult.employeeContribution,
      isTaxDeductible: true,
      description: `Self-employed pension contribution (includes ₪${pensionResult.taxCredit35Percent.toFixed(2)} tax credit @ 35%)`
    }
  ];

  if (vat > 0) {
    breakdown.push({
      category: 'VAT (Osek Murshe)',
      amount: vat,
      isTaxDeductible: false,
      description: `18% VAT on revenue of ₪${inputs.selfEmployedIncome.revenue.toLocaleString()}`
    });
  }

  if (kerenHistalmutEmployee > 0) {
    breakdown.push({
      category: 'Keren Hishtalmut',
      amount: kerenHistalmutEmployee,
      isTaxDeductible: true,
      description: `Study fund contribution: ${inputs.kerenHistalmutEmployeeRate}%`
    });
  }

  if (donationCredit > 0) {
    breakdown.push({
      category: 'Donation Credit (§46)',
      amount: -donationCredit,
      isTaxDeductible: false,
      description: `35% tax credit on ${inputs.donations}₪ donations`
    });
  }

  if (localityResult.discount > 0) {
    breakdown.push({
      category: 'Locality Discount',
      amount: -localityResult.discount,
      isTaxDeductible: false,
      description: `${localityResult.discountPercent}% tax discount for ${localityResult.localityName}`
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
    grossSalary: profit,
    taxableBase,
    incomeTaxBeforeCredits,
    creditPoints,
    creditValue,
    incomeTaxAfterCredits,
    bituachLeumiEmployee: bituachLeumiResult.contribution,
    pensionEmployee: pensionResult.employeeContribution,
    pensionEmployer: 0, // Self-employed have no employer contributions
    severanceEmployer: 0, // Self-employed have no employer severance
    localityDiscount: localityResult.discount,
    totalDeductions,
    netSalary,
    breakdown
  };
}
