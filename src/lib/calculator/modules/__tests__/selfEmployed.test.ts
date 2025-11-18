import { describe, it, expect } from 'vitest';
import { calculateSelfEmployedProfit, calculateSelfEmployedTaxBase } from '../selfEmployed';
import type { SelfEmployedIncome } from '@/types/calculator';

describe('Self-Employed Calculations', () => {
  describe('calculateSelfEmployedProfit', () => {
    it('should use actual expenses when provided', () => {
      const income: SelfEmployedIncome = {
        type: 'esek_patur',
        revenue: 10000,
        expenseRate: 30,
        actualExpenses: 3000
      };
      
      const profit = calculateSelfEmployedProfit(income);
      expect(profit).toBe(7000);
    });

    it('should use expense rate when actual expenses not provided', () => {
      const income: SelfEmployedIncome = {
        type: 'esek_patur',
        revenue: 10000,
        expenseRate: 30
      };
      
      const profit = calculateSelfEmployedProfit(income);
      expect(profit).toBe(7000); // 10000 - (10000 * 0.30)
    });

    it('should default to 30% expense rate', () => {
      const income: SelfEmployedIncome = {
        type: 'esek_patur',
        revenue: 10000,
        expenseRate: 30
      };
      
      const profit = calculateSelfEmployedProfit(income);
      expect(profit).toBe(7000);
    });

    it('should not allow negative profit', () => {
      const income: SelfEmployedIncome = {
        type: 'esek_patur',
        revenue: 1000,
        expenseRate: 30,
        actualExpenses: 2000
      };
      
      const profit = calculateSelfEmployedProfit(income);
      expect(profit).toBe(0);
    });

    it('should handle zero revenue', () => {
      const income: SelfEmployedIncome = {
        type: 'esek_patur',
        revenue: 0,
        expenseRate: 30
      };
      
      const profit = calculateSelfEmployedProfit(income);
      expect(profit).toBe(0);
    });
  });

  describe('calculateSelfEmployedTaxBase', () => {
    it('should deduct all contributions from profit', () => {
      const taxBase = calculateSelfEmployedTaxBase(10000, 600, 400, 500);
      expect(taxBase).toBe(10000 - 600 - 400 - 500);
    });

    it('should not allow negative tax base', () => {
      const taxBase = calculateSelfEmployedTaxBase(1000, 600, 400, 500);
      expect(taxBase).toBe(0);
    });

    it('should handle zero deductions', () => {
      const taxBase = calculateSelfEmployedTaxBase(10000, 0, 0, 0);
      expect(taxBase).toBe(10000);
    });
  });
});
