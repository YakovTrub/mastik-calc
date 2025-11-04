export interface LocalityDiscount {
  code?: string;
  name: string;
  name_he?: string;
  name_ru?: string;
  discount_percent: number;
  max_income: number;
  valid_from?: string;
  valid_to?: string;
}

export function calculateLocalityDiscount(
  locality: string,
  incomeTax: number,
  grossSalary: number,
  localityDiscounts: LocalityDiscount[],
  currentDate: Date = new Date()
): { discount: number; isValid: boolean; warning?: string } {
  if (!locality || locality === 'none') {
    return { discount: 0, isValid: true };
  }
  
  const localityData = localityDiscounts.find(
    loc => loc.name === locality || loc.name_he === locality || loc.name_ru === locality
  );
  
  if (!localityData) {
    return { discount: 0, isValid: false, warning: 'Locality not found' };
  }
  
  // Check validity dates
  let isValid = true;
  let warning: string | undefined;
  
  if (localityData.valid_from) {
    const validFrom = new Date(localityData.valid_from);
    if (currentDate < validFrom) {
      isValid = false;
      warning = `Locality discount not yet valid (starts ${localityData.valid_from})`;
    }
  }
  
  if (localityData.valid_to) {
    const validTo = new Date(localityData.valid_to);
    if (currentDate > validTo) {
      isValid = false;
      warning = `Locality discount expired (ended ${localityData.valid_to})`;
    }
  }
  
  // Check income cap
  if (grossSalary > localityData.max_income) {
    return { discount: 0, isValid, warning: warning || 'Gross salary exceeds locality discount income cap' };
  }
  
  const discount = incomeTax * localityData.discount_percent;
  
  return { discount, isValid, warning };
}
