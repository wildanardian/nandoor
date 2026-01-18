import { useForm } from '@inertiajs/react';
import TandurModal from '@/Components/TandurModal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import TandurSelect from '@/Components/TandurSelect';
import InputError from '@/Components/InputError';
import { FormEventHandler } from 'react';

interface Props {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateInventoryItemModal({ show, onClose, onSuccess }: Props) {
  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    category: '',
    unit: '',
    min_stock: '5',
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route('inventory.store'), {
      onSuccess: () => {
        reset();
        onSuccess();
        onClose();
      },
      preserveScroll: true,
    });
  };

  const categoryOptions = [
    { value: 'pupuk', label: 'Pupuk' },
    { value: 'bibit', label: 'Bibit' },
    { value: 'pestisida', label: 'Pestisida' },
    { value: 'peralatan', label: 'Peralatan' },
    { value: 'lainnya', label: 'Lainnya' },
  ];

  const unitOptions = [
    { value: 'kg', label: 'Kilogram (kg)' },
    { value: 'liter', label: 'Liter (L)' },
    { value: 'pcs', label: 'Pcs / Buah' },
    { value: 'sak', label: 'Sak / Karung' },
    { value: 'bgks', label: 'Bungkus' },
  ];

  return (
    <TandurModal
      show={show}
      onClose={onClose}
      title="Tambah Item Inventaris Baru"
      footer={
        <>
          <SecondaryButton className="w-full sm:w-auto" onClick={onClose}>Batal</SecondaryButton>
          <PrimaryButton className="w-full sm:w-auto" onClick={submit} disabled={processing}>
            Simpan Item
          </PrimaryButton>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <InputLabel value="Nama Item" />
          <TextInput
            type="text"
            placeholder="Contoh: Urea, NPK, Insektisida..."
            className={`w-full mt-1 ${errors.name ? 'border-danger focus:border-danger ring-danger/20' : ''}`}
            value={data.name}
            onChange={e => setData('name', e.target.value)}
            autoFocus
          />
          <InputError message={errors.name} className="mt-1" />
        </div>

        <div>
          <TandurSelect
            label="Kategori"
            placeholder="-- Pilih Kategori --"
            options={categoryOptions}
            value={data.category}
            onChange={val => setData('category', val)}
            error={errors.category}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <TandurSelect
              label="Satuan Unit"
              placeholder="-- Pilih Unit --"
              options={unitOptions}
              value={data.unit}
              onChange={val => setData('unit', val)}
              error={errors.unit}
            />
          </div>

          <div>
            <InputLabel value="Min. Stok (Alert)" />
            <TextInput
              type="number"
              placeholder="5"
              className={`w-full mt-1 ${errors.min_stock ? 'border-danger focus:border-danger ring-danger/20' : ''}`}
              value={data.min_stock}
              onChange={e => setData('min_stock', e.target.value)}
            />
            <InputError message={errors.min_stock} className="mt-1" />
          </div>
        </div>
      </form>
    </TandurModal>
  );
}
