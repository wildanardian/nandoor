interface ActivityItem {
  id: string | number;
  date: string;
  type: 'start' | 'expense' | 'worker' | 'done';
  description: string;
}

interface StepActivityTimelineProps {
  activities: ActivityItem[];
}

export default function StepActivityTimeline({ activities }: StepActivityTimelineProps) {
  const iconConfig = {
    start: { icon: '🚀', bg: 'bg-info-tandur/10', text: 'text-info-tandur' },
    expense: { icon: '💸', bg: 'bg-danger/10', text: 'text-danger' },
    worker: { icon: '👷', bg: 'bg-warning/10', text: 'text-warning' },
    done: { icon: '✅', bg: 'bg-main/10', text: 'text-main' },
  };

  return (
    <div className="flex flex-col gap-4">
      {activities.map((activity, index) => {
        const config = iconConfig[activity.type] || iconConfig.start;
        const isLast = index === activities.length - 1;

        return (
          <div key={activity.id} className="relative flex gap-4">
            {/* Line */}
            {!isLast && (
              <div className="absolute left-[11px] top-8 h-full w-[2px] bg-gray-100"></div>
            )}

            {/* Icon */}
            <div className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${config.bg} text-[10px]`}>
              {config.icon}
            </div>

            {/* Content */}
            <div className="pb-2">
              <div className="text-xs text-gray-400">{activity.date}</div>
              <div className="text-sm font-medium text-dark-tandur">{activity.description}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
