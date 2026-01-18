interface ActivePeriodCardProps {
  name: string;
  startDate: string;
  openingBalance: string;
  totalExpense: string;
  totalIncome: string;
  currentBalance: string;
  status: 'active';
  cropType?: string; // Add cropType
  hasPendingSteps?: boolean; // New Prop
  onClose?: () => void;
  onEdit?: () => void;
}

export default function ActivePeriodCard({
  name,
  startDate,
  openingBalance,
  totalExpense,
  totalIncome,
  currentBalance,
  status,
  cropType,
  hasPendingSteps = false,
  onClose,
  onEdit,
}: ActivePeriodCardProps) {
  // Determine color for current balance (profit/loss)
  // For now assuming strings are formatted like "Rp 1.000.000" or "- Rp 500.000"
  const isLoss = currentBalance.includes('-');

  return (
    <div className="flex flex-col gap-6 rounded-2xl bg-white-tandur p-6 shadow-sm ring-1 ring-main/20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="mb-2 inline-block rounded-full bg-main/10 px-3 py-1 text-xs font-bold text-main uppercase tracking-wider">
            {status === 'active' ? 'Periode Aktif' : status}
          </span>
          <h3 className="text-2xl font-bold text-dark-tandur">{name}</h3>
          <div className="flex flex-col gap-1 text-sm text-gray-500">
            <span>Dimulai sejak {startDate}</span>
            {cropType && <span className="font-bold text-main">Jenis Tanaman: {cropType}</span>}
          </div>
        </div>
        {/* Actions (Desktop) */}
        <div className="hidden gap-2 sm:flex">
          <button
            onClick={onEdit}
            className="rounded-lg bg-gray-50 px-4 py-2 text-sm font-bold text-dark-tandur hover:bg-gray-100"
          >
            Edit Info
          </button>
          <div className="relative group">
            <button
              onClick={onClose}
              disabled={hasPendingSteps}
              className={`rounded-lg px-4 py-2 text-sm font-bold text-white-tandur transition-colors ${hasPendingSteps
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-dark-tandur hover:bg-dark-tandur/90'
                }`}
            >
              Tutup Periode
            </button>
            {hasPendingSteps && (
              <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg invisible group-hover:visible z-10">
                Selesaikan semua tahapan pertanian sebelum menutup periode.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 border-t border-gray-100 py-4 lg:grid-cols-4">
        <div>
          <div className="text-xs text-gray-500">Saldo Awal</div>
          <div className="font-bold text-dark-tandur">{openingBalance}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Total Pengeluaran</div>
          <div className="font-bold text-danger">{totalExpense}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Total Pemasukan</div>
          <div className="font-bold text-main">{totalIncome}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Saldo Akhir Sementara</div>
          <div className={`text-xl font-bold ${isLoss ? 'text-danger' : 'text-main'}`}>
            {currentBalance}
          </div>
        </div>
      </div>

      {/* Actions (Mobile) */}
      <div className="grid grid-cols-2 gap-3 sm:hidden">
        <button
          onClick={onEdit}
          className="rounded-lg bg-gray-50 px-4 py-3 text-sm font-bold text-dark-tandur hover:bg-gray-100"
        >
          Edit Info
        </button>
        <button
          onClick={onClose}
          className="rounded-lg bg-dark-tandur px-4 py-3 text-sm font-bold text-white-tandur hover:bg-dark-tandur/90"
        >
          Tutup Periode
        </button>
      </div>
    </div>
  );
}
