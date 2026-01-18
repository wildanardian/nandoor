import { ReactNode } from 'react';

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  variant?: 'info' | 'success' | 'warning' | 'danger';
  icon?: ReactNode;
}

export default function SummaryCard({
  title,
  value,
  subtitle,
  variant = 'info',
  icon,
}: SummaryCardProps) {
  const variantClasses = {
    info: 'bg-info-tandur/10 text-info-tandur',
    success: 'bg-main/10 text-main',
    warning: 'bg-warning/10 text-warning',
    danger: 'bg-danger/10 text-danger',
  };

  return (
    <div className="flex flex-col rounded-2xl bg-white-tandur p-6 shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <span className="text-md font-medium text-gray-500">{title}</span>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full ${variantClasses[variant]}`}
        >
          {icon || (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          )}
        </div>
      </div>
      <div>
        <div className="text-3xl font-bold text-dark-tandur">{value}</div>
        {subtitle && (
          <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
