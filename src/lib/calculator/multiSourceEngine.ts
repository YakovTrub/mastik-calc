import taxRules from '@/config/taxRules2025.json';
import type { CalculatorInputs } from '@/types/calculator';
import type { IncomeSourceResult, MultiSourceCalculationResult } from '@/types/incomeSource';
import { calculateBituachLeumiEmployee, calculateBituachLeumiEmployer, calculateBituachLeumiSelfEmployed, calculateBituachLeumiMultipleJobs } from './modules/bituachLeumi';
import { calculatePension, calculateSelfEmployedPension } from './modules/pension';
import { calculateProgressiveIncomeTax } from './modules/incomeTax';
import { calculateCreditPoints } from './modules/creditPoints';
import { calculateLocalityDiscount } from './modules/locality';
import { calculateSelfEmployedProfit } from './modules/selfEmployed';

export function calculateMultiSourceIncome(inputs: CalculatorInputs): MultiSourceCalculationResult {
  const sources: IncomeSourceResult[] = [];
  
  // Calculate total credit points available
  const allCreditPoints = calculateCreditPoints(inputs, taxRules.credit_points);
  const totalCreditPoints = allCreditPoints.reduce((sum, item) => sum + item.points, 0);
  const totalCreditValue = totalCreditPoints * taxRules.credit_points.value_per_point_monthly;
  
  let remainingCreditValue = totalCreditValue;

  if (inputs.employmentType === 'multiple_employers') {
    // Handle multiple employers scenario
    const salaries = inputs.jobs.map(job => job.grossSalary);
    const blContributions = calculateBituachLeumiMultipleJobs(salaries, {
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

    inputs.jobs.forEach((job, index) => {
      const pensionResult = calculatePension(
        job.grossSalary,
        job.grossSalary,
        {
          employee_rate: job.pensionRate / 100,
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
        }
      );

      const taxableBase = job.grossSalary - blContributions[index] - pensionResult.employeeContribution;
      const incomeTaxBeforeCredits = calculateProgressiveIncomeTax(taxableBase, taxRules.income_tax_brackets);
      
      // Allocate credits based on percentage
      const allocatedCreditValue = totalCreditValue * (job.creditPointsPercent / 100);
      const creditUsed = Math.min(allocatedCreditValue, incomeTaxBeforeCredits);
      remainingCreditValue -= creditUsed;
      
      const incomeTaxAfterCredits = Math.max(0, incomeTaxBeforeCredits - creditUsed);
      
      const localityResult = calculateLocalityDiscount(
        inputs.locality,
        incomeTaxAfterCredits,
        job.grossSalary,
        taxRules.locality_discounts
      );
      
      const finalIncomeTax = Math.max(0, incomeTaxAfterCredits - localityResult.discount);
      const totalDeductions = blContributions[index] + pensionResult.employeeContribution + finalIncomeTax;

      sources.push({
        sourceId: job.id,
        sourceName: `Job ${index + 1}`,
        sourceType: 'employee',
        grossIncome: job.grossSalary,
        bituachLeumiEmployee: blContributions[index],
        bituachLeumiEmployer: 0,
        pensionEmployee: pensionResult.employeeContribution,
        pensionEmployer: pensionResult.employerPension,
        severanceEmployer: pensionResult.employerSeverance,
        taxableBase,
        incomeTaxBeforeCredits,
        creditPointsUsed: creditUsed / taxRules.credit_points.value_per_point_monthly,
        creditValueUsed: creditUsed,
        incomeTaxAfterCredits,
        localityDiscount: localityResult.discount,
        finalIncomeTax,
        netIncome: job.grossSalary - totalDeductions,
        totalDeductions
      });
    });
  } else if (inputs.employmentType === 'combined') {
    // Handle combined employee + self-employed
    
    // Employee income first
    const employeeBL = calculateBituachLeumiEmployee(inputs.grossSalary, {
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

    const employeePension = calculatePension(inputs.grossSalary, inputs.grossSalary, {
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

    const employeeTaxBase = inputs.grossSalary - employeeBL - employeePension.employeeContribution;
    const employeeIncomeTax = calculateProgressiveIncomeTax(employeeTaxBase, taxRules.income_tax_brackets);
    
    // Apply credits to employee income first (primary)
    const employeeCreditUsed = Math.min(totalCreditValue, employeeIncomeTax);
    remainingCreditValue -= employeeCreditUsed;
    
    const employeeTaxAfterCredits = Math.max(0, employeeIncomeTax - employeeCreditUsed);
    const employeeFinalTax = employeeTaxAfterCredits;
    const employeeDeductions = employeeBL + employeePension.employeeContribution + employeeFinalTax;

    sources.push({
      sourceId: 'employee',
      sourceName: 'Employment Income',
      sourceType: 'employee',
      grossIncome: inputs.grossSalary,
      bituachLeumiEmployee: employeeBL,
      bituachLeumiEmployer: 0,
      pensionEmployee: employeePension.employeeContribution,
      pensionEmployer: employeePension.employerPension,
      severanceEmployer: employeePension.employerSeverance,
      taxableBase: employeeTaxBase,
      incomeTaxBeforeCredits: employeeIncomeTax,
      creditPointsUsed: employeeCreditUsed / taxRules.credit_points.value_per_point_monthly,
      creditValueUsed: employeeCreditUsed,
      incomeTaxAfterCredits: employeeTaxAfterCredits,
      localityDiscount: 0,
      finalIncomeTax: employeeFinalTax,
      netIncome: inputs.grossSalary - employeeDeductions,
      totalDeductions: employeeDeductions
    });

    // Self-employed income
    if (inputs.selfEmployedIncome) {
      const profit = calculateSelfEmployedProfit(inputs.selfEmployedIncome);
      
      const selfEmployedBL = calculateBituachLeumiSelfEmployed(profit, {
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

      const selfEmployedPension = calculateSelfEmployedPension(profit, {
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

      const selfEmployedTaxBase = profit - selfEmployedBL.contribution - selfEmployedPension.employeeContribution - selfEmployedBL.deductibleAmount;
      const selfEmployedIncomeTax = calculateProgressiveIncomeTax(selfEmployedTaxBase, taxRules.income_tax_brackets);
      
      // Apply remaining credits to self-employed income
      const selfEmployedCreditUsed = Math.min(remainingCreditValue, selfEmployedIncomeTax);
      remainingCreditValue -= selfEmployedCreditUsed;
      
      const selfEmployedTaxAfterCredits = Math.max(0, selfEmployedIncomeTax - selfEmployedCreditUsed);
      const selfEmployedFinalTax = selfEmployedTaxAfterCredits;
      const selfEmployedDeductions = selfEmployedBL.contribution + selfEmployedPension.employeeContribution + selfEmployedFinalTax;

      sources.push({
        sourceId: 'self_employed',
        sourceName: 'Self-Employed Income',
        sourceType: 'self_employed',
        grossIncome: profit,
        bituachLeumiEmployee: selfEmployedBL.contribution,
        bituachLeumiEmployer: 0,
        pensionEmployee: selfEmployedPension.employeeContribution,
        pensionEmployer: selfEmployedPension.employerPension,
        severanceEmployer: 0,
        taxableBase: selfEmployedTaxBase,
        incomeTaxBeforeCredits: selfEmployedIncomeTax,
        creditPointsUsed: selfEmployedCreditUsed / taxRules.credit_points.value_per_point_monthly,
        creditValueUsed: selfEmployedCreditUsed,
        incomeTaxAfterCredits: selfEmployedTaxAfterCredits,
        localityDiscount: 0,
        finalIncomeTax: selfEmployedFinalTax,
        netIncome: profit - selfEmployedDeductions,
        totalDeductions: selfEmployedDeductions
      });
    }
  }

  // Calculate totals
  const totalGrossIncome = sources.reduce((sum, s) => sum + s.grossIncome, 0);
  const totalNetIncome = sources.reduce((sum, s) => sum + s.netIncome, 0);
  const totalDeductions = sources.reduce((sum, s) => sum + s.totalDeductions, 0);
  const totalIncomeTax = sources.reduce((sum, s) => sum + s.finalIncomeTax, 0);
  const totalBituachLeumi = sources.reduce((sum, s) => sum + s.bituachLeumiEmployee, 0);
  const totalPension = sources.reduce((sum, s) => sum + s.pensionEmployee, 0);

  return {
    sources,
    totalGrossIncome,
    totalNetIncome,
    totalDeductions,
    totalIncomeTax,
    totalBituachLeumi,
    totalPension,
    totalCreditPoints,
    totalCreditValue,
    creditPointsRemaining: remainingCreditValue / taxRules.credit_points.value_per_point_monthly
  };
}
