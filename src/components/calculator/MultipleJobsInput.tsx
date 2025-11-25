import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import NumericInput from '@/components/ui/NumericInput';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import type { JobIncome } from '@/types/calculator';

interface MultipleJobsInputProps {
  jobs: JobIncome[];
  onChange: (jobs: JobIncome[]) => void;
}

export function MultipleJobsInput({ jobs, onChange }: MultipleJobsInputProps) {
  const { t } = useTranslation();

  const addJob = () => {
    const newJob: JobIncome = {
      id: `job-${Date.now()}`,
      grossSalary: 0,
      pensionRate: 6,
      creditPointsPercent: jobs.length === 0 ? 100 : 0
    };
    onChange([...jobs, newJob]);
  };

  const removeJob = (id: string) => {
    onChange(jobs.filter(job => job.id !== id));
  };

  const updateJob = (id: string, field: keyof JobIncome, value: number) => {
    onChange(jobs.map(job => 
      job.id === id ? { ...job, [field]: value } : job
    ));
  };

  const totalCreditPercent = jobs.reduce((sum, job) => sum + job.creditPointsPercent, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-semibold">{t('form.jobs') || 'Jobs'}</Label>
        <Button type="button" variant="outline" size="sm" onClick={addJob}>
          <Plus className="h-4 w-4 mr-2" />
          {t('form.addJob') || 'Add Job'}
        </Button>
      </div>

      {jobs.map((job, index) => (
        <Card key={job.id} className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">{t('form.job') || 'Job'} {index + 1}</h4>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={() => removeJob(job.id)}
              disabled={jobs.length === 1}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>{t('form.grossSalary') || 'Gross Salary'}</Label>
              <NumericInput
                value={job.grossSalary}
                onValueChange={(v) => updateJob(job.id, 'grossSalary', v)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label>{t('form.pensionRate') || 'Pension Rate %'}</Label>
              <NumericInput
                value={job.pensionRate}
                onValueChange={(v) => updateJob(job.id, 'pensionRate', v)}
                placeholder="6"
                step={0.1}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('form.creditPoints') || 'Credit Points %'}</Label>
              <NumericInput
                value={job.creditPointsPercent}
                onValueChange={(v) => updateJob(job.id, 'creditPointsPercent', Math.max(0, Math.min(100, Math.trunc(v) || 0)))}
                placeholder="0"
                min={0}
                max={100}
              />
            </div>
          </div>
        </Card>
      ))}

      {totalCreditPercent !== 100 && jobs.length > 0 && (
        <p className="text-sm text-warning">
          {t('form.creditPointsWarning') || 'Credit points allocation:'} {totalCreditPercent}% 
          {totalCreditPercent !== 100 && ` (${t('form.shouldBe100') || 'should be 100%'})`}
        </p>
      )}
    </div>
  );
}
