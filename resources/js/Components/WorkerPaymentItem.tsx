interface WorkerPaymentItemProps {
  workerName: string;
  type: 'payment' | 'kasbon'; // payment = bayar upah, kasbon = ngutang
  amount: string;
  date: string;
}

export default function WorkerPaymentItem({
  workerName,
  type,
  amount,
  date,
}: WorkerPaymentItemProps) {
  const isKasbon = type === 'kasbon';

  return (
    <div className="flex items-center justify-between border-b border-gray-50 py-3 last:border-0 hover:bg-gray-50/50 px-2 rounded-lg transition-colors">
      <div>
        <div className="font-bold text-dark-tandur">{workerName}</div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{date}</span>
          <span>•</span>
          <span
            className={`font-medium uppercase tracking-wider ${isKasbon ? 'text-warning' : 'text-danger'}`}
          >
            {isKasbon ? 'Kasbon' : 'Pembayaran'}
          </span>
        </div>
      </div>
      <div className={`font-bold ${isKasbon ? 'text-warning' : 'text-danger'}`}>
        {isKasbon ? '+' : '-'} {amount}
      </div>
    </div>
  );
}
