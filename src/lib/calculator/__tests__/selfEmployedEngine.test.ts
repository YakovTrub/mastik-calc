import { describe, it, expect } from 'vitest';
import { calculateSelfEmployedIncome } from '../selfEmployedEngine';
import type { CalculatorInputs } from '@/types/calculator';

describe('Self-Employed Income Engine', () => {
  const baseInputs: CalculatorInputs = {
    employmentType: 'self_employed',
    grossSalary: 0,
    jobs: [],
    selfEmployedIncome: {
      type: 'esek_patur',
      revenue: 20000,
      expenseRate: 30
    },
    isResident: true,
    gender: 'male',
    dateOfBirth: new Date('1990-01-01'),
    maritalStatus: 'single',
    numberOfChildren: 0,
    childrenAges: [],
    isSingleParent: false,
    hasSpouseNoIncome: false,
    hasArmyService: false,
    armyServiceMonths: 0,
    armyDischargeDate: null,
    isNewImmigrant: false,
    immigrationDate: null,
    hasDisability: false,
    hasDisabilityExemption: false,
    locality: 'none',
    voluntaryPension: 0,
    hasSecondJob: false,
    secondJobIncome: 0,
    hasTeumMas: false,
    educationLevel: 'none',
    graduationDate: null,
    fringeBenefits: {
      car: 0,
      phone: 0,
      meals: 0,
      other: 0
    },
    donations: 0,
    hasKerenHistalmut: false,
    kerenHistalmutEmployeeRate: 0,
    kerenHistalmutEmployerRate: 0
  };

  it('should calculate basic self-employed income (Esek Patur)', () => {
    const result = calculateSelfEmployedIncome(baseInputs);
    
    expect(result.grossSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThan(result.grossSalary);
    expect(result.totalDeductions).toBeGreaterThan(0);
  });

  it('should calculate VAT for Osek Murshe', () => {
    const inputs: CalculatorInputs = {
      ...baseInputs,
      selfEmployedIncome: {
        type: 'esek_murshe',
        revenue: 20000,
        expenseRate: 30
      }
    };
    
    const result = calculateSelfEmployedIncome(inputs);
    
    // Should have VAT in breakdown
    const vatBreakdown = result.breakdown.find(b => b.category === 'VAT (Osek Murshe)');
    expect(vatBreakdown).toBeDefined();
    expect(vatBreakdown?.amount).toBe(20000 * 0.18);
  });

  it('should not calculate VAT for Esek Patur', () => {
    const result = calculateSelfEmployedIncome(baseInputs);
    
    const vatBreakdown = result.breakdown.find(b => b.category === 'VAT (Osek Murshe)');
    expect(vatBreakdown).toBeUndefined();
  });

  it('should apply disability exemption when enabled', () => {
    const inputs: CalculatorInputs = {
      ...baseInputs,
      hasDisabilityExemption: true
    };
    
    const result = calculateSelfEmployedIncome(inputs);
    
    const disabilityBreakdown = result.breakdown.find(b => b.category === 'Disability Exemption');
    expect(disabilityBreakdown).toBeDefined();
  });

  it('should apply donation credit', () => {
    const inputs: CalculatorInputs = {
      ...baseInputs,
      donations: 1000
    };
    
    const result = calculateSelfEmployedIncome(inputs);
    
    const donationBreakdown = result.breakdown.find(b => b.category.includes('Donation'));
    expect(donationBreakdown).toBeDefined();
    expect(donationBreakdown?.amount).toBeLessThan(0); // Should be negative (credit)
  });

  it('should include Keren Hishtalmut when enabled', () => {
    const inputs: CalculatorInputs = {
      ...baseInputs,
      hasKerenHistalmut: true,
      kerenHistalmutEmployeeRate: 5
    };
    
    const result = calculateSelfEmployedIncome(inputs);
    
    const kerenBreakdown = result.breakdown.find(b => b.category === 'Keren Hishtalmut');
    expect(kerenBreakdown).toBeDefined();
    expect(kerenBreakdown?.amount).toBeGreaterThan(0);
  });

  it('should have no employer contributions for self-employed', () => {
    const result = calculateSelfEmployedIncome(baseInputs);
    
    expect(result.pensionEmployer).toBe(0);
    expect(result.severanceEmployer).toBe(0);
  });

  it('should throw error when selfEmployedIncome is missing', () => {
    const inputs: CalculatorInputs = {
      ...baseInputs,
      selfEmployedIncome: undefined
    };
    
    expect(() => calculateSelfEmployedIncome(inputs)).toThrow();
  });
});
