import { useState } from 'react';
import { apiService } from '@/services/api';
import { transformToApiInputs, transformFromApiResult } from '@/utils/apiTransform';
import type { CalculatorInputs, CalculationResult } from '@/types/calculator';
import type { MultiSourceCalculationResult } from '@/types/incomeSource';

export function useCalculator() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculate = async (inputs: CalculatorInputs): Promise<CalculationResult | MultiSourceCalculationResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const apiInputs = transformToApiInputs(inputs);
      const apiResult = await apiService.calculateSalary(apiInputs);
      const result = transformFromApiResult(apiResult);
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Calculation failed';
      setError(errorMessage);
      console.error('Calculation error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const checkBackendHealth = async (): Promise<boolean> => {
    try {
      await apiService.healthCheck();
      return true;
    } catch {
      return false;
    }
  };

  return {
    calculate,
    checkBackendHealth,
    loading,
    error,
  };
}
