import { ButtonHTMLAttributes } from 'react';

export default function PrimaryButton({
  className = '',
  disabled,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={
        `inline-flex items-center justify-center rounded-full border border-transparent bg-main px-6 py-3 text-sm font-bold capitalize tracking-wide text-white-tandur transition duration-150 ease-in-out hover:bg-main/90 focus:bg-main/90 focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2 active:bg-main/100 ${disabled && 'opacity-25'
        } ` + className
      }
      disabled={disabled}
    >
      {children}
    </button>
  );
}
