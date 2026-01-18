import { useEffect } from 'react';
import { CheckCircle, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export type AlertType = 'success' | 'warning' | 'info' | 'error';

interface TandurAlertProps {
  type: AlertType;
  title: string;
  description?: string;
  onClose?: () => void;
  className?: string;
}

export default function TandurAlert({
  type,
  title,
  description,
  onClose,
  className = '',
}: TandurAlertProps) {

  // Icon and Style config based on type
  const config = {
    success: {
      icon: CheckCircle,
      iconColor: 'text-green-tandur', // Assuming green-tandur is defined or close enough to 'text-green-600'
      // Using generic tailwind colors first if custom colors aren't guaranteed, 
      // but user said "Warna icon: hijau Tandur". I'll stick to a safe green that likely matches or use the main color.
      // Let's use Tailwind default safe colors mapping to the description.
      // Success: Hijau Tandur. Warning: Kuning/Orange. Info: Biru soft. Error: Merah soft.
      colorClass: 'text-green-600',
      bgColor: 'bg-white',
    },
    warning: {
      icon: AlertTriangle,
      colorClass: 'text-amber-500',
      bgColor: 'bg-white',
    },
    info: {
      icon: Info,
      colorClass: 'text-blue-500',
      bgColor: 'bg-white',
    },
    error: {
      icon: XCircle,
      colorClass: 'text-red-500',
      bgColor: 'bg-white',
    },
  };

  const { icon: Icon, colorClass, bgColor } = config[type];

  return (
    <div
      className={`
        pointer-events-auto w-full max-w-sm overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg ring-1 ring-black ring-opacity-5 transition-all
        flex items-start p-4 gap-3
        ${className}
      `}
      role="alert"
    >
      <div className={`flex-shrink-0 ${colorClass}`}>
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <div className="flex-1 pt-0.5">
        <p className="text-sm font-bold text-gray-900">{title}</p>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </div>
      <div className="flex flex-shrink-0 ml-4">
        <button
          type="button"
          className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2"
          onClick={onClose}
        >
          <span className="sr-only">Close</span>
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
