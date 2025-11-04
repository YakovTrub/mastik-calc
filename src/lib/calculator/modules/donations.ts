export interface DonationsConfig {
  monthly_cap: number;
  rate: number;
}

export function calculateDonationCredit(
  donationAmount: number,
  config: DonationsConfig
): number {
  if (donationAmount <= 0) return 0;
  
  const cappedDonation = Math.min(donationAmount, config.monthly_cap);
  return cappedDonation * config.rate;
}
