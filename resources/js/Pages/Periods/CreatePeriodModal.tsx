import Modal from '@/Components/Modal';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import TandurDatePicker from '@/Components/TandurDatePicker';
import TandurCurrencyInput from '@/Components/TandurCurrencyInput';
import { parseISO, format } from 'date-fns';

interface Props {
  show: boolean;
  onClose: () => void;
}

export default function CreatePeriodModal({ show, onClose }: Props) {
  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    start_date: '',
    opening_balance: 0,
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route('periods.store'), {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  return (
    <Modal show={show} onClose={onClose}>
      <form onSubmit={submit} className="p-6">
        <h2 className="text-lg font-medium text-gray-900">
          Buat Periode Panen Baru
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Mulai periode baru untuk mencatat aktivitas dan keuangan.
        </p>

        <div className="mt-6">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Periode</label>
          <input
            id="name"
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-main focus:ring-main sm:text-sm"
            placeholder="Contoh: Musim Tanam 1 2026"
            value={data.name}
            onChange={(e) => setData('name', e.target.value)}
            required
          />
          {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
        </div>

        <div className="mt-4">
          <TandurDatePicker
            label="Tanggal Mulai"
            value={data.start_date ? parseISO(data.start_date) : null}
            onChange={(date) => setData('start_date', date ? format(date, 'yyyy-MM-dd') : '')}
            error={errors.start_date}
          />
        </div>

        <div className="mt-4">
          <TandurCurrencyInput
            label="Saldo Awal (Rp)"
            value={data.opening_balance}
            onChange={(val) => setData('opening_balance', val || 0)}
            error={errors.opening_balance}
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={processing}
            className="inline-flex justify-center rounded-lg border border-transparent bg-main px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-main/90 focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2 disabled:opacity-50"
          >
            {processing ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
