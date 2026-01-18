import { useEffect, useRef } from 'react';
import { Check } from 'lucide-react';

interface Step {
  id: number;
  name: string;
  status: 'done' | 'active' | 'pending';
}

interface Props {
  steps: Step[];
}

export default function HorizontalStepper({ steps }: Props) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to active step
    if (scrollContainerRef.current) {
      const activeStepIndex = steps.findIndex((step) => step.status === 'active');
      if (activeStepIndex !== -1) {
        const activeElement = scrollContainerRef.current.children[activeStepIndex] as HTMLElement;
        if (activeElement) {
          const containerWidth = scrollContainerRef.current.offsetWidth;
          const elementWidth = activeElement.offsetWidth;
          const scrollLeft = activeElement.offsetLeft - containerWidth / 2 + elementWidth / 2;

          scrollContainerRef.current.scrollTo({
            left: scrollLeft,
            behavior: 'smooth',
          });
        }
      }
    }
  }, [steps]);

  return (
    <div
      ref={scrollContainerRef}
      className="flex w-full overflow-x-auto pb-4 pt-2 px-2 gap-4 snap-x snap-mandatory scrollbar-hide"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {steps.length > 0 ? (
        steps.map((step, index) => {
          const isDone = step.status === 'done';
          const isActive = step.status === 'active';

          return (
            <div
              key={step.id}
              className={`flex-none flex flex-col items-center gap-2 w-24 snap-center group ${isActive ? 'opacity-100' : isDone ? 'opacity-100' : 'opacity-50'
                }`}
            >
              <div
                className={`
                  relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300
                  ${isDone
                    ? 'bg-green-100 border-main text-main shadow-sm'
                    : isActive
                      ? 'bg-yellow-100 border-yellow-500 text-yellow-700 shadow-md ring-2 ring-yellow-200 ring-offset-1'
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                  }
                `}
              >
                <span className={`text-sm font-bold ${isActive ? 'scale-110' : ''}`}>
                  {index + 1}
                </span>

                {/* Badge for Done */}
                {isDone && (
                  <span className="absolute -bottom-1 -right-1 flex items-center justify-center h-4 w-4 rounded-full bg-main text-white shadow-sm">
                    <Check className="w-2.5 h-2.5" strokeWidth={4} />
                  </span>
                )}

                {/* Badge for Active */}
                {isActive && (
                  <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`
                  text-xs text-center leading-tight transition-colors duration-300 px-1
                  ${isDone
                    ? 'font-bold text-main'
                    : isActive
                      ? 'font-bold text-dark-tandur scale-105'
                      : 'font-medium text-gray-500'
                  }
                `}
              >
                {step.name}
              </span>
            </div>
          );
        })
      ) : (
        <div className="w-full text-center py-4 text-gray-400 text-sm">
          Belum ada tahapan.
        </div>
      )}
    </div>
  );
}
