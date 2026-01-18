interface StepWorkerItemProps {
  workerName: string;
  plotName: string;
  kasbonAmount: string;
  paymentStatus: 'paid' | 'unpaid' | 'partial';
  onKasbon?: () => void;
  onPay?: () => void;
  disabled?: boolean;
}

export default function StepWorkerItem({
  workerName,
  plotName,
  kasbonAmount,
  paymentStatus,
  onKasbon,
  onPay,
  disabled
}: StepWorkerItemProps) {
  const hasKasbon = kasbonAmount !== 'Rp 0' && kasbonAmount !== '0';

  return (
    <div className={`flex flex-col gap-3 rounded-xl border border-gray-100 bg-white-tandur p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between ${disabled ? 'opacity-70' : ''}`}>
      {/* Info */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-main/5 font-bold text-main">
          {workerName.charAt(0).toUpperCase()}
        </div>
        <div>
          <h4 className="font-bold text-dark-tandur">{workerName}</h4>
          <div className="text-xs text-gray-500">{plotName}</div>
        </div>
      </div>

      {/* Status & Actions */}
      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <div className="text-right">
          <div className="text-[10px] uppercase text-gray-400">Kasbon Step Ini</div>
          <div className={`text-sm font-bold ${hasKasbon ? 'text-warning' : 'text-gray-400'}`}>
            {kasbonAmount}
          </div>
        </div>

        <div className="flex gap-1">
          <button
            onClick={onKasbon}
            disabled={disabled}
            className={`rounded-lg bg-gray-50 p-2 text-warning hover:bg-warning/10 ${disabled ? 'cursor-not-allowed text-gray-400' : ''}`}
            title="Catat Kasbon"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-11.25a.75.75 0 0 0-1.5 0v2.5h-2.5a.75.75 0 0 0 0 1.5h2.5v2.5a.75.75 0 0 0 1.5 0v-2.5h2.5a.75.75 0 0 0 0-1.5h-2.5v-2.5Z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={onPay}
            disabled={disabled}
            className={`rounded-lg bg-gray-50 p-2 text-danger hover:bg-danger/10 ${disabled ? 'cursor-not-allowed text-gray-400' : ''}`}
            title="Bayar / Lunas"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
