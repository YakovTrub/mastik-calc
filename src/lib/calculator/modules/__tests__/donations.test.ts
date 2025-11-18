import { describe, it, expect } from 'vitest';
import { calculateDonationCredit } from '../donations';

describe('calculateDonationCredit', () => {
  const testConfig = {
    monthly_cap: 3500,
    rate: 0.35
  };

  it('should return 0 for zero donation', () => {
    const result = calculateDonationCredit(0, testConfig);
    expect(result).toBe(0);
  });

  it('should return 0 for negative donation', () => {
    const result = calculateDonationCredit(-100, testConfig);
    expect(result).toBe(0);
  });

  it('should calculate credit for donation below cap', () => {
    const result = calculateDonationCredit(1000, testConfig);
    expect(result).toBe(1000 * 0.35);
  });

  it('should cap donation credit at monthly cap', () => {
    const result = calculateDonationCredit(5000, testConfig);
    expect(result).toBe(3500 * 0.35);
  });

  it('should handle donation exactly at cap', () => {
    const result = calculateDonationCredit(3500, testConfig);
    expect(result).toBe(3500 * 0.35);
  });
});
