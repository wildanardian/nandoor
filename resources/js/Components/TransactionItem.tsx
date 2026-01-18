import { ReactNode } from 'react';

interface TransactionItemProps {
  date: string;
  type: 'expense' | 'income';
  description: string;
  stepName?: string;
  amount: string;
  onClick?: () => void;
}

export default function TransactionItem({
  date,
  type,
  description,
  stepName,
  amount,
  onClick,
}: TransactionItemProps) {
  const isExpense = type === 'expense';

  return (
    <div
      onClick={onClick}
      className="flex cursor-pointer items-center justify-between border-b border-gray-50 py-4 last:border-0 hover:bg-gray-50/50 transition-colors px-2 rounded-lg"
    >
      <div className="flex items-center gap-4">
        {/* Date Box */}
        <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-gray-100 text-xs font-bold text-gray-500 border border-gray-200">
          <span className="text-lg leading-none">{date.split(' ')[0]}</span>
          <span className="text-[10px] uppercase">{date.split(' ')[1]}</span>
        </div>

        {/* Info */}
        <div>
          <div className="font-bold text-dark-tandur">{description}</div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span
              className={`
                                inline-block rounded-full px-1.5 py-0.5 font-bold uppercase tracking-wider text-[10px]
                                ${isExpense ? 'bg-danger/10 text-danger' : 'bg-main/10 text-main'}
                            `}
            >
              {isExpense ? 'Keluar' : 'Masuk'}
            </span>
            {stepName && (
              <>
                <span>•</span>
                <span>{stepName}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Amount */}
      <div className={`text-right font-bold ${isExpense ? 'text-danger' : 'text-main'}`}>
        {isExpense ? '-' : '+'} {amount}
      </div>
    </div>
  );
}
