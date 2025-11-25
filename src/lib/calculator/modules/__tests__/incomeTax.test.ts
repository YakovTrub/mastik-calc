import { describe, it, expect } from 'vitest';
import { calculateProgressiveIncomeTax } from '../incomeTax';
import type { TaxBracket } from '@/types/calculator';

describe('calculateProgressiveIncomeTax', () => {
  const testBrackets: TaxBracket[] = [
    { min: 0, max: 6790, rate: 0.10 },
    { min: 6790, max: 9730, rate: 0.14 },
    { min: 9730, max: 15620, rate: 0.20 },
    { min: 15620, max: 21710, rate: 0.31 },
    { min: 21710, max: 45180, rate: 0.35 },
    { min: 45180, max: 57880, rate: 0.47 },
    { min: 57880, max: null, rate: 0.50 }
  ];

  it('should return 0 for zero income', () => {
    const result = calculateProgressiveIncomeTax(0, testBrackets);
    expect(result).toBe(0);
  });

  it('should calculate tax for income in first bracket', () => {
    const result = calculateProgressiveIncomeTax(5000, testBrackets);
    expect(result).toBe(5000 * 0.10);
  });

  it('should calculate tax for income in second bracket', () => {
    const result = calculateProgressiveIncomeTax(8000, testBrackets);
    const expected = (6790 * 0.10) + ((8000 - 6790) * 0.14);
    expect(result).toBeCloseTo(expected, 2);
  });

  it('should calculate tax for income spanning multiple brackets', () => {
    const result = calculateProgressiveIncomeTax(20000, testBrackets);
    const expected = 
      (6790 * 0.10) +
      ((9730 - 6790) * 0.14) +
      ((15620 - 9730) * 0.20) +
      ((20000 - 15620) * 0.31);
    expect(result).toBeCloseTo(expected, 2);
  });

  it('should calculate tax for very high income', () => {
    const result = calculateProgressiveIncomeTax(100000, testBrackets);
    expect(result).toBeGreaterThan(0);
    // Should apply highest bracket rate to amount above 57880
    // Expected value calculated from brackets: 39400
    expect(result).toBeCloseTo(39400, 0);
  });

  it('should handle income exactly at bracket boundary', () => {
    const result = calculateProgressiveIncomeTax(6790, testBrackets);
    expect(result).toBe(6790 * 0.10);
  });
});
