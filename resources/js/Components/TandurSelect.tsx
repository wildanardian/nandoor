import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface Option {
  label: string;
  value: string | number;
}

interface TandurSelectProps {
  label?: string;
  value: string | number;
  onChange: (value: any) => void;
  options: Option[];
  placeholder?: string;
  searchable?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  className?: string; // Wrapper className
  onAddNew?: () => void; // Callback for adding new item
  onSearch?: (query: string) => void; // Async search callback
}

export default function TandurSelect({
  label,
  value,
  onChange,
  options,
  placeholder = 'Pilih salah satu...',
  searchable = true,
  disabled = false,
  error,
  helperText,
  className = '',
  onAddNew,
  onSearch,
}: TandurSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search query
  const filteredOptions = onSearch
    ? options
    : options.filter((option) =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Get current selected label
  const selectedOption = options.find((opt) => opt.value == value); // loose equality for string/number match

  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (onSearch) {
      onSearch(val);
    }
  };

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check triggerRef (in normal DOM)
      const clickedTrigger = triggerRef.current && triggerRef.current.contains(event.target as Node);

      // Check dropdownRef (in Portal)
      const clickedDropdown = dropdownRef.current && dropdownRef.current.contains(event.target as Node);

      if (!clickedTrigger && !clickedDropdown) {
        setIsOpen(false);
        setSearchQuery(''); // Reset search on close
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Handle Text Selection/Highlight reset
  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(0);
    }
  }, [isOpen]);

  // Handle Resize and Scroll to reposition
  useEffect(() => {
    if (isOpen) {
      updatePosition();
      // Capture phase true to catch scroll events from any scrollable parent
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);

      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen]);

  // Keyboard Navigation
  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : prev
          );
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (filteredOptions[highlightedIndex]) {
            handleSelect(filteredOptions[highlightedIndex].value);
          }
        } else if (e.key === 'Escape') {
          setIsOpen(false);
        } else if (e.key === 'Tab') {
          setIsOpen(false);
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, filteredOptions, highlightedIndex]);

  // Focus search input on open
  useEffect(() => {
    if (isOpen && searchable) {
      // Little delay to ensure portal is rendered
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 50);
    }
  }, [isOpen, searchable]);

  const handleSelect = (val: string | number) => {
    onChange(val);
    setIsOpen(false);
    setSearchQuery('');
  };

  const toggleDropdown = () => {
    if (!disabled) {
      if (!isOpen) {
        updatePosition();
      }
      setIsOpen((prev) => !prev);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <div
        ref={triggerRef}
        onClick={toggleDropdown}
        className={`
          relative w-full cursor-pointer rounded-xl border py-3 pl-4 pr-10 text-left bg-white shadow-sm transition-all
          ${error
            ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500'
            : 'border-gray-200 focus:border-main focus:ring-1 focus:ring-main'
          }
          ${isOpen ? 'border-main ring-1 ring-main' : ''}
          ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-400' : ''}
        `}
        tabIndex={disabled ? -1 : 0}
      >
        <span className={`block truncate ${!selectedOption ? 'text-gray-500' : 'text-gray-900'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
          <svg
            className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </div>

      {/* Dropdown Menu via Portal */}
      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: coords.top,
            left: coords.left,
            width: coords.width,
            zIndex: 9999, // High z-index to overlay modals
          }}
          className="mt-1 max-h-60 overflow-auto rounded-xl bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
        >
          {/* Search Input */}
          {searchable && (
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-3 py-2">
              <input
                ref={searchInputRef}
                type="text"
                className="block w-full rounded-md border-0 bg-gray-50 py-1.5 pl-3 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-main sm:text-sm sm:leading-6"
                placeholder="Cari..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking input
              />
            </div>
          )}


          {/* Add New Action (Fixed at Top) */}
          {onAddNew && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onAddNew();
              }}
              className="sticky top-[50px] z-10 cursor-pointer border-b border-gray-100 bg-white px-3 py-2 text-sm font-medium text-main hover:bg-main/5 transition-colors flex items-center gap-2"
              // Adjust styling to ensure it sits below search sticky
              style={{
                top: searchable ? '50px' : '0px' // search input height approx 50px including padding
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Tambah Item Baru
            </div>
          )}

          {/* Options List */}
          {filteredOptions.length === 0 ? (
            <div className="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-500 italic text-center">
              Tidak ada data{onAddNew ? '. Silakan tambah baru.' : '.'}
            </div>
          ) : (
            filteredOptions.map((option, index) => {
              const isSelected = option.value == value;
              const isHighlighted = highlightedIndex === index;

              return (
                <div
                  key={`${option.value}-${index}`}
                  onClick={() => handleSelect(option.value)}
                  className={`
                    relative cursor-pointer select-none py-2 pl-3 pr-9 transition-colors
                    ${isSelected ? 'bg-main/10 text-main font-medium' : 'text-gray-900'}
                    ${isHighlighted && !isSelected ? 'bg-main/5' : ''}
                    hover:bg-main/5
                  `}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <span className={`block truncate ${isSelected ? 'font-semibold' : 'font-normal'}`}>
                    {option.label}
                  </span>

                  {isSelected && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-main">
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>,
        document.body
      )}

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* Helper Text */}
      {!error && helperText && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}
