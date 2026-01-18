import { useForm, usePage } from '@inertiajs/react';
import TandurModal from '@/Components/TandurModal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import TandurSelect from '@/Components/TandurSelect';
import InputError from '@/Components/InputError';
import { FormEventHandler, useState, useEffect } from 'react';
import { format } from 'date-fns';
import CreateInventoryItemModal from './CreateInventoryItemModal';
import TandurCurrencyInput from '@/Components/TandurCurrencyInput';
import TandurDatePicker from '@/Components/TandurDatePicker';

interface Props {
  show: boolean;
  onClose: () => void;
  items: any[];
  initialItemId?: string | number | null;
}

export default function PurchaseStockModal({ show, onClose, items, initialItemId = null }: Props) {
  const { flash } = usePage().props as any;
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Requirement: Prevent nested modals. 
  // We hide the main modal when create modal is active.
  const showMainModal = show && !showCreateModal;

  const { data, setData, post, processing, errors, reset } = useForm({
    inventory_item_id: initialItemId || '',
    quantity: '',
    price_total: '' as string | number | null,
    purchase_date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
  });

  // Effect to update data when initialItemId changes (e.g., when opening modal from list)
  useEffect(() => {
    if (initialItemId) {
      setData('inventory_item_id', initialItemId);
    }
  }, [initialItemId]);

  // Auto-select new item logic
  useEffect(() => {
    if (flash?.created_inventory_item_id) {
      setData('inventory_item_id', flash.created_inventory_item_id);
    }
  }, [flash]);

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route('inventory.purchase'), {
      onSuccess: () => {
        reset();
        onClose();
      },
      preserveScroll: true,
    });
  };

  const itemOptions = items.map(item => ({
    value: item.id,
    label: `${item.name} (${item.unit})`
  }));

  // Determine if item selection should be disabled (locked)
  const isItemLocked = !!initialItemId;

  return (
    <>
      <TandurModal
        show={showMainModal}
        onClose={onClose}
        title="Pembelian Stok Baru"
        footer={
          <>
            <SecondaryButton className="w-full sm:w-auto" onClick={onClose}>Batal</SecondaryButton>
            <PrimaryButton className="w-full sm:w-auto" onClick={submit} disabled={processing}>
              Simpan Pembelian
            </PrimaryButton>
          </>
        }
      >
        <form onSubmit={submit} className="space-y-4">
          <div>
            <TandurSelect
              label="Pilih Item Inventaris"
              placeholder="-- Pilih Item --"
              options={itemOptions}
              value={data.inventory_item_id}
              onChange={val => setData('inventory_item_id', val)}
              onAddNew={() => setShowCreateModal(true)}
              error={errors.inventory_item_id}
              disabled={isItemLocked}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <InputLabel value="Jumlah (Qty)" />
              <TextInput
                type="number"
                step="0.01"
                placeholder="0"
                className={`w-full mt-1 ${errors.quantity ? 'border-danger focus:border-danger ring-danger/20' : ''}`}
                value={data.quantity}
                onChange={e => setData('quantity', e.target.value)}
              />
              <InputError message={errors.quantity} className="mt-1" />
            </div>

            <div>
              <TandurCurrencyInput
                label="Total Harga"
                value={data.price_total}
                onChange={(val) => setData('price_total', val)}
                error={errors.price_total}
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <TandurDatePicker
              label="Tanggal Pembelian"
              value={data.purchase_date ? new Date(data.purchase_date) : null}
              onChange={(date) => setData('purchase_date', date ? format(date, 'yyyy-MM-dd') : '')}
              error={errors.purchase_date}
              placement="top"
            />
          </div>

          <div className="col-span-2">
            <InputLabel value="Keterangan / Deskripsi" />
            <TextInput
              type="text"
              className={`w-full mt-1 ${errors.description ? 'border-danger focus:border-danger ring-danger/20' : ''}`}
              value={data.description}
              onChange={e => setData('description', e.target.value)}
              placeholder="Contoh: Stok tambahan untuk musim tanam"
            />
            <InputError message={errors.description} className="mt-1" />
          </div>
        </form>
      </TandurModal>

      <CreateInventoryItemModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
        }}
      />
    </>
  );
}
