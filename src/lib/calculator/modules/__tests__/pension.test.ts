import { describe, it, expect } from 'vitest';
import { calculatePension, calculateSelfEmployedPension } from '../pension';
import type { PensionConfig } from '@/types/calculator';

describe('Pension Calculations', () => {
  const testConfig: PensionConfig = {
    employee_rate: 0.06,
    employer_pension_rate: 0.06,
    employer_severance_rate: 0.06,
    recognized_wage_ceiling: 49030,
    max_recognized_employee_7pct: 679,
    employer_recognized_base: 33290,
    severance_info_base: 12705,
    self_employed_min_rate: 0.0445,
    self_employed_employer_rate: 0.1255,
    self_employed_max_rate: 0.17,
    self_employed_max_annual: 245280
  };

  describe('calculatePension', () => {
    it('should calculate basic pension for standard salary', () => {
      const result = calculatePension(10000, 10000, testConfig);
      
      expect(result.employeeContribution).toBe(10000 * 0.06);
      expect(result.employerPension).toBe(10000 * 0.06);
      expect(result.employerSeverance).toBe(10000 * 0.06);
      expect(result.taxCredit35Percent).toBeCloseTo(600 * 0.35, 2);
      expect(result.taxableBenefitToEmployee).toBe(0);
    });

    it('should cap tax credit at max recognized amount', () => {
      const result = calculatePension(15000, 15000, testConfig);
      
      expect(result.employeeContribution).toBe(15000 * 0.06);
      // Tax credit should be capped at 679 * 0.35
      expect(result.taxCredit35Percent).toBe(679 * 0.35);
    });

    it('should calculate taxable benefit when exceeding employer recognized base', () => {
      const pensionBase = 40000;
      const result = calculatePension(40000, pensionBase, testConfig);
      
      const excessBase = pensionBase - testConfig.employer_recognized_base;
      const expectedTaxableBenefit = excessBase * testConfig.employer_pension_rate;
      
      expect(result.taxableBenefitToEmployee).toBeCloseTo(expectedTaxableBenefit, 2);
    });

    it('should not create taxable benefit below employer recognized base', () => {
      const result = calculatePension(20000, 20000, testConfig);
      expect(result.taxableBenefitToEmployee).toBe(0);
    });
  });

  describe('calculateSelfEmployedPension', () => {
    it('should calculate self-employed pension correctly', () => {
      const profit = 15000;
      const result = calculateSelfEmployedPension(profit, testConfig);
      
      expect(result.employeeContribution).toBe(profit * 0.0445);
      expect(result.employerPension).toBe(profit * 0.1255);
      expect(result.employerSeverance).toBe(0);
      expect(result.taxableBenefitToEmployee).toBe(0);
    });

    it('should cap tax credit for self-employed', () => {
      const profit = 50000;
      const result = calculateSelfEmployedPension(profit, testConfig);
      
      expect(result.taxCredit35Percent).toBe(679 * 0.35);
    });

    it('should handle zero profit', () => {
      const result = calculateSelfEmployedPension(0, testConfig);
      
      expect(result.employeeContribution).toBe(0);
      expect(result.employerPension).toBe(0);
      expect(result.taxCredit35Percent).toBe(0);
    });
  });
});
