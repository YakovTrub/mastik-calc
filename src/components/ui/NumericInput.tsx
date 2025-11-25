import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';

interface NumericInputProps extends React.ComponentProps<typeof Input> {
  value: number;
  onValueChange: (value: number) => void;
}

export const NumericInput: React.FC<NumericInputProps> = ({ value, onValueChange, ...props }) => {
  const [text, setText] = useState<string>(value === 0 ? '' : String(value));

  useEffect(() => {
    setText(value === 0 ? '' : String(value));
  }, [value]);

  const apply = (raw: string) => {
    if (!raw || raw.trim() === '') {
      onValueChange(0);
      setText('');
      return;
    }

    const parsed = parseFloat(raw.replace(/,/g, ''));
    if (isNaN(parsed)) {
      onValueChange(0);
      return;
    }

    onValueChange(parsed);
    setText(String(parsed));
  };

  const handleBlur = () => apply(text);

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
      apply(text);
    }
  };

  return (
    <Input
      {...props}
      type="number"
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    />
  );
};

export default NumericInput;
