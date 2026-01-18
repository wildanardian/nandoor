interface StepExpenseItemProps {
  date: string;
  category: string;
  description: string;
  amount: string;
}

export default function StepExpenseItem({
  date,
  category,
  description,
  amount,
}: StepExpenseItemProps) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 py-3 last:border-0 hover:bg-gray-50/50 px-2 rounded-lg transition-colors">
      <div>
        <div className="flex items-center gap-2">
          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-gray-500">
            {category}
          </span>
          <span className="text-xs text-gray-400">{date}</span>
        </div>
        <div className="font-medium text-dark-tandur">{description}</div>
      </div>
      <div className="font-bold text-danger">
        - {amount}
      </div>
    </div>
  );
}
