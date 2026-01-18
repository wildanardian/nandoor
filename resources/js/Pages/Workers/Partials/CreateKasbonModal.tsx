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
  workers: any[];
  activeActivities: any[];
}

export default function CreateKasbonModal({ show, onClose, workers, activeActivities }: Props) {
  const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
    worker_id: '',
    payment_date: format(new Date(), 'yyyy-MM-dd'),
    amount: '',
    notes: '',
    farm_activity_id: '',
  });

  useEffect(() => {
    if (show) {
      // Set default activity if available and none selected
      if (!data.farm_activity_id && activeActivities.length > 0) {
        setData('farm_activity_id', activeActivities[0].id.toString());
      }
    } else {
      // Optional: Reset on close? usually better to reset on success.
      // But we should clear errors.
      clearErrors();
    }
  }, [show, activeActivities]);

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route('workers.store-kasbon'), {
      onSuccess: () => {
        reset();
        onClose();
      },
      preserveScroll: true,
    });
  };

  const workerOptions = workers.map(w => ({
    label: w.name,
    value: w.id
  }));

  const activityOptions = activeActivities.map(act => ({
    label: act.name,
    value: act.id
  }));

  return (
    <TandurModal
      show={show}
      onClose={onClose}
      title="Catat Kasbon Pekerja"
      footer={
        <>
          <SecondaryButton className="w-full sm:w-auto" onClick={onClose}>Batal</SecondaryButton>
          <PrimaryButton className="w-full sm:w-auto" onClick={submit} disabled={processing}>
            Simpan Kasbon
          </PrimaryButton>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <TandurSelect
            label="Pilih Pekerja"
            placeholder="-- Pilih Pekerja --"
            options={workerOptions}
            value={data.worker_id}
            onChange={val => setData('worker_id', val)}
            error={errors.worker_id}
          />
        </div>

        <div>
          <TandurSelect
            label="Aktivitas (Proyek)"
            placeholder="-- Pilih Aktivitas --"
            options={activityOptions}
            value={data.farm_activity_id}
            onChange={val => setData('farm_activity_id', val)}
            error={errors.farm_activity_id}
          />
        </div>

        <div>
          <TandurCurrencyInput
            label="Nominal Kasbon"
            value={data.amount}
            onChange={(val) => setData('amount', val ? val.toString() : '')}
            placeholder="Rp 0"
            error={errors.amount}
          />
        </div>

        <div>
          <InputLabel value="Tanggal" />
          <TandurDatePicker
            value={data.payment_date ? new Date(data.payment_date) : null}
            onChange={(date) => setData('payment_date', date ? format(date, 'yyyy-MM-dd') : '')}
            className="mt-1"
            placement="top"
          />
          <InputError message={errors.payment_date} className="mt-1" />
        </div>

        <div>
          <InputLabel value="Catatan" />
          <TextInput
            className="w-full mt-1"
            value={data.notes}
            onChange={e => setData('notes', e.target.value)}
            placeholder="Contoh: Pinjaman untuk beli pulsa"
          />
          <InputError message={errors.notes} className="mt-1" />
        </div>
      </form>
    </TandurModal>
  );
}
