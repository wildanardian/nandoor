import Dropdown from '@/Components/Dropdown';
import { router } from '@inertiajs/react';

interface Farm {
  id: number;
  name: string;
  [key: string]: any;
}

interface FarmSelectorProps {
  farms: Farm[];
  activeFarm?: Farm;
  onFarmChange?: (farm: Farm) => void;
}

export default function FarmSelector({
  farms,
  activeFarm,
  onFarmChange,
}: FarmSelectorProps) {
  const handleFarmChange = (farm: Farm) => {
    if (onFarmChange) {
      onFarmChange(farm);
    } else {
      // Default behavior if no handler provided: visit the farm dashboard or just reload with new context
      // For now, we'll assume the parent handles the logic or we just emit the event
      console.warn('No onFarmChange handler provided for FarmSelector');
    }
  };

  const isDisabled = farms.length <= 1;

  return (
    <div className="relative">
      <Dropdown>
        <Dropdown.Trigger>
          <button
            type="button"
            className={`
                            flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white-tandur p-3 text-left shadow-sm transition-all
                            ${isDisabled ? 'cursor-default opacity-100' : 'cursor-pointer hover:border-main/50 hover:shadow-md'}
                        `}
            disabled={isDisabled}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-main text-white-tandur">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z"
                  />
                </svg>
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="truncate text-sm font-bold text-dark-tandur">
                  {activeFarm?.name || 'Pilih Sawah'}
                </span>
                <span className="truncate text-xs text-gray-500">
                  {farms.length > 1
                    ? 'Ganti Sawah'
                    : 'Sawah Aktif'}
                </span>
              </div>
            </div>

            {!isDisabled && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-4 w-4 text-gray-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m19.5 8.25-7.5 7.5-7.5-7.5"
                />
              </svg>
            )}
          </button>
        </Dropdown.Trigger>

        {!isDisabled && (
          <Dropdown.Content align="left" width="48" contentClasses="p-1 bg-white-tandur">
            <div className="max-h-64 overflow-y-auto">
              {farms.map((farm) => (
                <button
                  key={farm.id}
                  className={`
                                        flex w-full items-center justify-between rounded-md px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100
                                        ${activeFarm?.id === farm.id ? 'bg-secondary/20 font-medium text-main' : ''}
                                    `}
                  onClick={() => handleFarmChange(farm)}
                >
                  <span className="truncate">{farm.name}</span>
                  {activeFarm?.id === farm.id && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-4 w-4 text-main"
                    >
                      <path
                        fillRule="evenodd"
                        d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </Dropdown.Content>
        )}
      </Dropdown>
    </div>
  );
}
