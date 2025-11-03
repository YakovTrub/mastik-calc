import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import type { CalculationResult } from '@/types/calculator';

interface ResultsDisplayProps {
  result: CalculationResult;
}

export function ResultsDisplay({ result }: ResultsDisplayProps) {
  const formatCurrency = (amount: number) => {
    return `₪${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const percentOfGross = (amount: number) => {
    return ((amount / result.grossSalary) * 100).toFixed(1);
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-muted-foreground">Net Monthly Salary</h3>
          <DollarSign className="h-6 w-6 text-success" />
        </div>
        <div className="text-4xl font-bold text-success mb-2">
          {formatCurrency(result.netSalary)}
        </div>
        <p className="text-sm text-muted-foreground">
          {percentOfGross(result.netSalary)}% of gross salary
        </p>
      </Card>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Gross Salary</span>
            <TrendingUp className="h-4 w-4 text-success" />
          </div>
          <div className="text-2xl font-bold text-foreground mt-2">
            {formatCurrency(result.grossSalary)}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Total Deductions</span>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </div>
          <div className="text-2xl font-bold text-destructive mt-2">
            -{formatCurrency(result.totalDeductions)}
          </div>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Detailed Breakdown</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-muted-foreground">Taxable Base</span>
            <span className="font-medium">{formatCurrency(result.taxableBase)}</span>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Income Tax (before credits)</span>
              <span className="text-sm">{formatCurrency(result.incomeTaxBeforeCredits)}</span>
            </div>
            
            <div className="flex justify-between items-center text-success">
              <span className="text-sm">Credit Points ({result.creditPoints.toFixed(2)})</span>
              <span className="text-sm">-{formatCurrency(result.creditValue)}</span>
            </div>
            
            {result.localityDiscount > 0 && (
              <div className="flex justify-between items-center text-success">
                <span className="text-sm">Locality Discount</span>
                <span className="text-sm">-{formatCurrency(result.localityDiscount)}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center font-medium pt-2 border-t">
              <span className="text-sm">Income Tax (final)</span>
              <span className="text-destructive">{formatCurrency(result.incomeTaxAfterCredits - result.localityDiscount)}</span>
            </div>
          </div>
          
          <Separator />
          
          {result.breakdown.map((item, index) => (
            <div key={index} className="flex justify-between items-center py-1">
              <div className="flex-1">
                <span className="text-sm font-medium">{item.category}</span>
                {item.isTaxDeductible && (
                  <span className="ml-2 text-xs text-success">(Tax Deductible)</span>
                )}
              </div>
              <span className="text-sm text-destructive">{formatCurrency(item.amount)}</span>
            </div>
          ))}
          
          <Separator />
          
          <div className="pt-2">
            <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Employer Contributions</h4>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm">Pension (Employer)</span>
                <span className="text-sm text-success">+{formatCurrency(result.pensionEmployer)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Severance Fund</span>
                <span className="text-sm text-success">+{formatCurrency(result.severanceEmployer)}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Tax Efficiency */}
      <Card className="p-4 bg-muted/50">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Effective Tax Rate</span>
          <span className="font-semibold">
            {((result.totalDeductions / result.grossSalary) * 100).toFixed(1)}%
          </span>
        </div>
      </Card>
    </div>
  );
}
