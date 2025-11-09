import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, TrendingDown, DollarSign, Briefcase } from 'lucide-react';
import type { MultiSourceCalculationResult } from '@/types/incomeSource';

interface MultiSourceResultsDisplayProps {
  result: MultiSourceCalculationResult;
}

export function MultiSourceResultsDisplay({ result }: MultiSourceResultsDisplayProps) {
  const { t } = useTranslation();
  
  const formatCurrency = (amount: number) => {
    return `₪${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const percentOfGross = (amount: number) => {
    return ((amount / result.totalGrossIncome) * 100).toFixed(1);
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-muted-foreground">{t('results.netSalary')}</h3>
          <DollarSign className="h-6 w-6 text-success" />
        </div>
        <div className="text-4xl font-bold text-success mb-2">
          {formatCurrency(result.totalNetIncome)}
        </div>
        <p className="text-sm text-muted-foreground">
          {percentOfGross(result.totalNetIncome)}% {t('results.ofGross')}
        </p>
      </Card>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">{t('results.grossSalary')}</span>
            <TrendingUp className="h-4 w-4 text-success" />
          </div>
          <div className="text-2xl font-bold text-foreground mt-2">
            {formatCurrency(result.totalGrossIncome)}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">{t('results.totalDeductions')}</span>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </div>
          <div className="text-2xl font-bold text-destructive mt-2">
            -{formatCurrency(result.totalDeductions)}
          </div>
        </Card>
      </div>

      {/* Individual Sources */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          {t('results.multiSourceResults')}
        </h3>
        
        <div className="space-y-6">
          {result.sources.map((source, index) => (
            <div key={source.sourceId}>
              {index > 0 && <Separator className="my-4" />}
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-primary">{source.sourceName}</h4>
                  <span className="text-xs px-2 py-1 rounded-full bg-muted">
                    {source.sourceType === 'employee' ? t('form.employee') : t('form.selfEmployed')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between p-2 bg-muted/30 rounded">
                    <span className="text-muted-foreground">{t('results.grossSalary')}</span>
                    <span className="font-medium">{formatCurrency(source.grossIncome)}</span>
                  </div>
                  
                  <div className="flex justify-between p-2 bg-muted/30 rounded">
                    <span className="text-muted-foreground">{t('results.netSalary')}</span>
                    <span className="font-medium text-success">{formatCurrency(source.netIncome)}</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t('results.bituachLeumi')}</span>
                    <span className="text-destructive">-{formatCurrency(source.bituachLeumiEmployee)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t('results.pension')}</span>
                    <span className="text-destructive">-{formatCurrency(source.pensionEmployee)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t('results.taxBeforeCredits')}</span>
                    <span className="text-sm">{formatCurrency(source.incomeTaxBeforeCredits)}</span>
                  </div>
                  
                  {source.creditValueUsed > 0 && (
                    <div className="flex justify-between items-center text-success">
                      <span className="text-sm">
                        {t('results.creditsUsed')} ({source.creditPointsUsed.toFixed(2)} pts)
                      </span>
                      <span className="text-sm">-{formatCurrency(source.creditValueUsed)}</span>
                    </div>
                  )}
                  
                  {source.localityDiscount > 0 && (
                    <div className="flex justify-between items-center text-success">
                      <span className="text-sm">{t('results.localityDiscount')}</span>
                      <span className="text-sm">-{formatCurrency(source.localityDiscount)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center font-medium pt-2 border-t">
                    <span>{t('results.incomeTax')}</span>
                    <span className="text-destructive">-{formatCurrency(source.finalIncomeTax)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Totals Summary */}
      <Card className="p-6 bg-muted/30">
        <h4 className="font-semibold mb-3">{t('results.breakdown')}</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">{t('results.incomeTax')}</p>
            <p className="font-semibold text-destructive">{formatCurrency(result.totalIncomeTax)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">{t('results.bituachLeumi')}</p>
            <p className="font-semibold text-destructive">{formatCurrency(result.totalBituachLeumi)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">{t('results.pension')}</p>
            <p className="font-semibold text-destructive">{formatCurrency(result.totalPension)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">{t('results.creditPoints')}</p>
            <p className="font-semibold text-success">{result.totalCreditPoints.toFixed(2)} pts</p>
          </div>
        </div>
        
        {result.creditPointsRemaining > 0.01 && (
          <div className="mt-3 p-2 bg-warning/10 rounded text-sm text-warning">
            ⚠️ {result.creditPointsRemaining.toFixed(2)} credit points unused
          </div>
        )}
      </Card>

      {/* Tax Efficiency */}
      <Card className="p-4 bg-muted/50">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t('results.effectiveTaxRate')}</span>
          <span className="font-semibold">
            {((result.totalDeductions / result.totalGrossIncome) * 100).toFixed(1)}%
          </span>
        </div>
      </Card>
    </div>
  );
}
