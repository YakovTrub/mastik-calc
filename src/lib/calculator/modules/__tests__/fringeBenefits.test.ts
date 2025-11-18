import { describe, it, expect } from 'vitest';
import { calculateTotalFringeBenefits } from '../fringeBenefits';
import type { FringeBenefitsInput } from '../fringeBenefits';

describe('calculateTotalFringeBenefits', () => {
  it('should sum all fringe benefits', () => {
    const benefits: FringeBenefitsInput = {
      car: 1000,
      phone: 200,
      meals: 300,
      other: 150
    };
    
    const total = calculateTotalFringeBenefits(benefits);
    expect(total).toBe(1650);
  });

  it('should handle zero benefits', () => {
    const benefits: FringeBenefitsInput = {
      car: 0,
      phone: 0,
      meals: 0,
      other: 0
    };
    
    const total = calculateTotalFringeBenefits(benefits);
    expect(total).toBe(0);
  });

  it('should handle partial benefits', () => {
    const benefits: FringeBenefitsInput = {
      car: 500,
      phone: 0,
      meals: 200,
      other: 0
    };
    
    const total = calculateTotalFringeBenefits(benefits);
    expect(total).toBe(700);
  });
});
