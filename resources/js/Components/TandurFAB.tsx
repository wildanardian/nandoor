import { useState, useRef, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { Transition } from '@headlessui/react';

export interface FABAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  color?: string; // tailwind class for background
  disabled?: boolean;
}

interface TandurFABProps {
  actions: FABAction[];
  show?: boolean;
}

export default function TandurFAB({ actions, show = true }: TandurFABProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);

  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end" ref={menuRef}>

      {/* Menu Items */}
      <Transition
        show={isOpen}
        enter="transition-all duration-200 ease-out"
        enterFrom="opacity-0 translate-y-4 scale-95"
        enterTo="opacity-100 translate-y-0 scale-100"
        leave="transition-all duration-150 ease-in"
        leaveFrom="opacity-100 translate-y-0 scale-100"
        leaveTo="opacity-0 translate-y-4 scale-95"
      >
        <div className="flex flex-col gap-3 mb-4 items-end">
          {actions.map((action, idx) => (
            <div key={idx} className="flex items-center gap-3 group">
              {/* Label (Desktop: hover only, Mobile: always visible or side) */}
              <span className={`
                px-3 py-1 rounded-md bg-white shadow-md text-sm font-medium text-gray-700
                opacity-0 group-hover:opacity-100 transition-opacity duration-200
                hidden md:block whitespace-nowrap
              `}>
                {action.label}
              </span>
              {/* Mobile Label (Always visible when menu open) */}
              <span className="md:hidden px-3 py-1 rounded-lg bg-white/90 shadow-sm backdrop-blur-sm text-xs font-bold text-gray-800 whitespace-nowrap">
                {action.label}
              </span>

              {/* Action Button */}
              <button
                onClick={() => {
                  if (!action.disabled) {
                    action.onClick();
                    setIsOpen(false);
                  }
                }}
                disabled={action.disabled}
                className={`
                  p-3 rounded-full shadow-lg text-white transition-transform hover:scale-110 active:scale-95
                  ${action.color || 'bg-main'}
                  ${action.disabled ? 'opacity-50 cursor-not-allowed grayscale' : ''}
                `}
                title={action.label}
              >
                {action.icon}
              </button>
            </div>
          ))}
        </div>
      </Transition>

      {/* Main Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          p-4 rounded-full shadow-xl text-white-tandur transition-all duration-300
          ${isOpen ? 'bg-red-500 rotate-45' : 'bg-main hover:bg-main/90'}
        `}
      >
        <Plus className="w-6 h-6 stroke-[3px]" />
      </button>
    </div>
  );
}
