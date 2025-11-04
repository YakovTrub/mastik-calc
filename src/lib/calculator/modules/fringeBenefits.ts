export interface FringeBenefitsInput {
  car: number;
  phone: number;
  meals: number;
  other: number;
}

export function calculateTotalFringeBenefits(benefits: FringeBenefitsInput): number {
  return benefits.car + benefits.phone + benefits.meals + benefits.other;
}
