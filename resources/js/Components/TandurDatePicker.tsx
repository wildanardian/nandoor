import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DayPicker, getDefaultClassNames } from 'react-day-picker';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import 'react-day-picker/style.css';

interface TandurDatePickerProps {
  value: Date | null | undefined; // Allow undefined for compatibility but treat as null
  onChange: (date: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  className?: string;
  placement?: 'top' | 'bottom';
}

export default function TandurDatePicker({
  value,
  onChange,
  placeholder = 'Pilih Tanggal',
  disabled = false,
  error,
  label,
  className = '',
  placement = 'bottom',
}: TandurDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const defaultClassNames = getDefaultClassNames();

  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;

      if (placement === 'top') {
        setCoords({
          top: rect.top + scrollY - 8, // 8px gap
          left: rect.left + scrollX,
          width: rect.width,
        });
      } else {
        setCoords({
          top: rect.bottom + scrollY + 8, // 8px gap
          left: rect.left + scrollX,
          width: rect.width,
        });
      }
    }
  };

  // ... (toggleOpen, handleSelect, useEffect existing logic) ...

  const toggleOpen = () => {
    if (!disabled) {
      if (!isOpen) updatePosition();
      setIsOpen((prev) => !prev);
    }
  };

  const handleSelect = (date: Date | undefined) => {
    onChange(date || null);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const clickedTrigger = triggerRef.current && triggerRef.current.contains(event.target as Node);
      const clickedPopup = popupRef.current && popupRef.current.contains(event.target as Node);

      if (!clickedTrigger && !clickedPopup) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  // ... (handleClear and displayDate existing logic) ...
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  const displayDate = value && !isNaN(value.getTime())
    ? format(value, 'd MMMM yyyy', { locale: idLocale })
    : null;

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      <div
        ref={triggerRef}
        onClick={toggleOpen}
        className={`
          relative w-full cursor-pointer rounded-xl border py-3 pl-4 pr-10 text-left bg-white shadow-sm transition-all flex items-center justify-between
          ${error
            ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500'
            : 'border-gray-200 focus:border-main focus:ring-1 focus:ring-main'
          }
          ${isOpen ? 'border-main ring-1 ring-main' : ''}
          ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-400' : ''}
        `}
      >
        <span className={`block truncate ${!displayDate ? 'text-gray-500' : 'text-gray-900'}`}>
          {displayDate || placeholder}
        </span>

        <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-1">
          {/* Clear Button */}
          {value && !disabled && (
            <div
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors z-10"
              role="button"
              title="Hapus tanggal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </div>
          )}

          {/* Calendar Icon */}
          <div className="pointer-events-none text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Portal Popup */}
      {isOpen && createPortal(
        <div
          ref={popupRef}
          style={{
            position: 'absolute',
            top: coords.top,
            left: coords.left,
            zIndex: 9999,
          }}
          className={`bg-white-tandur rounded-xl shadow-lg border border-gray-100 p-4 ${placement === 'top' ? '-translate-y-full' : ''}`}
        >
          <DayPicker
            locale={idLocale}
            mode="single"
            selected={value || undefined}
            onSelect={handleSelect}
            classNames={{
              day: `text-dark-tandur hover:bg-main/10 rounded-full`,
              today: `font-bold text-main`,
              selected: `bg-main text-white-tandur hover:bg-main hover:text-white-tandur rounded-full`,
              root: `${defaultClassNames.root}`,
              chevron: `fill-main`,
              head_cell: `text-gray-400 font-normal text-sm pb-2`,
              caption: `flex justify-between items-center mb-4`,
              button: `hover:bg-transparent`,
            }}
          />
        </div>,
        document.body
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
