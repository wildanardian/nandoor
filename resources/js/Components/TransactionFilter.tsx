interface TransactionFilterProps {
  selectedType: 'all' | 'expense' | 'income';
  onTypeChange: (type: 'all' | 'expense' | 'income') => void;
}

export default function TransactionFilter({
  selectedType,
  onTypeChange,
}: TransactionFilterProps) {
  const types = [
    { id: 'all', label: 'Semua' },
    { id: 'expense', label: 'Pengeluaran' },
    { id: 'income', label: 'Pemasukan' },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {types.map((type) => (
        <button
          key={type.id}
          onClick={() => onTypeChange(type.id as any)}
          className={`
                        whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-all
                        ${selectedType === type.id
              ? 'bg-dark-tandur text-white-tandur shadow-md'
              : 'bg-white-tandur text-gray-500 hover:bg-gray-50 ring-1 ring-gray-200'
            }
                    `}
        >
          {type.label}
        </button>
      ))}

      {/* Placeholder for Step Filter (Dropdown style could go here) */}
      <button className="flex items-center gap-1 whitespace-nowrap rounded-full bg-white-tandur px-4 py-1.5 text-sm font-medium text-gray-500 ring-1 ring-gray-200 hover:bg-gray-50">
        <span>Semua Tahapan</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-400">
          <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}
