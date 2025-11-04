import type { TaxBracket } from '@/types/calculator';

export function calculateProgressiveIncomeTax(
  taxableIncome: number,
  brackets: TaxBracket[]
): number {
  let tax = 0;
  
  for (const bracket of brackets) {
    const min = bracket.min;
    const max = bracket.max || Infinity;
    
    if (taxableIncome > min) {
      const taxableInBracket = Math.min(taxableIncome, max) - min;
      tax += taxableInBracket * bracket.rate;
    }
    
    if (taxableIncome <= max) break;
  }
  
  return tax;
}
