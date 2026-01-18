interface InventoryMovementItemProps {
  date: string;
  type: 'purchase' | 'usage' | 'adjustment';
  itemName: string;
  quantity: number;
  unit: string;
  stepName?: string;
}

export default function InventoryMovementItem({
  date,
  type,
  itemName,
  quantity,
  unit,
  stepName,
}: InventoryMovementItemProps) {
  const isUsage = type === 'usage';
  const isPurchase = type === 'purchase';

  // Usage is negative (danger), Purchase/Adjustment is positive (main/info)
  const colorClass = isUsage ? 'text-danger' : 'text-main';
  const sign = isUsage ? '-' : '+';

  const typeLabel = {
    purchase: 'Pembelian',
    usage: 'Pemakaian',
    adjustment: 'Penyesuaian',
  };

  return (
    <div className="flex items-center justify-between border-b border-gray-50 py-3 last:border-0 hover:bg-gray-50/50 px-2 rounded-lg transition-colors">
      <div>
        <div className="font-bold text-dark-tandur">{itemName}</div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
          <span>{date}</span>
          <span>•</span>
          <span className="font-medium">{typeLabel[type]}</span>
          {stepName && (
            <>
              <span>•</span>
              <span className="text-[10px] rounded bg-gray-100 px-1">{stepName}</span>
            </>
          )}
        </div>
      </div>
      <div className={`font-bold whitespace-nowrap ${colorClass}`}>
        {sign} {quantity} {unit}
      </div>
    </div>
  );
}
