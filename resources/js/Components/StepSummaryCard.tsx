import { ReactNode } from 'react';

interface StepSummaryCardProps {
  label: string;
  value: string | number;
  variant?: 'info' | 'success' | 'warning' | 'neutral';
  icon?: ReactNode;
}

export default function StepSummaryCard({
  label,
  value,
  variant = 'neutral',
  icon,
}: StepSummaryCardProps) {
  const variantClasses = {
    info: 'bg-info-tandur/10 text-info-tandur',
    success: 'bg-main/10 text-main',
    warning: 'bg-warning/10 text-warning',
    neutral: 'bg-gray-100 text-gray-500',
  };

  return (
    <div className="flex flex-col rounded-xl bg-white-tandur p-4 shadow-sm ring-1 ring-gray-100">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</span>
        {icon && (
          <div className={`flex h-6 w-6 items-center justify-center rounded-full ${variantClasses[variant]}`}>
            <div className="h-4 w-4">{icon}</div>
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-dark-tandur">{value}</div>
    </div>
  );
}
