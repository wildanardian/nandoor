import { ButtonHTMLAttributes } from 'react';

export default function SecondaryButton({
  type = 'button',
  className = '',
  disabled,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      type={type}
      className={
        `inline-flex items-center justify-center rounded-full border border-gray-300 bg-white-tandur px-6 py-3 text-sm font-bold capitalize tracking-wide text-gray-700 shadow-sm transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 ${disabled && 'opacity-25'
        } ` + className
      }
      disabled={disabled}
    >
      {children}
    </button>
  );
}
