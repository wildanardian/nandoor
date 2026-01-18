import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import { Fragment, ReactNode } from 'react';

interface TandurDropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: 'start' | 'end'; // Headless UI uses start/end
  width?: string;
}

export default function TandurDropdown({ trigger, children, align = 'end', width = 'w-48' }: TandurDropdownProps) {
  return (
    <Menu>
      <MenuButton as={Fragment}>
        {trigger}
      </MenuButton>

      {/* Headless UI v2 'anchor' prop handles Portal and Positioning automatically! */}
      <MenuItems
        anchor={`bottom ${align}`}
        className={`z-[60] mt-2 origin-top-right divide-y divide-gray-100 rounded-md bg-white-tandur shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${width} transition duration-100 ease-out [--anchor-gap:4px] data-[closed]:scale-95 data-[closed]:opacity-0`}
      >
        <div className="px-1 py-1">
          {children}
        </div>
      </MenuItems>
    </Menu>
  );
}

// Add sub-components for cleaner usage
export function DropdownItem({ onClick, children, className = '' }: { onClick?: () => void, children: ReactNode, className?: string }) {
  return (
    <MenuItem>
      {({ focus }) => (
        <button
          className={`${focus ? 'bg-main/10 text-main' : 'text-gray-900'
            } group flex w-full items-center rounded-md px-2 py-2 text-sm ${className}`}
          onClick={onClick}
        >
          {children}
        </button>
      )}
    </MenuItem>
  );
}
