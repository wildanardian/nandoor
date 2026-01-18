import { Link } from '@inertiajs/react';
import { ReactNode, useState, useRef } from 'react';
import { createPortal } from 'react-dom';

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
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const itemRef = useRef<HTMLAnchorElement>(null);

  const handleMouseEnter = () => {
    if (!disabled || !tooltip) return;
    if (itemRef.current) {
      const rect = itemRef.current.getBoundingClientRect();
      // Calculate position: Right of the item, centered vertically
      setTooltipPos({
        top: rect.top + (rect.height / 2),
        left: rect.right + 10
      });
      setShowTooltip(true);
    }
  };

  return (
    <>
      <Link
        ref={itemRef}
        href={href}
        // Native title fallback is removed to prevent double tooltip, 
        // or kep kept for accessibility? 'title' attribute shows native browser tooltip.
        // User asked about "pesan hitam" so they prefer the custom one.
        // Keeping title might show double tooltips. Let's remove 'title' prop if we show custom.
        // But for accessibility 'aria-disabled' and maybe 'aria-label' is better?
        // Let's keep it simple: Remove native title if disabled to rely on custom.
        // actually title={disabled ? label : label} is fine, just don't put the tooltip text in title if custom is showing.
        onClick={(e) => {
          if (disabled) e.preventDefault();
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShowTooltip(false)}
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
      </Link>

      {showTooltip && tooltip && createPortal(
        <div
          className="fixed z-[9999] px-3 py-2 bg-gray-800 text-white text-xs rounded-md shadow-lg pointer-events-none whitespace-normal max-w-[200px] animate-fade-in"
          style={{
            top: tooltipPos.top,
            left: tooltipPos.left,
            transform: 'translateY(-50%)' // Center vertically
          }}
        >
          {/* Arrow */}
          <div className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 border-[6px] border-transparent border-r-gray-800"></div>
          {tooltip}
        </div>,
        document.body
      )}
    </>
  );
}
