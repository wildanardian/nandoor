import { PropsWithChildren } from 'react';

export default function SectionCard({
  title,
  action,
  children,
  className = '',
}: PropsWithChildren<{ title?: string; action?: React.ReactNode; className?: string }>) {
  return (
    <div
      className={`overflow-hidden rounded-2xl bg-white-tandur p-6 shadow-sm ring-1 ring-gray-100 ${className}`}
    >
      {title && (
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-dark-tandur">{title}</h3>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
