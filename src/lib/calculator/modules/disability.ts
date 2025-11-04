export interface DisabilityExemptionConfig {
  monthly_exemption_limit: number;
}

export function calculateDisabilityExemption(
  taxableBase: number,
  hasDisabilityExemption: boolean,
  config: DisabilityExemptionConfig
): { exemptedAmount: number; residualBase: number } {
  if (!hasDisabilityExemption) {
    return {
      exemptedAmount: 0,
      residualBase: taxableBase
    };
  }
  
  const exemptedAmount = Math.min(taxableBase, config.monthly_exemption_limit);
  const residualBase = Math.max(0, taxableBase - exemptedAmount);
  
  return {
    exemptedAmount,
    residualBase
  };
}
