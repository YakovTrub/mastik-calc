import type { SelfEmployedIncome } from '@/types/calculator';

export function calculateSelfEmployedProfit(income: SelfEmployedIncome): number {
  const { revenue, expenseRate, actualExpenses } = income;
  
  if (actualExpenses !== undefined) {
    return Math.max(0, revenue - actualExpenses);
  }
  
  // Default 30% expense rate for small business
  const expenses = revenue * (expenseRate / 100);
  return Math.max(0, revenue - expenses);
}

export function calculateSelfEmployedTaxBase(
  profit: number,
  pensionContribution: number,
  kerenHistalmut: number,
  bituachLeumiDeductible: number
): number {
  return Math.max(0, profit - pensionContribution - kerenHistalmut - bituachLeumiDeductible);
}
