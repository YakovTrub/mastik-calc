import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calculator, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import type { CalculatorInputs } from '@/types/calculator';
import taxRules from '@/config/taxRules2025.json';
import { cn } from '@/lib/utils';

interface CalculatorFormProps {
  onCalculate: (inputs: CalculatorInputs) => void;
}

export function CalculatorForm({ onCalculate }: CalculatorFormProps) {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    grossSalary: 15000,
    gender: 'male',
    dateOfBirth: null,
    maritalStatus: 'single',
    numberOfChildren: 0,
    childrenAges: [],
    hasArmyService: false,
    armyServiceMonths: 0,
    isNewImmigrant: false,
    immigrationDate: null,
    hasDisability: false,
    locality: 'none',
    voluntaryPension: 0,
    hasSecondJob: false,
    secondJobIncome: 0,
    educationLevel: 'none',
    isSingleParent: false,
    hasSpouseNoIncome: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCalculate(inputs);
  };

  const updateChildrenAges = (count: number) => {
    const ages = Array(count).fill(0).map((_, i) => inputs.childrenAges[i] || 0);
    setInputs({ ...inputs, numberOfChildren: count, childrenAges: ages });
  };

  const calculateAge = (birthDate: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Salary Calculator</h2>
          <p className="text-muted-foreground">Enter your details to calculate net salary</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="grossSalary">Gross Monthly Salary (₪)</Label>
            <Input
              id="grossSalary"
              type="number"
              value={inputs.grossSalary}
              onChange={(e) => setInputs({ ...inputs, grossSalary: parseFloat(e.target.value) })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select value={inputs.gender} onValueChange={(value: 'male' | 'female') => setInputs({ ...inputs, gender: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !inputs.dateOfBirth && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {inputs.dateOfBirth ? format(inputs.dateOfBirth, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={inputs.dateOfBirth || undefined}
                  onSelect={(date) => setInputs({ ...inputs, dateOfBirth: date || null })}
                  disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maritalStatus">Marital Status</Label>
            <Select value={inputs.maritalStatus} onValueChange={(value: any) => setInputs({ ...inputs, maritalStatus: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="married">Married</SelectItem>
                <SelectItem value="divorced">Divorced</SelectItem>
                <SelectItem value="widowed">Widowed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="numberOfChildren">Number of Children</Label>
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
              <Label htmlFor="armyServiceMonths">Service Duration (months)</Label>
              <Input
                id="armyServiceMonths"
                type="number"
                min="12"
                max="36"
                value={inputs.armyServiceMonths}
                onChange={(e) => setInputs({ ...inputs, armyServiceMonths: parseInt(e.target.value) || 0 })}
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isNewImmigrant"
              checked={inputs.isNewImmigrant}
              onCheckedChange={(checked) => setInputs({ ...inputs, isNewImmigrant: checked as boolean })}
            />
            <Label htmlFor="isNewImmigrant" className="cursor-pointer">New Immigrant (Oleh Chadash)</Label>
          </div>

          {inputs.isNewImmigrant && (
            <div className="ml-6 space-y-2">
              <Label htmlFor="immigrationDate">Immigration Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !inputs.immigrationDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {inputs.immigrationDate ? format(inputs.immigrationDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={inputs.immigrationDate || undefined}
                    onSelect={(date) => setInputs({ ...inputs, immigrationDate: date || null })}
                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="educationLevel">Education Level</Label>
          <Select value={inputs.educationLevel} onValueChange={(value: any) => setInputs({ ...inputs, educationLevel: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
              <SelectItem value="master">Master's Degree</SelectItem>
              <SelectItem value="doctorate">Doctorate/Medical</SelectItem>
              <SelectItem value="professional">Professional Certificate</SelectItem>
            </SelectContent>
          </Select>
        </div>

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

        <div className="space-y-2">
          <Label htmlFor="voluntaryPension">Voluntary Pension/Keren Hishtalmut (₪)</Label>
          <Input
            id="voluntaryPension"
            type="number"
            min="0"
            value={inputs.voluntaryPension}
            onChange={(e) => setInputs({ ...inputs, voluntaryPension: parseFloat(e.target.value) || 0 })}
          />
        </div>

        <Button type="submit" className="w-full" size="lg">
          <Calculator className="mr-2 h-5 w-5" />
          Calculate Net Salary
        </Button>
      </form>
    </Card>
  );
}
