import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import InventorySummaryCard from '@/Components/InventorySummaryCard';
import InventoryList from '@/Components/InventoryList';
import InventoryItemRow from '@/Components/InventoryItemRow';
import InventoryMovementItem from '@/Components/InventoryMovementItem';
import SectionCard from '@/Components/SectionCard';
import { useState } from 'react';
import PurchaseStockModal from './Partials/PurchaseStockModal';
import UseStockModal from './Partials/UseStockModal';

interface Props {
  farmName: string;
  summary: {
    totalItems: number;
    totalValue: string;
    lowStock: number;
    usageThisPeriod: string;
  };
  items: any[];
  history: any[];
  activePeriodId?: number;
  activePeriodName: string; // Add prop type
  farmingSteps?: any[];
}

export default function Index({ farmName, summary, items, history, farmingSteps = [], activePeriodName }: Props) {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | number | null>(null);

  const handlePurchaseModalClose = () => {
    setShowPurchaseModal(false);
    setSelectedItemId(null); // Reset selected item on close
  };

  const handleUsageModalClose = () => {
    setShowUsageModal(false);
    setSelectedItemId(null);
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold leading-tight text-dark-tandur">
                Stok & Inventaris
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{farmName}</span>
                <span>•</span>
                <span className="font-medium text-main">{activePeriodName}</span>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden gap-3 md:flex">
              <button
                onClick={() => setShowUsageModal(true)}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-bold text-dark-tandur hover:bg-gray-200"
              >
                + Gunakan Stok
              </button>
              <button
                onClick={() => setShowPurchaseModal(true)}
                className="rounded-lg bg-main px-4 py-2 text-sm font-bold text-white-tandur hover:bg-main/90"
              >
                + Pembelian Baru
              </button>
            </div>
          </div>
        </div>
      }
    >
      <Head title="Stok & Inventaris" />

      <div className="flex flex-col gap-8 pb-20">
        {/* Section 1: Summary */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InventorySummaryCard
            title="Total Item"
            value={summary.totalItems}
          />
          <InventorySummaryCard
            title="Nilai Aset Stok"
            value={summary.totalValue}
            variant="info"
          />
          <InventorySummaryCard
            title="Item Hampir Habis"
            value={summary.lowStock}
            variant="warning"
          />
          <InventorySummaryCard
            title="Pemakaian (Periode Ini)"
            value={summary.usageThisPeriod}
            variant="default" // Neutral for usage value context
          />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Section 2: Inventory List (Main Content) */}
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-dark-tandur">Daftar Inventaris</h3>
              {/* Placeholder Filter */}
              <button className="text-sm font-medium text-main">Filter: Semua</button>
            </div>
            <InventoryList>
              {items.length > 0 ? (
                items.map((item) => (
                  <InventoryItemRow
                    key={item.id}
                    name={item.name}
                    category={item.category}
                    unit={item.unit}
                    stock={item.stock}
                    status={item.status as 'safe' | 'low' | 'empty'}
                    onAction={(action) => {
                      if (action === 'use') {
                        setSelectedItemId(item.id);
                        setShowUsageModal(true);
                      }
                      if (action === 'buy') {
                        setSelectedItemId(item.id);
                        setShowPurchaseModal(true);
                      }
                    }}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-3 rounded-full bg-gray-100 p-3 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-dark-tandur">Inventaris Masih Kosong</h3>
                  <p className="mt-1 text-xs text-gray-500">Belum ada item inventaris yang tercatat.</p>
                  <button
                    onClick={() => setShowPurchaseModal(true)}
                    className="mt-4 rounded-lg bg-main px-4 py-2 text-xs font-bold text-white-tandur hover:bg-main/90"
                  >
                    + Tambah Stok Baru
                  </button>
                </div>
              )}
            </InventoryList>
          </div>

          {/* Section 3: History (Sidebar Content) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-dark-tandur">Pergerakan Stok</h3>
              <button className="text-xs font-bold text-main hover:underline">Lihat Semua</button>
            </div>
            <SectionCard className="p-4">
              <div className="flex flex-col gap-2">
                {history.length > 0 ? (
                  history.map((h) => (
                    <InventoryMovementItem
                      key={h.unique_id || h.id}
                      date={h.date}
                      type={h.type as 'purchase' | 'usage' | 'adjustment'}
                      itemName={h.itemName}
                      quantity={h.quantity}
                      unit={h.unit}
                      stepName={h.stepName}
                    />
                  ))
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-xs text-gray-400 italic">Belum ada riwayat pergerakan stok.</p>
                  </div>
                )}
              </div>
            </SectionCard>
          </div>
        </div>
      </div>

      {/* Mobile Actions (Sticky Bottom) */}
      <div className="fixed bottom-0 left-0 w-full border-t border-gray-200 bg-white-tandur p-4 md:hidden">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setShowUsageModal(true)}
            className="w-full rounded-lg bg-gray-100 py-3 text-sm font-bold text-dark-tandur shadow active:scale-95"
          >
            Gunakan Stok
          </button>
          <button
            onClick={() => setShowPurchaseModal(true)}
            className="w-full rounded-lg bg-main py-3 text-sm font-bold text-white-tandur shadow-lg active:scale-95"
          >
            Beli Stok
          </button>
        </div>
      </div>

      {/* Modals */}
      <PurchaseStockModal
        show={showPurchaseModal}
        onClose={handlePurchaseModalClose}
        items={items}
        initialItemId={selectedItemId}
      />

      <UseStockModal
        show={showUsageModal}
        onClose={handleUsageModalClose}
        items={items}
        farmingSteps={farmingSteps}
        initialItemId={selectedItemId}
      />

    </AuthenticatedLayout>
  );
}
