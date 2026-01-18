import Modal from '@/Components/Modal';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect } from 'react';
import TandurDatePicker from '@/Components/TandurDatePicker';
import TandurCurrencyInput from '@/Components/TandurCurrencyInput';
import { parseISO, format } from 'date-fns';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

interface Period {
  id: number;
  name: string;
  start_date: string;
  opening_balance: number;
}

interface Props {
  show: boolean;
  onClose: () => void;
  period: Period | null;
}

export default function EditPeriodModal({ show, onClose, period }: Props) {
  const { data, setData, put, processing, errors, reset, clearErrors } = useForm({
    name: '',
    start_date: '',
    opening_balance: 0,
  });

  useEffect(() => {
    if (period && show) {
      setData({
        name: period.name,
        start_date: period.start_date,
        opening_balance: period.opening_balance,
      });
      clearErrors();
    }
  }, [period, show]);

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    if (!period) return;

    put(route('periods.update', period.id), {
      onSuccess: () => {
        onClose();
        reset();
      },
      preserveScroll: true,
    });
  };

  return (
    <Modal show={show} onClose={onClose}>
      <form onSubmit={submit} className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Edit Informasi Periode
        </h2>

        <div className="mb-4">
          <InputLabel htmlFor="name" value="Nama Periode" />
          <TextInput
            id="name"
            type="text"
            value={data.name}
            onChange={(e) => setData('name', e.target.value)}
            className="mt-1 block w-full"
            placeholder="Contoh: Musim Tanam 1 2026"
          />
          <InputError message={errors.name} className="mt-2" />
        </div>

        <div className="mb-4">
          <TandurDatePicker
            label="Tanggal Mulai"
            value={data.start_date ? parseISO(data.start_date) : null}
            onChange={(date) => setData('start_date', date ? format(date, 'yyyy-MM-dd') : '')}
            error={errors.start_date}
          />
          <p className="text-xs text-gray-500 mt-1">Perubahan tanggal mungkin mempengaruhi laporan keuangan.</p>
        </div>

        <div className="mb-6">
          <TandurCurrencyInput
            label="Saldo Awal (Rp)"
            value={data.opening_balance}
            onChange={(val) => setData('opening_balance', val || 0)}
            error={errors.opening_balance}
          />
        </div>

        <div className="flex justify-end gap-3">
          <SecondaryButton onClick={onClose}>Batal</SecondaryButton>
          <PrimaryButton disabled={processing}>
            Simpan Perubahan
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}
