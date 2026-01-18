interface StepInfoCardProps {
  step: {
    name: string;
    order: number;
    status: 'pending' | 'active' | 'done';
    startDate?: string;
    endDate?: string;
    notes?: string;
  };
  onStatusChange?: (newStatus: 'active' | 'done') => void;
  isLocked?: boolean;
}

export default function StepInfoCard({ step, onStatusChange }: StepInfoCardProps) {
  const statusConfig = {
    pending: { label: 'Belum Dimulai', class: 'bg-dark-tandur/10 text-dark-tandur', button: 'Mulai Step' },
    active: { label: 'Sedang Berjalan', class: 'bg-warning/10 text-warning', button: 'Selesaikan Step' },
    done: { label: 'Selesai', class: 'bg-main/10 text-main', button: null },
  };

  const currentConfig = statusConfig[step.status];

  return (
    <div className="flex flex-col gap-6 rounded-2xl bg-white-tandur p-6 shadow-sm ring-1 ring-gray-100">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500">
              {step.order}
            </span>
            <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${currentConfig.class}`}>
              {currentConfig.label}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-dark-tandur">{step.name}</h3>
        </div>

        {/* Action Button */}
        {step.status !== 'done' && (
          <button
            onClick={() => onStatusChange?.(step.status === 'pending' ? 'active' : 'done')}
            className={`rounded-lg px-4 py-2 text-sm font-bold text-white-tandur shadow-sm transition-all ${step.status === 'pending' ? 'bg-main hover:bg-main/90' : 'bg-dark-tandur hover:bg-dark-tandur/90'}`}
          >
            {currentConfig.button}
          </button>
        )}
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 gap-4 border-t border-gray-100 py-4 sm:grid-cols-2">
        <div>
          <div className="text-xs text-gray-500">Tanggal Mulai</div>
          <div className="font-bold text-dark-tandur">{step.startDate || '-'}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Tanggal Selesai</div>
          <div className="font-bold text-dark-tandur">{step.endDate || '-'}</div>
        </div>
        <div className="sm:col-span-2">
          <div className="text-xs text-gray-500">Catatan</div>
          <div className="text-sm text-gray-700">{step.notes || 'Tidak ada catatan.'}</div>
        </div>
      </div>
    </div>
  );
}
