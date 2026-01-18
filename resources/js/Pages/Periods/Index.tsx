import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import ActivePeriodCard from '@/Components/ActivePeriodCard';
import PeriodHistoryList from '@/Components/PeriodHistoryList';
import PeriodHistoryItem from '@/Components/PeriodHistoryItem';
import { useState } from 'react';
import CreatePeriodModal from './CreatePeriodModal';
import EditPeriodModal from './EditPeriodModal'; // Import Edit Modal
import Modal from '@/Components/Modal'; // For Close Confirmation
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { useAlert } from '@/Contexts/AlertContext';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface Props {
  farm: any;
  activePeriod: any;
  history: any[];
}

export default function Index({ farm, activePeriod, history }: Props) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const { showAlert } = useAlert();

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleCloseClick = () => {
    setIsCloseModalOpen(true);
  };

  const confirmClosePeriod = () => {
    if (!activePeriod) return;
    router.post(route('periods.close', activePeriod.id), {}, {
      onSuccess: (page) => {
        setIsCloseModalOpen(false);

        // Check flash message from backend
        const flash = page.props.flash as { success?: string; error?: string };

        if (flash?.success) {
          showAlert({
            type: 'success',
            title: 'Sukses',
            description: flash.success
          });
        } else if (flash?.error) {
          showAlert({
            type: 'error',
            title: 'Gagal',
            description: flash.error
          });
        }
      },
      onError: (err) => {
        setIsCloseModalOpen(false);
      }
    });
  };

  // Helper to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Helper to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'dd MMM yyyy', { locale: idLocale });
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold leading-tight text-dark-tandur">
                Periode Panen
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{farm?.name || 'Sawah'}</span>
                <span>•</span>
                <span className="font-medium text-main">{farm?.plant_type?.name || '-'}</span>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden gap-3 md:flex">
              {!activePeriod && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="rounded-lg bg-main px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-main/90"
                >
                  + Periode Baru
                </button>
              )}
            </div>
          </div>
        </div>
      }
    >
      <Head title="Periode Panen" />

      <div className="flex flex-col gap-10 pb-20">
        {/* Section 1: Active Period */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-dark-tandur">Periode Saat Ini</h3>
            {/* Mobile Action for Create */}
            {!activePeriod && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="md:hidden rounded-lg bg-main px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-main/90"
              >
                + Baru
              </button>
            )}
          </div>

          {activePeriod ? (
            <ActivePeriodCard
              name={activePeriod.name}
              startDate={formatDate(activePeriod.start_date)}
              openingBalance={formatCurrency(activePeriod.opening_balance)}
              totalExpense={formatCurrency(activePeriod.total_expense || 0)} // Assuming aggregates exist or 0
              totalIncome={formatCurrency(activePeriod.total_income || 0)}
              currentBalance={formatCurrency((Number(activePeriod.opening_balance) + Number(activePeriod.total_income || 0)) - Number(activePeriod.total_expense || 0))} // Basic calc
              status={activePeriod.status}
              cropType={activePeriod.crop_type?.name}
              hasPendingSteps={activePeriod.has_pending_steps}
              onClose={handleCloseClick}
              onEdit={handleEditClick}
            />
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
              <p className="text-gray-500">Belum ada periode aktif.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-2 font-bold text-main hover:underline"
              >
                Buat Periode Baru
              </button>
            </div>
          )}
        </div>

        {/* Section 2: History */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-dark-tandur">Riwayat Periode</h3>
          </div>
          <PeriodHistoryList>
            {history.length > 0 ? (
              history.map((h) => (
                <PeriodHistoryItem
                  key={h.id}
                  name={h.name}
                  startDate={formatDate(h.start_date)}
                  endDate={formatDate(h.end_date)}
                  totalExpense={formatCurrency(h.total_expense || 0)}
                  totalIncome={formatCurrency(h.total_income || 0)}
                  closingBalance={formatCurrency(h.closing_balance || 0)}
                />
              ))
            ) : (
              <div className="p-4 text-center text-sm text-gray-500">
                Belum ada riwayat periode.
              </div>
            )}
          </PeriodHistoryList>
        </div>
      </div>

      <CreatePeriodModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {/* Edit Modal */}
      <EditPeriodModal
        show={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        period={activePeriod}
      />

      {/* Close Confirmation Modal */}
      <Modal show={isCloseModalOpen} onClose={() => setIsCloseModalOpen(false)}>
        <div className="p-6">
          <h2 className="text-lg font-bold text-dark-tandur mb-4">Tutup Periode?</h2>
          <p className="text-gray-600 mb-6 text-sm">
            Apakah Anda yakin ingin menutup periode ini? <br />
            Pastikan semua tahapan dan transaksi sudah selesai. Periode yang ditutup tidak dapat dibuka kembali.
          </p>
          <div className="flex justify-end gap-3">
            <SecondaryButton onClick={() => setIsCloseModalOpen(false)}>Batal</SecondaryButton>
            <PrimaryButton onClick={confirmClosePeriod} className="bg-dark-tandur hover:bg-dark-tandur/90">
              Ya, Tutup Periode
            </PrimaryButton>
          </div>
        </div>
      </Modal>
    </AuthenticatedLayout>
  );
}
