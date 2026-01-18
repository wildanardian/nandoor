interface InventoryItemRowProps {
  name: string;
  category: string;
  unit: string;
  stock: number;
  status: 'safe' | 'low' | 'empty';
  onAction?: (action: 'detail' | 'buy' | 'use') => void;
}

export default function InventoryItemRow({
  name,
  category,
  unit,
  stock,
  status,
  onAction,
}: InventoryItemRowProps) {
  const statusClasses = {
    safe: 'bg-main/10 text-main',
    low: 'bg-warning/10 text-warning',
    empty: 'bg-danger/10 text-danger',
  };

  const statusLabels = {
    safe: 'Aman',
    low: 'Hampir Habis',
    empty: 'Habis',
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white-tandur p-4 shadow-sm transition-all hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
      {/* Item Info */}
      <div>
        <div className="flex items-center gap-2">
          <h4 className="font-bold text-dark-tandur">{name}</h4>
          <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase text-gray-500">
            {category}
          </span>
        </div>
        <div className="mt-1 text-xs text-gray-500">
          Stok saat ini: <span className="font-bold text-dark-tandur">{stock} {unit}</span>
        </div>
      </div>

      {/* Status & Actions */}
      <div className="flex items-center justify-between gap-4 sm:justify-end">
        {/* Status Badge */}
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${statusClasses[status]}`}
        >
          {statusLabels[status]}
        </span>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onAction?.('use')}
            className="rounded-lg bg-gray-50 p-2 text-danger hover:bg-danger/10"
            title="Gunakan Stok"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM6.75 9.25a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={() => onAction?.('buy')}
            className="rounded-lg bg-gray-50 p-2 text-main hover:bg-main/10"
            title="Beli / Tambah Stok"
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
