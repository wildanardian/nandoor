interface WorkerItemProps {
  name: string;
  phone?: string;
  status: 'active' | 'inactive';
  kasbon: string; // Formatted currency string
  onAction?: (action: 'detail' | 'kasbon' | 'pay') => void;
}

export default function WorkerItem({
  name,
  phone,
  status,
  kasbon,
  onAction,
}: WorkerItemProps) {
  const hasKasbon = kasbon !== 'Rp 0' && kasbon !== '0';

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white-tandur p-4 shadow-sm transition-all hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
      {/* Worker Info */}
      <div className="flex items-center gap-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-white-tandur ${status === 'active' ? 'bg-main' : 'bg-gray-300'
            }`}
        >
          {name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h4 className={`font-bold ${status === 'active' ? 'text-dark-tandur' : 'text-gray-400'}`}>
            {name}
            {status === 'inactive' && <span className="ml-2 text-xs font-normal text-gray-400">(Non-aktif)</span>}
          </h4>
          {phone && <div className="text-xs text-gray-500">{phone}</div>}
        </div>
      </div>

      {/* Stats & Actions */}
      <div className="flex items-center justify-between gap-4 sm:justify-end">
        {/* Kasbon Info */}
        <div className="text-right">
          <div className="text-xs text-gray-400">Kasbon Aktif</div>
          <div className={`font-bold ${hasKasbon ? 'text-warning' : 'text-dark-tandur'}`}>
            {kasbon}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onAction?.('kasbon')}
            className="rounded-lg bg-gray-50 p-2 text-warning hover:bg-warning/10"
            title="Catat Kasbon"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-11.25a.75.75 0 0 0-1.5 0v2.5h-2.5a.75.75 0 0 0 0 1.5h2.5v2.5a.75.75 0 0 0 1.5 0v-2.5h2.5a.75.75 0 0 0 0-1.5h-2.5v-2.5Z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={() => onAction?.('pay')}
            className="rounded-lg bg-gray-50 p-2 text-danger hover:bg-danger/10"
            title="Bayar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
