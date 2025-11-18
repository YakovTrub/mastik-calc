import { describe, it, expect } from 'vitest';
import { calculateLocalityDiscount } from '../locality';
import type { LocalityDiscount } from '../locality';

describe('calculateLocalityDiscount', () => {
  const testLocalities: LocalityDiscount[] = [
    {
      code: 'LOC1',
      name: 'Test City',
      name_he: 'עיר בדיקה',
      discount_percent: 0.10,
      max_income: 20000
    },
    {
      code: 'LOC2',
      name: 'Expired City',
      discount_percent: 0.15,
      max_income: 25000,
      valid_from: '2024-01-01',
      valid_to: '2024-12-31'
    },
    {
      code: 'LOC3',
      name: 'Future City',
      discount_percent: 0.20,
      max_income: 30000,
      valid_from: '2026-01-01'
    }
  ];

  it('should return 0 discount for "none" locality', () => {
    const result = calculateLocalityDiscount('none', 1000, 15000, testLocalities);
    expect(result.discount).toBe(0);
    expect(result.isValid).toBe(true);
  });

  it('should return 0 discount for empty locality', () => {
    const result = calculateLocalityDiscount('', 1000, 15000, testLocalities);
    expect(result.discount).toBe(0);
    expect(result.isValid).toBe(true);
  });

  it('should calculate discount for valid locality', () => {
    const result = calculateLocalityDiscount('Test City', 1000, 15000, testLocalities);
    expect(result.discount).toBe(1000 * 0.10);
    expect(result.isValid).toBe(true);
    expect(result.discountPercent).toBe(10);
    expect(result.localityName).toBe('Test City');
  });

  it('should find locality by Hebrew name', () => {
    const result = calculateLocalityDiscount('עיר בדיקה', 1000, 15000, testLocalities);
    expect(result.discount).toBe(1000 * 0.10);
    expect(result.isValid).toBe(true);
  });

  it('should return 0 discount when salary exceeds max income', () => {
    const result = calculateLocalityDiscount('Test City', 1000, 25000, testLocalities);
    expect(result.discount).toBe(0);
    expect(result.warning).toContain('exceeds');
  });

  it('should handle expired locality', () => {
    const currentDate = new Date('2025-06-01');
    const result = calculateLocalityDiscount('Expired City', 1000, 15000, testLocalities, currentDate);
    expect(result.isValid).toBe(false);
    expect(result.warning).toContain('expired');
  });

  it('should handle future locality', () => {
    const currentDate = new Date('2025-06-01');
    const result = calculateLocalityDiscount('Future City', 1000, 15000, testLocalities, currentDate);
    expect(result.isValid).toBe(false);
    expect(result.warning).toContain('not yet valid');
  });

  it('should return warning for non-existent locality', () => {
    const result = calculateLocalityDiscount('Unknown City', 1000, 15000, testLocalities);
    expect(result.discount).toBe(0);
    expect(result.isValid).toBe(false);
    expect(result.warning).toBe('Locality not found');
  });

  it('should handle locality exactly at income limit', () => {
    const result = calculateLocalityDiscount('Test City', 1000, 20000, testLocalities);
    expect(result.discount).toBe(1000 * 0.10);
    expect(result.isValid).toBe(true);
  });
});
