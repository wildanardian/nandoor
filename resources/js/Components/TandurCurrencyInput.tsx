import { useState, useEffect, useRef } from 'react';

interface TandurCurrencyInputProps {
  value: number | string | null; // Allow string in case backend returns it, but internally handle as string-formatted
  onChange: (value: number | null) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  className?: string;
  autoFocus?: boolean;
  prefix?: string;
}

export default function TandurCurrencyInput({
  value,
  onChange,
  placeholder = 'Rp 0',
  disabled = false,
  error,
  label,
  className = '',
  autoFocus = false,
  prefix = 'Rp',
}: TandurCurrencyInputProps) {
  // We keep a local string state to handle intermediate editing states (like typing)
  const [displayValue, setDisplayValue] = useState('');

  // Update display value when prop value changes
  useEffect(() => {
    if (value === null || value === '' || value === undefined) {
      setDisplayValue('');
    } else {
      // Format the number to IDR string
      const numVal = typeof value === 'string' ? parseInt(value) : value;
      if (!isNaN(numVal)) {
        setDisplayValue(formatRupiah(numVal));
      } else {
        setDisplayValue('');
      }
    }
  }, [value]);

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Remove "Rp", dots, and spaces to get the raw digits
    const cleanValue = inputValue.replace(/[^0-9]/g, '');

    // Convert to number for "onChange" (backend expectation)
    const numValue = cleanValue ? parseInt(cleanValue) : null;

    // Call prop onChange with the integer value (or null)
    onChange(numValue);

    // Update local display value immediately for responsiveness
    // (Though the useEffect will also sync it, doing it here creates smoother feel sometimes)
    // Actually relying on useEffect sync is safer for source-of-truth, 
    // but sometimes leads to cursor jumps.
    // For simple formatter, usually input -> clean -> onChange(num) -> prop updates -> useEffect formats -> display matches.
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative rounded-md shadow-sm">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <span className="text-gray-500 sm:text-sm">{prefix}</span>
        </div>
        <input
          type="text"
          inputMode="numeric"
          className={`
            block w-full rounded-xl border-gray-200 pl-10 focus:border-main focus:ring-main sm:text-sm py-3 transition-colors
            ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
            ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}
          `}
          placeholder={placeholder.replace(`${prefix} `, '')}
          value={displayValue}
          onChange={handleChange}
          disabled={disabled}
          autoFocus={autoFocus}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
