interface StepProgressItemProps {
  stepName: string;
  status: 'active' | 'done' | 'pending';
  index: number;
}

export default function StepProgressItem({
  stepName,
  status,
  index,
}: StepProgressItemProps) {
  const statusClasses = {
    active: 'border-secondary bg-secondary/10 shadow-sm ring-1 ring-secondary',
    done: 'border-main bg-main/5 opacity-70',
    pending: 'border-gray-100 bg-gray-50 opacity-50',
  };

  const textClasses = {
    active: 'text-dark-tandur font-bold',
    done: 'text-main font-medium line-through decoration-main/50',
    pending: 'text-gray-400 font-medium',
  };

  return (
    <div
      className={`flex items-center gap-4 rounded-xl border p-4 transition-all ${statusClasses[status]}`}
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${status === 'done'
            ? 'bg-main text-white-tandur'
            : status === 'active'
              ? 'bg-secondary text-dark-tandur'
              : 'bg-gray-200 text-gray-500'
          }`}
      >
        {status === 'done' ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
          </svg>
        ) : (
          index + 1
        )}
      </div>
      <div className={`flex-1 ${textClasses[status]}`}>{stepName}</div>
      {status === 'active' && (
        <div className="flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase text-dark-tandur">
          Active
        </div>
      )}
    </div>
  );
}
