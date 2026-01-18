import { ReactNode } from 'react';

interface WorkerSummaryCardProps {
  title: string;
  value: string | number;
  variant?: 'default' | 'warning' | 'danger';
  icon?: ReactNode;
}

export default function WorkerSummaryCard({
  title,
  value,
  variant = 'default',
  icon,
}: WorkerSummaryCardProps) {
  const variantClasses = {
    default: 'text-dark-tandur',
    warning: 'text-warning',
    danger: 'text-danger',
  };

  const bgClasses = {
    default: 'bg-white-tandur ring-gray-100',
    warning: 'bg-white-tandur ring-warning/20',
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
    </div>
  );
}
