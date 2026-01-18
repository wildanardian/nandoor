import { useForm } from '@inertiajs/react';
import TandurModal from '@/Components/TandurModal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import TandurSelect from '@/Components/TandurSelect';
import InputError from '@/Components/InputError';
import { FormEventHandler, useEffect, useState } from 'react';
import { format } from 'date-fns';
import TandurDatePicker from '@/Components/TandurDatePicker';

interface Props {
  show: boolean;
  onClose: () => void;
  items: any[];
  farmingSteps: any[];
  initialItemId?: string | number | null;
}

export default function UseStockModal({ show, onClose, items, farmingSteps, initialItemId = null }: Props) {
  const { data, setData, post, processing, errors, reset } = useForm({
    inventory_item_id: initialItemId || '',
    quantity: '',
    used_at: format(new Date(), 'yyyy-MM-dd'),
    farming_step_id: '',
    notes: '',
  });

  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    if (initialItemId) {
      setData('inventory_item_id', initialItemId);
    }
  }, [initialItemId]);

  useEffect(() => {
    if (data.inventory_item_id) {
      const item = items.find(i => i.id == data.inventory_item_id); // loose comparison for string/number id
      setSelectedItem(item);
    } else {
      setSelectedItem(null);
    }
  }, [data.inventory_item_id, items]);

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route('inventory.usage'), {
      onSuccess: () => {
        reset();
        onClose();
      },
      preserveScroll: true,
    });
  };

  const itemOptions = items
    .filter(item => item.stock > 0)
    .map(item => ({
      value: item.id,
      label: `${item.name} (Stok: ${item.stock} ${item.unit})`
    }));

  const stepOptions = farmingSteps.map(step => ({
    value: step.id,
    label: step.name
  }));

  const isItemLocked = !!initialItemId;

  return (
    <TandurModal
      show={show}
      onClose={onClose}
      title="Gunakan Stok Inventaris"
      footer={
        <>
          <SecondaryButton className="w-full sm:w-auto" onClick={onClose}>Batal</SecondaryButton>
          <PrimaryButton className="w-full sm:w-auto" onClick={submit} disabled={processing}>
            Catat Pemakaian
          </PrimaryButton>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <TandurSelect
            label="Pilih Item"
            placeholder="-- Pilih Item dengan Stok Tersedia --"
            options={itemOptions}
            value={data.inventory_item_id}
            onChange={val => setData('inventory_item_id', val)}
            error={errors.inventory_item_id}
            disabled={isItemLocked}
          />
        </div>

        <div>
          <InputLabel value={`Jumlah Pemakaian ${selectedItem ? `(Max: ${selectedItem.stock} ${selectedItem.unit})` : ''}`} />
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
          <TandurDatePicker
            label="Tanggal Pemakaian"
            value={data.used_at ? new Date(data.used_at) : null}
            onChange={(date) => setData('used_at', date ? format(date, 'yyyy-MM-dd') : '')}
            error={errors.used_at}
            placement="top"
          />
        </div>

        <div>
          <TandurSelect
            label="Untuk Tahapan Pertanian (Opsional)"
            placeholder="-- Pilih Tahapan --"
            options={stepOptions}
            value={data.farming_step_id}
            onChange={val => setData('farming_step_id', val)}
            error={errors.farming_step_id}
          />
        </div>

        <div>
          <InputLabel value="Catatan / Keterangan" />
          <TextInput
            type="text"
            placeholder="Contoh: Pemupukan tambahan"
            className={`w-full mt-1 ${errors.notes ? 'border-danger focus:border-danger ring-danger/20' : ''}`}
            value={data.notes}
            onChange={e => setData('notes', e.target.value)}
          />
          <InputError message={errors.notes} className="mt-1" />
        </div>

      </form>
    </TandurModal>
  );
}
