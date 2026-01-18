import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import TandurAlert, { AlertType } from '@/Components/TandurAlert';

interface Alert {
  id: string;
  type: AlertType;
  title: string;
  description?: string;
  duration?: number;
}

interface AlertContextType {
  showAlert: (props: Omit<Alert, 'id'>) => void;
  removeAlert: (id: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  const showAlert = useCallback(({ type, title, description, duration = 3000 }: Omit<Alert, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newAlert = { id, type, title, description, duration };

    setAlerts((prev) => [...prev, newAlert]);

    if (duration > 0) {
      setTimeout(() => {
        removeAlert(id);
      }, duration);
    }
  }, [removeAlert]);

  return (
    <AlertContext.Provider value={{ showAlert, removeAlert }}>
      {children}

      {/* Alert Container */}
      <div
        aria-live="assertive"
        className="pointer-events-none fixed inset-0 flex flex-col items-end px-4 py-6 sm:items-end sm:p-6 z-[9999] gap-4"
      >
        <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
          {alerts.map((alert) => (
            <TandurAlert
              key={alert.id}
              type={alert.type}
              title={alert.title}
              description={alert.description}
              onClose={() => removeAlert(alert.id)}
              className="animate-slide-in-right-fade"
            />
          ))}
        </div>
      </div>
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}
