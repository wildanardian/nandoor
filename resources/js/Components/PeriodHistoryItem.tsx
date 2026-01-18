interface PeriodHistoryItemProps {
  name: string;
  startDate: string;
  endDate: string;
  totalExpense: string;
  totalIncome: string;
  closingBalance: string;
}

export default function PeriodHistoryItem({
  name,
  startDate,
  endDate,
  totalExpense,
  totalIncome,
  closingBalance,
}: PeriodHistoryItemProps) {
  const isLoss = closingBalance.includes('-');

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white-tandur p-4 transition-all hover:bg-gray-50/50 sm:flex-row sm:items-center sm:justify-between">
      {/* Info */}
      <div>
        <h4 className="font-bold text-gray-600">{name}</h4>
        <div className="text-xs text-gray-400">
          {startDate} — {endDate}
        </div>
        <div className="mt-2 text-xs font-bold text-gray-300 uppercase tracking-wide">
          Selesai
        </div>
      </div>

      {/* Metrics */}
      <div className="flex flex-col gap-1 text-right sm:items-end">
        <div className="text-sm font-bold text-gray-500">
          Saldo Akhir: <span className={isLoss ? 'text-danger' : 'text-main'}>{closingBalance}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span>In: <span className="text-main">{totalIncome}</span></span>
          <span>Out: <span className="text-danger">{totalExpense}</span></span>
        </div>
      </div>
    </div>
  );
}
