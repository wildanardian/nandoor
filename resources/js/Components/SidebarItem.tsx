import { Link } from '@inertiajs/react';
import { ReactNode } from 'react';

interface SidebarItemProps {
  label: string;
  href: string;
  active?: boolean;
  icon?: ReactNode;
  disabled?: boolean;
  tooltip?: string;
}

export default function SidebarItem({
  label,
  href,
  active = false,
  icon,
  disabled = false,
  tooltip,
}: SidebarItemProps) {
  return (
    <Link
      href={href}
      title={disabled ? (tooltip || label) : label}
      onClick={(e) => {
        if (disabled) e.preventDefault();
      }}
      className={`
                group flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200
                relative
                ${active
          ? 'bg-main text-white-tandur shadow-sm'
          : disabled
            ? 'text-gray-400 cursor-not-allowed bg-gray-50/50'
            : 'text-gray-600 hover:bg-main/10 hover:text-main'
        }
            `}
    >
      {icon && (
        <span
          className={`
                        h-5 w-5 shrink-0 transition-colors
                        ${active ? 'text-white-tandur' : disabled ? 'text-gray-300' : 'text-gray-400 group-hover:text-main'}
                    `}
        >
          {icon}
        </span>
      )}
      <span className="truncate">{label}</span>

      {/* Simple Tooltip on Hover if Disabled */}
      {disabled && tooltip && (
        <span className="absolute left-full ml-2 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none whitespace-normal max-w-[150px] shadow-lg">
          {tooltip}
        </span>
      )}
    </Link>
  );
}
