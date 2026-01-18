import { Rocket, Flag, CheckCircle, Sprout, FlaskConical, HardHat, Banknote, Info, UserPlus } from 'lucide-react';
import React from 'react';

// Define the shape of an activity log
// Based on Detail.tsx usage: { id: string, date: string, type: string, description: string }
export interface ActivityItem {
  id: string | number;
  date: string; // Formatted date string, e.g., "15 Januari 2026"
  time?: string; // Optional time if available in the future
  type: 'start' | 'finish' | 'expense' | 'worker' | 'info' | string;
  description: string;
}

interface ActivityTimelineProps {
  activities: ActivityItem[];
}

export default function ActivityTimeline({ activities }: ActivityTimelineProps) {
  // Helper to get icon based on type
  const getIcon = (type: string) => {
    switch (type) {
      case 'start':
        return <Rocket className="w-4 h-4 text-white-tandur" />;
      case 'finish':
        return <CheckCircle className="w-4 h-4 text-white-tandur" />;
      case 'expense':
        // Check description for sub-types if possible, otherwise generic expense
        return <Sprout className="w-4 h-4 text-white-tandur" />; // Using Sprout as generic for now, or match specific expense types if data allows
      case 'worker':
        return <HardHat className="w-4 h-4 text-white-tandur" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-white-tandur" />;
    }
  };

  // Helper for background color of icon circle
  const getIconBgColor = (type: string) => {
    switch (type) {
      case 'start':
      case 'finish':
        return 'bg-main'; // Tandur Green
      case 'expense':
        return 'bg-yellow-500'; // Warning/Attention
      case 'worker':
        return 'bg-blue-500'; // Info/Action
      default:
        return 'bg-gray-400'; // Neutral
    }
  };

  if (activities.length === 0) {
    return (
      <div className="py-8 text-center text-gray-400 italic text-sm">
        Belum ada aktivitas tercatat.
      </div>
    );
  }

  return (
    <div className="relative flex flex-col gap-0">
      {/* Loop through activities */}
      {activities.map((activity, index) => {
        const isLast = index === activities.length - 1;

        return (
          <div key={activity.id} className="relative flex gap-4 pb-8 last:pb-0">
            {/* Timeline Line (Vertical) */}
            {!isLast && (
              <div
                className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-gray-200"
                aria-hidden="true"
              />
            )}

            {/* Icon Bubble */}
            <div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${getIconBgColor(activity.type)} shadow-sm`}>
              {getIcon(activity.type)}
            </div>

            {/* Content */}
            <div className="flex flex-col pt-1">
              <p className="text-sm font-medium text-gray-900 leading-tight">
                {activity.description}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {activity.date} {activity.time && `· ${activity.time}`}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
