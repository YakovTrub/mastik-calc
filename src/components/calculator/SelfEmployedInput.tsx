import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import NumericInput from '@/components/ui/NumericInput';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { SelfEmployedIncome } from '@/types/calculator';

interface SelfEmployedInputProps {
  income: SelfEmployedIncome;
  onChange: (income: SelfEmployedIncome) => void;
}

export function SelfEmployedInput({ income, onChange }: SelfEmployedInputProps) {
  const { t } = useTranslation();

  return (
    <Card className="p-4">
      <h4 className="font-semibold mb-4">{t('form.selfEmployedIncome') || 'Self-Employed Income'}</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 md:col-span-2">
          <Label>{t('form.selfEmploymentType') || 'Self-Employment Type'}</Label>
          <Select 
            value={income.type}
            onValueChange={(value) => onChange({ ...income, type: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="esek_patur">{t('form.esekPatur') || 'Esek Patur (עוסק פטור)'}</SelectItem>
              <SelectItem value="esek_murshe">{t('form.esekMurshe') || 'Esek Murshe (עוסק מורשה)'}</SelectItem>
              <SelectItem value="esek_zair">{t('form.esekZair') || 'Esek Zair (עוסק זעיר)'}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t('form.revenue') || 'Revenue'}</Label>
          <NumericInput
            value={income.revenue}
            onValueChange={(v) => onChange({ ...income, revenue: v })}
            placeholder="0"
          />
        </div>

        <div className="space-y-2">
          <Label>{t('form.expenseRate') || 'Expense Rate %'}</Label>
          <Select 
            value={income.expenseRate.toString()}
            onValueChange={(value) => onChange({ ...income, expenseRate: parseFloat(value) })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30% (Default)</SelectItem>
              <SelectItem value="0">Actual Expenses</SelectItem>
              <SelectItem value="20">20%</SelectItem>
              <SelectItem value="40">40%</SelectItem>
              <SelectItem value="50">50%</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {income.expenseRate === 0 && (
          <div className="space-y-2 md:col-span-2">
            <Label>{t('form.actualExpenses') || 'Actual Expenses'}</Label>
            <NumericInput
              value={income.actualExpenses || 0}
              onValueChange={(v) => onChange({ ...income, actualExpenses: v })}
              placeholder="0"
            />
          </div>
        )}

        <div className="md:col-span-2 p-3 bg-muted/50 rounded-md">
          <p className="text-sm text-muted-foreground">
            {t('form.calculatedProfit') || 'Calculated Profit'}: 
            <span className="font-semibold ml-2">
              ₪{(income.revenue - (income.expenseRate > 0 ? income.revenue * (income.expenseRate / 100) : (income.actualExpenses || 0))).toLocaleString()}
            </span>
          </p>
        </div>
      </div>
    </Card>
  );
}
