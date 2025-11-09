import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { CalculatorForm } from '@/components/calculator/CalculatorForm';
import { ResultsDisplay } from '@/components/calculator/ResultsDisplay';
import { MultiSourceResultsDisplay } from '@/components/calculator/MultiSourceResultsDisplay';
import { calculateNetSalary } from '@/lib/calculator/taxEngine';
import { calculateMultiSourceIncome } from '@/lib/calculator/multiSourceEngine';
import { calculateSelfEmployedIncome } from '@/lib/calculator/selfEmployedEngine';
import { Info, Calculator } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LanguageSelector } from '@/components/LanguageSelector';
import type { CalculatorInputs, CalculationResult } from '@/types/calculator';
import type { MultiSourceCalculationResult } from '@/types/incomeSource';

export default function Index() {
  const { t } = useTranslation();
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [multiResult, setMultiResult] = useState<MultiSourceCalculationResult | null>(null);

  const handleCalculate = (inputs: CalculatorInputs) => {
    // Use multi-source engine for multiple employers or combined employment
    if (inputs.employmentType === 'multiple_employers' || inputs.employmentType === 'combined') {
      const multiSourceResult = calculateMultiSourceIncome(inputs);
      setMultiResult(multiSourceResult);
      setResult(null);
    } else if (inputs.employmentType === 'self_employed') {
      // Use self-employed engine
      const calculationResult = calculateSelfEmployedIncome(inputs);
      setResult(calculationResult);
      setMultiResult(null);
    } else {
      // Use single-source engine for single employer (employee)
      const calculationResult = calculateNetSalary(inputs);
      setResult(calculationResult);
      setMultiResult(null);
    }
    
    // Scroll to results
    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Calculator className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">MASTIK</h1>
              <p className="text-xs text-muted-foreground">{t('app.title')}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <Link to="/about">
              <Button variant="outline" size="sm">
                <Info className="mr-2 h-4 w-4" />
                About
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 border-b">
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {t('app.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('app.subtitle')}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Calculator Form */}
          <div>
            <CalculatorForm onCalculate={handleCalculate} />
          </div>

          {/* Results */}
          <div id="results">
            {result ? (
              <ResultsDisplay result={result} />
            ) : multiResult ? (
              <MultiSourceResultsDisplay result={multiResult} />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-muted-foreground p-8">
                  <Calculator className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p>{t('form.calculate')}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="text-center p-6 rounded-lg bg-card border">
            <div className="h-12 w-12 rounded-lg bg-primary/10 mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="font-semibold mb-2">Accurate Calculations</h3>
            <p className="text-sm text-muted-foreground">Based on official 2025 Israeli tax rules and regulations</p>
          </div>
          
          <div className="text-center p-6 rounded-lg bg-card border">
            <div className="h-12 w-12 rounded-lg bg-accent/10 mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="font-semibold mb-2">Credit Points</h3>
            <p className="text-sm text-muted-foreground">Comprehensive נקודות זיכוי calculation for all categories</p>
          </div>
          
          <div className="text-center p-6 rounded-lg bg-card border">
            <div className="h-12 w-12 rounded-lg bg-success/10 mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="font-semibold mb-2">Transparent</h3>
            <p className="text-sm text-muted-foreground">Clear breakdown of every deduction and contribution</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 py-8 bg-muted/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>MASTIK - Israeli Net Salary Calculator © 2025</p>
          <p className="mt-2">For informational purposes only. Consult a certified accountant for official calculations.</p>
        </div>
      </footer>
    </div>
  );
}
