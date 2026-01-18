import { ReactNode } from 'react';

interface FinanceSummaryCardProps {
  title: string;
  value: string;
  variant?: 'default' | 'success' | 'danger';
  subtitle?: string;
  icon?: ReactNode;
}

export default function FinanceSummaryCard({
  title,
  value,
  variant = 'default',
  subtitle,
  icon,
}: FinanceSummaryCardProps) {
  const variantClasses = {
    default: 'text-dark-tandur',
    success: 'text-main',
    danger: 'text-danger',
  };

  const bgClasses = {
    default: 'bg-white-tandur ring-gray-100',
    success: 'bg-white-tandur ring-main/20',
    danger: 'bg-white-tandur ring-danger/20',
  };

  return (
    <div
      className={`flex flex-col rounded-2xl p-5 shadow-sm ring-1 ${bgClasses[variant]}`}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <div className={`text-2xl font-bold ${variantClasses[variant]}`}>
        {value}
      </div>
      {subtitle && (
        <div className="mt-1 text-xs text-gray-400">{subtitle}</div>
      )}
    </div>
  );
}
