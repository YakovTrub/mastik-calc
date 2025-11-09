import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calculator } from 'lucide-react';
import { MultipleJobsInput } from './MultipleJobsInput';
import { SelfEmployedInput } from './SelfEmployedInput';
import type { CalculatorInputs, SelfEmployedIncome } from '@/types/calculator';
import taxRules from '@/config/taxRules2025.json';

interface CalculatorFormProps {
  onCalculate: (inputs: CalculatorInputs) => void;
}

export function CalculatorForm({ onCalculate }: CalculatorFormProps) {
  const { t } = useTranslation();
  const [inputs, setInputs] = useState<CalculatorInputs>({
    employmentType: 'employee',
    grossSalary: 15000,
    pensionBase: undefined,
    jobs: [],
    selfEmployedIncome: {
      type: 'esek_patur',
      revenue: 0,
      expenseRate: 30,
      actualExpenses: 0
    },
    isResident: true,
    gender: 'male',
    dateOfBirth: null,
    maritalStatus: 'single',
    numberOfChildren: 0,
    childrenAges: [],
    hasArmyService: false,
    armyServiceMonths: 0,
    armyDischargeDate: null,
    isNewImmigrant: false,
    immigrationDate: null,
    hasDisability: false,
    hasDisabilityExemption: false,
    locality: 'none',
    voluntaryPension: 0,
    hasSecondJob: false,
    secondJobIncome: 0,
    hasTeumMas: false,
    educationLevel: 'none',
    graduationDate: null,
    isSingleParent: false,
    hasSpouseNoIncome: false,
    fringeBenefits: {
      car: 0,
      phone: 0,
      meals: 0,
      other: 0
    },
    donations: 0,
    hasKerenHistalmut: false,
    kerenHistalmutEmployeeRate: 0,
    kerenHistalmutEmployerRate: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCalculate(inputs);
  };

  const [dateOfBirthText, setDateOfBirthText] = useState('');
  const [immigrationDateText, setImmigrationDateText] = useState('');

  const updateChildrenAges = (count: number) => {
    const ages = Array(count).fill(0).map((_, i) => inputs.childrenAges[i] || 0);
    setInputs({ ...inputs, numberOfChildren: count, childrenAges: ages });
  };

  const parseDateDDMMYYYY = (dateStr: string): Date | null => {
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
    const year = parseInt(parts[2], 10);
    
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    if (day < 1 || day > 31 || month < 0 || month > 11 || year < 1900 || year > new Date().getFullYear()) return null;
    
    const date = new Date(year, month, day);
    
    // Validate the date is valid (e.g., not Feb 30)
    if (date.getDate() !== day || date.getMonth() !== month || date.getFullYear() !== year) {
      return null;
    }
    
    return date;
  };

  const handleDateOfBirthChange = (value: string) => {
    setDateOfBirthText(value);
    const parsed = parseDateDDMMYYYY(value);
    setInputs({ ...inputs, dateOfBirth: parsed });
  };

  const handleImmigrationDateChange = (value: string) => {
    setImmigrationDateText(value);
    const parsed = parseDateDDMMYYYY(value);
    setInputs({ ...inputs, immigrationDate: parsed });
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">{t('form.title')}</h2>
        </div>

        {/* Employment Type Selector */}
        <div className="space-y-2">
          <Label htmlFor="employmentType">{t('form.employmentType')}</Label>
          <Select 
            value={inputs.employmentType}
            onValueChange={(value: any) => setInputs({ ...inputs, employmentType: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="employee">{t('form.employee')}</SelectItem>
              <SelectItem value="self_employed">{t('form.selfEmployed')}</SelectItem>
              <SelectItem value="combined">{t('form.combined')}</SelectItem>
              <SelectItem value="multiple_employers">{t('form.multipleEmployers')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Conditional Income Inputs based on Employment Type */}
        {inputs.employmentType === 'employee' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="grossSalary">{t('form.grossSalary')}</Label>
              <Input
                id="grossSalary"
                type="number"
                placeholder={t('form.grossSalaryPlaceholder')}
                value={inputs.grossSalary}
                onChange={(e) => setInputs({ ...inputs, grossSalary: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
          </div>
        )}

        {inputs.employmentType === 'multiple_employers' && (
          <MultipleJobsInput 
            jobs={inputs.jobs}
            onChange={(jobs) => setInputs({ ...inputs, jobs })}
          />
        )}

        {inputs.employmentType === 'self_employed' && (
          <SelfEmployedInput
            income={inputs.selfEmployedIncome || { type: 'esek_patur', revenue: 0, expenseRate: 30, actualExpenses: 0 }}
            onChange={(selfEmployedIncome) => setInputs({ ...inputs, selfEmployedIncome })}
          />
        )}

        {inputs.employmentType === 'combined' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="grossSalary">{t('form.grossSalary')} (Employment)</Label>
              <Input
                id="grossSalary"
                type="number"
                placeholder={t('form.grossSalaryPlaceholder')}
                value={inputs.grossSalary}
                onChange={(e) => setInputs({ ...inputs, grossSalary: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
            <SelfEmployedInput
              income={inputs.selfEmployedIncome || { type: 'esek_patur', revenue: 0, expenseRate: 30, actualExpenses: 0 }}
              onChange={(selfEmployedIncome) => setInputs({ ...inputs, selfEmployedIncome })}
            />
          </div>
        )}

        {/* Personal Information - Always shown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="gender">{t('form.sex')}</Label>
            <Select value={inputs.gender} onValueChange={(value: 'male' | 'female') => setInputs({ ...inputs, gender: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">{t('form.male')}</SelectItem>
                <SelectItem value="female">{t('form.female')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth (DD/MM/YYYY)</Label>
            <Input
              id="dateOfBirth"
              type="text"
              placeholder="DD/MM/YYYY"
              value={dateOfBirthText}
              onChange={(e) => handleDateOfBirthChange(e.target.value)}
              maxLength={10}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maritalStatus">{t('form.maritalStatus')}</Label>
            <Select value={inputs.maritalStatus} onValueChange={(value: any) => setInputs({ ...inputs, maritalStatus: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">{t('form.single')}</SelectItem>
                <SelectItem value="married">{t('form.married')}</SelectItem>
                <SelectItem value="divorced">{t('form.divorced')}</SelectItem>
                <SelectItem value="widowed">{t('form.widowed')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="numberOfChildren">{t('form.children')}</Label>
            <Input
              id="numberOfChildren"
              type="number"
              min="0"
              max="10"
              value={inputs.numberOfChildren}
              onChange={(e) => updateChildrenAges(parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        {inputs.numberOfChildren > 0 && (
          <div className="space-y-3">
            <Label>Children Ages</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {inputs.childrenAges.map((age, index) => (
                <Input
                  key={index}
                  type="number"
                  min="0"
                  max="18"
                  placeholder={`Child ${index + 1}`}
                  value={age}
                  onChange={(e) => {
                    const newAges = [...inputs.childrenAges];
                    newAges[index] = parseInt(e.target.value) || 0;
                    setInputs({ ...inputs, childrenAges: newAges });
                  }}
                />
              ))}
            </div>
            <div className="flex items-center space-x-2 mt-3">
              <Checkbox
                id="hasDisability"
                checked={inputs.hasDisability}
                onCheckedChange={(checked) => setInputs({ ...inputs, hasDisability: checked as boolean })}
              />
              <Label htmlFor="hasDisability" className="cursor-pointer">Has disabled child</Label>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isSingleParent"
              checked={inputs.isSingleParent}
              onCheckedChange={(checked) => setInputs({ ...inputs, isSingleParent: checked as boolean })}
            />
            <Label htmlFor="isSingleParent" className="cursor-pointer">Single Parent</Label>
          </div>

          {inputs.maritalStatus === 'married' && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasSpouseNoIncome"
                checked={inputs.hasSpouseNoIncome}
                onCheckedChange={(checked) => setInputs({ ...inputs, hasSpouseNoIncome: checked as boolean })}
              />
              <Label htmlFor="hasSpouseNoIncome" className="cursor-pointer">Spouse has no income</Label>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasArmyService"
              checked={inputs.hasArmyService}
              onCheckedChange={(checked) => setInputs({ ...inputs, hasArmyService: checked as boolean })}
            />
            <Label htmlFor="hasArmyService" className="cursor-pointer">Completed Army/National Service</Label>
          </div>

          {inputs.hasArmyService && (
            <div className="ml-6 space-y-2">
              <Label htmlFor="armyServiceMonths">{t('form.serviceMonths')}</Label>
              <Input
                id="armyServiceMonths"
                type="number"
                min="12"
                max="36"
                value={inputs.armyServiceMonths}
                onChange={(e) => setInputs({ ...inputs, armyServiceMonths: parseInt(e.target.value) || 0 })}
              />
              <Label htmlFor="armyDischargeDate">{t('form.dischargeDate')}</Label>
              <Input
                id="armyDischargeDate"
                type="text"
                placeholder="DD/MM/YYYY"
                onChange={(e) => {
                  const parsed = parseDateDDMMYYYY(e.target.value);
                  setInputs({ ...inputs, armyDischargeDate: parsed });
                }}
                maxLength={10}
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isNewImmigrant"
              checked={inputs.isNewImmigrant}
              onCheckedChange={(checked) => setInputs({ ...inputs, isNewImmigrant: checked as boolean })}
            />
            <Label htmlFor="isNewImmigrant" className="cursor-pointer">{t('form.isNewImmigrant')}</Label>
          </div>

          {inputs.isNewImmigrant && (
            <div className="ml-6 space-y-2">
              <Label htmlFor="immigrationDate">{t('form.aliyahDate')}</Label>
              <Input
                id="immigrationDate"
                type="text"
                placeholder="DD/MM/YYYY"
                value={immigrationDateText}
                onChange={(e) => handleImmigrationDateChange(e.target.value)}
                maxLength={10}
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="educationLevel">{t('form.educationLevel')}</Label>
          <Select value={inputs.educationLevel} onValueChange={(value: any) => setInputs({ ...inputs, educationLevel: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{t('form.educationNone')}</SelectItem>
              <SelectItem value="bachelor">{t('form.bachelor')}</SelectItem>
              <SelectItem value="master">{t('form.master')}</SelectItem>
              <SelectItem value="doctorate">{t('form.doctorate')}</SelectItem>
              <SelectItem value="professional">{t('form.professional')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {inputs.educationLevel !== 'none' && (
          <div className="space-y-2">
            <Label htmlFor="graduationDate">{t('form.graduationDate')}</Label>
            <Input
              id="graduationDate"
              type="text"
              placeholder="DD/MM/YYYY"
              onChange={(e) => {
                const parsed = parseDateDDMMYYYY(e.target.value);
                setInputs({ ...inputs, graduationDate: parsed });
              }}
              maxLength={10}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="locality">Eligible Locality (Optional)</Label>
          <Select value={inputs.locality} onValueChange={(value) => setInputs({ ...inputs, locality: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select locality" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {taxRules.locality_discounts.map((loc) => (
                <SelectItem key={loc.name} value={loc.name}>
                  {loc.name} ({loc.discount_percent * 100}% discount)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4 border-t pt-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasKerenHistalmut"
              checked={inputs.hasKerenHistalmut}
              onCheckedChange={(checked) => setInputs({ ...inputs, hasKerenHistalmut: checked as boolean })}
            />
            <Label htmlFor="hasKerenHistalmut" className="cursor-pointer font-semibold">
              {t('form.hasKerenHistalmut')}
            </Label>
          </div>

          {inputs.hasKerenHistalmut && (
            <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="kerenEmployeeRate">{t('form.kerenEmployeeRate')}</Label>
                <Input
                  id="kerenEmployeeRate"
                  type="number"
                  min="0"
                  max="7.5"
                  step="0.5"
                  value={inputs.kerenHistalmutEmployeeRate}
                  onChange={(e) => setInputs({ ...inputs, kerenHistalmutEmployeeRate: parseFloat(e.target.value) || 0 })}
                  placeholder="2.5%"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kerenEmployerRate">{t('form.kerenEmployerRate')}</Label>
                <Input
                  id="kerenEmployerRate"
                  type="number"
                  min="0"
                  max="7.5"
                  step="0.5"
                  value={inputs.kerenHistalmutEmployerRate}
                  onChange={(e) => setInputs({ ...inputs, kerenHistalmutEmployerRate: parseFloat(e.target.value) || 0 })}
                  placeholder="2.5%"
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4 border-t pt-4">
          <h3 className="font-semibold text-lg">{t('form.donations')}</h3>
          
          <div className="space-y-2">
            <Label htmlFor="donations">{t('form.donations')}</Label>
            <Input
              id="donations"
              type="number"
              min="0"
              value={inputs.donations}
              onChange={(e) => setInputs({ ...inputs, donations: parseFloat(e.target.value) || 0 })}
              placeholder={t('form.donationsPlaceholder')}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasDisabilityExemption"
              checked={inputs.hasDisabilityExemption}
              onCheckedChange={(checked) => 
                setInputs({ ...inputs, hasDisabilityExemption: checked as boolean })
              }
            />
            <Label htmlFor="hasDisabilityExemption" className="cursor-pointer">
              {t('form.hasDisabilityExemption')}
            </Label>
          </div>
        </div>

        <div className="space-y-4 border-t pt-4">
          <h3 className="font-semibold text-lg">{t('form.fringeBenefits')}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fringeCar">{t('form.carBenefit')}</Label>
              <Input
                id="fringeCar"
                type="number"
                min="0"
                value={inputs.fringeBenefits.car}
                onChange={(e) => setInputs({ 
                  ...inputs, 
                  fringeBenefits: { ...inputs.fringeBenefits, car: parseFloat(e.target.value) || 0 }
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fringePhone">{t('form.phoneBenefit')}</Label>
              <Input
                id="fringePhone"
                type="number"
                min="0"
                value={inputs.fringeBenefits.phone}
                onChange={(e) => setInputs({ 
                  ...inputs, 
                  fringeBenefits: { ...inputs.fringeBenefits, phone: parseFloat(e.target.value) || 0 }
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fringeMeals">{t('form.mealsBenefit')}</Label>
              <Input
                id="fringeMeals"
                type="number"
                min="0"
                value={inputs.fringeBenefits.meals}
                onChange={(e) => setInputs({ 
                  ...inputs, 
                  fringeBenefits: { ...inputs.fringeBenefits, meals: parseFloat(e.target.value) || 0 }
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fringeOther">{t('form.otherBenefits')}</Label>
              <Input
                id="fringeOther"
                type="number"
                min="0"
                value={inputs.fringeBenefits.other}
                onChange={(e) => setInputs({ 
                  ...inputs, 
                  fringeBenefits: { ...inputs.fringeBenefits, other: parseFloat(e.target.value) || 0 }
                })}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="isResident"
            checked={inputs.isResident}
            onCheckedChange={(checked) => 
              setInputs({ ...inputs, isResident: checked as boolean })
            }
          />
          <Label htmlFor="isResident" className="cursor-pointer">
            {t('form.isResident')}
          </Label>
        </div>

        <Button type="submit" className="w-full" size="lg">
          <Calculator className="mr-2 h-5 w-5" />
          {t('form.calculate')}
        </Button>
      </form>
    </Card>
  );
}
