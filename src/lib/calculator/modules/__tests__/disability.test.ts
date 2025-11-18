import { describe, it, expect } from 'vitest';
import { calculateDisabilityExemption } from '../disability';

describe('calculateDisabilityExemption', () => {
  const testConfig = {
    monthly_exemption_limit: 6120
  };

  it('should return 0 exemption when disability exemption is not enabled', () => {
    const result = calculateDisabilityExemption(10000, false, testConfig);
    
    expect(result.exemptedAmount).toBe(0);
    expect(result.residualBase).toBe(10000);
  });

  it('should exempt full amount when below limit', () => {
    const result = calculateDisabilityExemption(5000, true, testConfig);
    
    expect(result.exemptedAmount).toBe(5000);
    expect(result.residualBase).toBe(0);
  });

  it('should cap exemption at monthly limit', () => {
    const result = calculateDisabilityExemption(10000, true, testConfig);
    
    expect(result.exemptedAmount).toBe(6120);
    expect(result.residualBase).toBe(10000 - 6120);
  });

  it('should handle zero taxable base', () => {
    const result = calculateDisabilityExemption(0, true, testConfig);
    
    expect(result.exemptedAmount).toBe(0);
    expect(result.residualBase).toBe(0);
  });

  it('should handle amount exactly at limit', () => {
    const result = calculateDisabilityExemption(6120, true, testConfig);
    
    expect(result.exemptedAmount).toBe(6120);
    expect(result.residualBase).toBe(0);
  });
});
