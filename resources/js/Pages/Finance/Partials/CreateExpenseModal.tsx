import { useForm } from '@inertiajs/react';
import TandurModal from '@/Components/TandurModal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import TandurSelect from '@/Components/TandurSelect';
import InputError from '@/Components/InputError';
import TandurCurrencyInput from '@/Components/TandurCurrencyInput';
import TandurDatePicker from '@/Components/TandurDatePicker';
import { format } from 'date-fns';
import { FormEventHandler, useEffect } from 'react';

interface Props {
  show: boolean;
  onClose: () => void;
  activeActivities: any[];
}

export default function CreateExpenseModal({ show, onClose, activeActivities }: Props) {
  const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
    description: '',
    amount: '',
    expense_date: format(new Date(), 'yyyy-MM-dd'),
    farm_activity_id: '',
    type: 'other',
  });

  useEffect(() => {
    if (!show) {
      clearErrors();
    }
  }, [show]);

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route('finance.store-expense'), {
      onSuccess: () => {
        reset();
        onClose();
      },
      preserveScroll: true,
    });
  };

  const activityOptions = activeActivities.map(act => ({
    label: act.name,
    value: act.id
  }));

  const typeOptions = [
    { value: 'fertilizer', label: 'Pupuk' },
    { value: 'chemical', label: 'Obat/Kimia' },
    { value: 'labor', label: 'Tenaga Kerja' },
    { value: 'tool', label: 'Sewa Alat' },
    { value: 'other', label: 'Lainnya' },
  ];

  return (
    <TandurModal
      show={show}
      onClose={onClose}
      title="Catat Pengeluaran Cepat"
      footer={
        <>
          <SecondaryButton className="w-full sm:w-auto" onClick={onClose}>Batal</SecondaryButton>
          <PrimaryButton className="w-full sm:w-auto" onClick={submit} disabled={processing}>
            Simpan Pengeluaran
          </PrimaryButton>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <InputLabel value="Deskripsi Pengeluaran" />
          <TextInput
            placeholder="Contoh: Beli Pupuk Urea"
            className={`w-full mt-1 ${errors.description ? 'border-danger focus:border-danger ring-danger/20' : ''}`}
            value={data.description}
            onChange={e => setData('description', e.target.value)}
          />
          <InputError message={errors.description} className="mt-1" />
        </div>

        <div>
          <TandurCurrencyInput
            label="Nominal"
            value={data.amount}
            onChange={(val) => setData('amount', val ? val.toString() : '')}
            placeholder="Rp 0"
            error={errors.amount}
          />
        </div>

        <div>
          <InputLabel value="Tanggal" />
          <TandurDatePicker
            value={data.expense_date ? new Date(data.expense_date) : null}
            onChange={(date) => setData('expense_date', date ? format(date, 'yyyy-MM-dd') : '')}
            className="mt-1"
            placement="top"
          />
          <InputError message={errors.expense_date} className="mt-1" />
        </div>

        <div>
          <TandurSelect
            label="Tipe Pengeluaran"
            placeholder="-- Pilih Tipe --"
            options={typeOptions}
            value={data.type}
            onChange={val => setData('type', val)}
            error={errors.type}
          />
        </div>

        <div>
          <TandurSelect
            label="Terkait Tahapan (Opsional)"
            placeholder="-- Pilih Tahapan --"
            options={activityOptions}
            value={data.farm_activity_id}
            onChange={val => setData('farm_activity_id', val)}
            error={errors.farm_activity_id}
          />
        </div>
      </form>
    </TandurModal>
  );
}
