import React, { useEffect, useState } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { DayPicker } from 'react-day-picker';
import { Calendar } from 'lucide-react';
import 'react-day-picker/dist/style.css';

interface DatePickerInputProps {
  id?: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
}

function formatDate(d: Date | null): string {
  if (!d) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function parseDate(text: string): Date | null {
  const parts = text.split('/');
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  const date = new Date(year, month, day);
  if (date.getDate() !== day || date.getMonth() !== month || date.getFullYear() !== year) return null;
  return date;
}

export const DatePickerInput: React.FC<DatePickerInputProps> = ({ id, value, onChange, placeholder }) => {
  const [text, setText] = useState<string>(formatDate(value));
  const [open, setOpen] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    setText(formatDate(value));
  }, [value]);

  const validateAndApply = (raw: string) => {
    if (!raw || raw.trim() === '') {
      setError('');
      onChange(null);
      setText('');
      return;
    }

    const parsed = parseDate(raw);
    if (!parsed) {
      setError('Invalid date. Use DD/MM/YYYY');
      onChange(null);
      return;
    }

    setError('');
    onChange(parsed);
    setText(formatDate(parsed));
  };

  const handleBlur = () => validateAndApply(text);

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
      validateAndApply(text);
    }
    if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="flex items-center gap-2">
        <PopoverTrigger asChild>
          <div className="flex items-stretch w-full">
            <Input
              id={id}
              value={text}
              placeholder={placeholder}
              onChange={(e) => setText(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
            />
          </div>
        </PopoverTrigger>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md border p-2 bg-background hover:bg-accent/5"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle calendar"
        >
          <Calendar className="h-4 w-4" />
        </button>
      </div>

      <PopoverContent className="w-auto p-0">
        <div className="p-2">
          <DayPicker
            mode="single"
            selected={value ?? undefined}
            onSelect={(d) => {
              onChange(d ?? null);
              setError('');
              setOpen(false);
            }}
          />
        </div>
      </PopoverContent>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </Popover>
  );
};

export default DatePickerInput;
