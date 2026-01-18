import { Link } from '@inertiajs/react';

interface StepItemProps {
  stepNumber: number;
  stepName: string;
  status: 'active' | 'done' | 'pending';
  startDate?: string;
  endDate?: string;
  href?: string;
}

export default function StepItem({
  stepNumber,
  stepName,
  status,
  startDate,
  endDate,
  href = '#',
}: StepItemProps) {
  // Styles based on status
  const containerClasses = {
    done: 'bg-white-tandur border-main ring-1 ring-main/20',
    active: 'bg-secondary/10 border-warning ring-1 ring-warning/50',
    pending: 'bg-white-tandur border-gray-100', // Removed generic opacity to handle it better in hover
  };

  const numberClasses = {
    done: 'bg-main text-white-tandur',
    active: 'bg-secondary text-dark-tandur',
    pending: 'bg-gray-100 text-gray-400',
  };

  return (
    <Link
      href={href}
      className={`
        group relative flex flex-col gap-4 rounded-xl border p-5 transition-all duration-200
        hover:border-main hover:bg-gray-50/50 hover:shadow-md
        active:scale-[0.99] active:ring-2 active:ring-main/20
        ${containerClasses[status]}
        ${status === 'pending' ? 'opacity-70 hover:opacity-100' : ''}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {/* Step Number / Icon */}
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold shadow-sm transition-colors ${numberClasses[status]}`}
          >
            {status === 'done' ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
              </svg>
            ) : (
              stepNumber
            )}
          </div>

          {/* Content */}
          <div>
            <h4 className={`text-lg font-bold transition-colors group-hover:text-main ${status === 'pending' ? 'text-gray-500' : 'text-dark-tandur'}`}>
              {stepName}
            </h4>
            <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
              {(startDate || endDate) ? (
                <>
                  <span>{startDate || '-'}</span>
                  <span>→</span>
                  <span>{endDate || 'Sekarang'}</span>
                </>
              ) : (
                <span>Belum dijadwalkan</span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Status or Affordance */}
        <div className="flex items-center gap-3">
          {status === 'active' && (
            <span className="rounded-full bg-warning px-3 py-1 text-xs font-bold text-white-tandur shadow-sm">
              AKTIF
            </span>
          )}

          {/* Chevron Affordance (Visible on hover or always visible but subtle) */}
          <div className="text-gray-300 transition-all duration-200 group-hover:translate-x-1 group-hover:text-main">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
