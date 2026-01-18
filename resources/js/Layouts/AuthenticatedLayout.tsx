import Sidebar from '@/Components/Sidebar';
import { usePage, router } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useEffect, useState } from 'react';
import { useAlert } from '@/Contexts/AlertContext';

export default function Authenticated({
  header,
  children,
}: PropsWithChildren<{ header?: ReactNode }>) {
  const { flash, auth } = usePage<any>().props; // Destructure auth here
  const { url } = usePage(); // Get url from usePage
  const { showAlert } = useAlert();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (flash?.success) {
      showAlert({ type: 'success', title: 'Berhasil', description: flash.success });
    }
    if (flash?.error) {
      showAlert({ type: 'error', title: 'Gagal', description: flash.error });
    }
  }, [flash]);

  // Get data from Inertia props
  const farms = auth?.farms || [];
  const activeFarm = auth?.active_farm;

  const handleFarmChange = (farm: any) => {
    router.post(route('farms.switch'), { farm_id: farm.id });
    setIsSidebarOpen(false); // Close sidebar on mobile after selection
  };

  // Close sidebar on route change (optional but good UX)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [url]); // Re-close when navigating

  return (
    <div className="flex min-h-screen bg-white-tandur">
      {/* Sidebar - Desktop (Fixed) */}
      <div className="hidden w-72 shrink-0 lg:block">
        <div className="fixed inset-y-0 left-0 w-72">
          <Sidebar
            farms={farms}
            activeFarm={activeFarm}
            onFarmChange={handleFarmChange}
          />
        </div>
      </div>

      {/* Sidebar - Mobile Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          ></div>

          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 flex w-72 flex-col bg-white shadow-xl transition-transform">
            <Sidebar
              farms={farms}
              activeFarm={activeFarm}
              onFarmChange={handleFarmChange}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col bg-dark-tandur/10">
        {/* Mobile Header (Hamburger + Logo) */}
        <div className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-dark-tandur/10 bg-white-tandur px-4 lg:hidden">
          <div className="font-bold text-main">Tandur</div>
          <button
            className="rounded p-2 text-gray-500 hover:bg-gray-100 focus:outline-none"
            onClick={() => setIsSidebarOpen(true)}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Page Header */}
        {header && (
          <header className="bg-white-tandur px-6 py-4 border-b border-dark-tandur/10">
            {header}
          </header>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
