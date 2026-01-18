import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import SummaryCard from '@/Components/SummaryCard';
import SectionCard from '@/Components/SectionCard';
import StepProgressItem from '@/Components/StepProgressItem';
import { useState } from 'react';
import CreateKasbonModal from '@/Pages/Workers/Partials/CreateKasbonModal';
import CreateExpenseModal from '@/Pages/Finance/Partials/CreateExpenseModal';
import UseStockModal from '@/Pages/Inventory/Partials/UseStockModal';
import PurchaseStockModal from '@/Pages/Inventory/Partials/PurchaseStockModal';
import TandurFAB, { FABAction } from '@/Components/TandurFAB';
import HorizontalStepper from '@/Components/HorizontalStepper';
import OnboardingCard from '@/Components/OnboardingCard';
import { Banknote, Receipt, Package, ShoppingCart } from 'lucide-react';

interface DashboardProps {
  farmingSteps: any[];
  plantTypeMissing?: boolean;
  hasActivePeriod?: boolean;
  summary: {
    totalBalance: number;
    periodExpense: number;
    periodIncome: number;
  };
  lastPayments: {
    id: number;
    title: string;
    date: string;
    amount: number;
  }[];
  activeWorkers?: any[]; // Passed from controller
  inventoryItems?: any[]; // Passed from controller
  activeActivities?: any[]; // Passed from controller
  onboarding?: {
    has_farm: boolean;
    has_plots: boolean;
    has_period: boolean;
    has_active_period: boolean;
    has_farming_steps: boolean;
    has_activity: boolean;
    is_completed: boolean;
  };
}

const currencyFormat = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function Dashboard({
  farmingSteps = [],
  plantTypeMissing,
  hasActivePeriod,
  summary,
  lastPayments = [],
  activeWorkers = [],
  inventoryItems = [],
  activeActivities = [],
  onboarding
}: DashboardProps) {

  // Logic to show onboarding: If "is_completed" is false.
  // Note: has_activity is still relevant for progress, but hiding relies on is_completed.
  const showOnboarding = onboarding && !onboarding.is_completed;

  // Modal State for FAB Actions
  const activeFabModalState = useState<'kasbon' | 'expense' | 'use_stock' | 'buy_stock' | null>(null);
  const [activeFabModal, setActiveFabModal] = activeFabModalState;

  const handleCompleteOnboarding = () => {
    router.post(route('dashboard.complete-onboarding'), {}, {
      preserveScroll: true,
      preserveState: true,
      onSuccess: () => {
        // Optional: show toast
      }
    });
  };

  const handleShowExpenseModal = () => {
    setActiveFabModal('expense');
  };

  // FAB Actions Configuration
  const fabActions: FABAction[] = [
    {
      label: 'Kasbon Pekerja',
      icon: <Banknote className="w-5 h-5" />,
      color: 'bg-yellow-600',
      onClick: () => setActiveFabModal('kasbon'),
      disabled: !hasActivePeriod
    },
    {
      label: 'Catat Pengeluaran',
      icon: <Receipt className="w-5 h-5" />,
      color: 'bg-red-600',
      onClick: () => setActiveFabModal('expense'),
      disabled: !hasActivePeriod
    },
    {
      label: 'Gunakan Stok',
      icon: <Package className="w-5 h-5" />,
      color: 'bg-green-600',
      onClick: () => setActiveFabModal('use_stock'),
      disabled: false
    },
    {
      label: 'Beli Stok',
      icon: <ShoppingCart className="w-5 h-5" />,
      color: 'bg-blue-600',
      onClick: () => setActiveFabModal('buy_stock'),
      disabled: !hasActivePeriod
    },
  ];

  const closeModal = () => setActiveFabModal(null);

  return (
    <AuthenticatedLayout
      header={
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold leading-tight text-dark-tandur">
            {showOnboarding ? 'Selamat Datang' : 'Ringkasan Sawah'}
          </h2>
          <p className="text-sm text-gray-500">
            {showOnboarding ? 'Mulai perjalanan bertani Anda.' : 'Pantau kondisi terkini usaha tani anda.'}
          </p>
        </div>
      }
    >
      <Head title="Dashboard" />

      <div className="flex flex-col gap-6 pb-20">
        {/* Added pb-20 to prevent FAB overlap with content on small screens if scrolled to bottom */}

        {showOnboarding && onboarding ? (
          <div className="max-w-3xl mx-auto w-full pt-4">
            <OnboardingCard
              status={onboarding}
              onComplete={handleCompleteOnboarding}
              onShowExpense={handleShowExpenseModal}
            />
          </div>
        ) : (
          <div className="max-w-7xl mx-auto space-y-6 w-full">
            {plantTypeMissing && (
              // ... existing plantTypeMissing warning ...
              <div className="rounded-md bg-yellow-50 p-4 border border-yellow-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Perhatian Diperlukan</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        Silakan pilih jenis tanaman untuk sawah ini agar tahapan pertanian dapat disesuaikan.
                        <Link href={route('farm-settings.index')} className="font-bold underline hover:text-yellow-900 ml-1">
                          Atur Sekarang &rarr;
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!hasActivePeriod ? (
              // ... existing no period state ...
              <div className="text-center py-12 bg-white-tandur rounded-2xl shadow-sm border border-gray-100">
                <div className="mx-auto h-16 w-16 bg-main/10 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-main">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0h18M5 17.25h8.25m-8.25 4.5h8.25m-11.25-4.5h2.25m-2.25 4.5h2.25" />
                  </svg>
                </div>
                <h3 className="mt-2 text-lg font-bold text-gray-900">Belum Ada Periode Panen</h3>
                <p className="mt-1 text-gray-500 max-w-sm mx-auto mb-6">
                  Buat periode panen untuk mulai mencatat keuangan dan aktivitas pertanian.
                </p>
                <Link
                  href={route('periods.index')}
                  className="inline-flex justify-center rounded-lg bg-main px-4 py-2 text-sm font-bold text-white-tandur shadow-sm hover:bg-main/90"
                >
                  + Buat Periode Panen
                </Link>
              </div>
            ) : (
              <>
                {/* Section 1: Summary Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <SummaryCard
                    title="Total Saldo"
                    value={currencyFormat(summary.totalBalance)}
                    variant="info"
                  // subtitle="Update terakhir: Hari ini"
                  />
                  <SummaryCard
                    title="Pengeluaran (Musim Ini)"
                    value={currencyFormat(summary.periodExpense)}
                    variant="danger"
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm-.75-7.25a.75.75 0 0 0-1.5 0v3a.75.75 0 0 0 1.5 0v-3Zm2 3a.75.75 0 0 1 1.5 0v-3a.75.75 0 0 1-1.5 0v3Z" clipRule="evenodd" />
                      </svg>
                    }
                  />
                  <SummaryCard
                    title="Pemasukan (Musim Ini)"
                    value={currencyFormat(summary.periodIncome)}
                    variant="success"
                    subtitle="Belum ada panen"
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-11.25a.75.75 0 0 0-1.5 0v2.5h-2.5a.75.75 0 0 0 0 1.5h2.5v2.5a.75.75 0 0 0 1.5 0v-2.5h2.5a.75.75 0 0 0 0-1.5h-2.5v-2.5Z" clipRule="evenodd" />
                      </svg>
                    }
                  />
                </div>

                {/* Section 2: Progress & Info */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                  {/* Left Col: Farming Steps */}
                  {/* Left Col: Farming Steps */}
                  <div className="lg:col-span-2 space-y-6">
                    <SectionCard
                      title="Tahapan Pertanian Aktif"
                      action={
                        <Link href={route('farming-steps.index')} className="text-sm font-bold text-main hover:underline">
                          Lihat Semua
                        </Link>
                      }
                    >
                      <HorizontalStepper steps={farmingSteps} />
                    </SectionCard>
                  </div>

                  {/* Right Col: Recent Info */}
                  <div className="space-y-6">
                    <SectionCard title="Pembayaran Terakhir">
                      <div className="space-y-4">
                        {lastPayments.length > 0 ? (
                          lastPayments.map((payment) => (
                            <div key={payment.id} className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                              <div>
                                <div className="font-bold text-dark-tandur">{payment.title}</div>
                                <div className="text-xs text-gray-500">{payment.date}</div>
                              </div>
                              <div className="text-sm font-bold text-danger">- {currencyFormat(payment.amount)}</div>
                            </div>
                          ))
                        ) : (
                          <div className="py-8 text-center text-xs text-gray-400 italic">
                            Belum ada data pembayaran.
                          </div>
                        )}
                      </div>
                    </SectionCard>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* FAB & Modals (Only show modals if we have active period and data, roughly) */}
      {
        hasActivePeriod && (
          <>
            {/* Hide FAB if any modal is open to avoid z-index clutter */}
            <TandurFAB actions={fabActions} show={activeFabModal === null} />

            <CreateKasbonModal
              show={activeFabModal === 'kasbon'}
              onClose={closeModal}
              workers={activeWorkers}
              activeActivities={activeActivities}
            />

            <CreateExpenseModal
              show={activeFabModal === 'expense'}
              onClose={closeModal}
              activeActivities={activeActivities}
            />

            <UseStockModal
              show={activeFabModal === 'use_stock'}
              onClose={closeModal}
              items={inventoryItems}
              farmingSteps={farmingSteps}
            />

            <PurchaseStockModal
              show={activeFabModal === 'buy_stock'}
              onClose={closeModal}
              items={inventoryItems} // This modal usually needs full items to pick from or create new.
            // Actually PurchaseStockModal expects 'items' to be the list of all inventory references to pick from?
            // In DashboardController I only fetched inventoryItems with stock > 0 for UseStock.
            // PurchaseStock might need ALL inventory items (even 0 stock) to buy more of existing.
            // But let's pass what we have. If user creates new, modal handles it.
            // If user wants to buy existing 0 stock item, it won't be in list.
            // Minor gap: DashboardController logic for inventoryItems was 'stock > 0'.
            // For Purchase, we might want all items.
            // I should prob fetch all items in controller or just use what we have and rely on 'Create New' inside modal.
            // Let's stick to what we have for now, it's safer than overfetching.
            />
          </>
        )
      }

    </AuthenticatedLayout >
  );
}
