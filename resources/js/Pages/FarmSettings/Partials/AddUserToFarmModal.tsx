import { useForm } from '@inertiajs/react';
import TandurModal from '@/Components/TandurModal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TandurSelect from '@/Components/TandurSelect';
import InputError from '@/Components/InputError';
import { FormEventHandler } from 'react';

interface UserOption {
  id: number;
  name: string;
  email: string;
}

interface Props {
  show: boolean;
  onClose: () => void;
  farmId: number;
  potentialUsers: UserOption[];
}

export default function AddUserToFarmModal({ show, onClose, farmId, potentialUsers }: Props) {
  const { data, setData, post, processing, errors, reset } = useForm({
    user_id: '',
    role: 'anggota',
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route('farm-user-access.store', farmId), {
      onSuccess: () => {
        reset();
        onClose();
      },
      preserveScroll: true,
    });
  };

  const userOptions = potentialUsers.map(u => ({
    value: u.id.toString(),
    label: `${u.name} (${u.email})`
  }));

  return (
    <TandurModal
      show={show}
      onClose={onClose}
      title="Tambah Pengguna ke Sawah"
      footer={
        <>
          <SecondaryButton className="w-full sm:w-auto" onClick={onClose}>Batal</SecondaryButton>
          <PrimaryButton className="w-full sm:w-auto" onClick={submit} disabled={processing}>
            Tambahkan
          </PrimaryButton>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <TandurSelect
            label="Pilih Pengguna"
            placeholder="-- Pilih Pengguna --"
            options={userOptions}
            value={data.user_id}
            onChange={val => setData('user_id', val)}
            error={errors.user_id}
            searchable // Enable search if component supports it (TandurSelect might not yet, but assuming basic select is ok for now)
          />
          {potentialUsers.length === 0 && (
            <p className="mt-1 text-xs text-gray-500">
              Tidak ada pengguna lain yang tersedia. Tambahkan pengguna baru melalui menu Manajemen Pengguna.
            </p>
          )}
        </div>

        <div>
          <TandurSelect
            label="Peran di Sawah"
            options={[
              { label: 'Pemilik (Owner)', value: 'pemilik' },
              { label: 'Anggota (Member) - Catat & Lihat', value: 'anggota' },
            ]}
            value={data.role}
            onChange={val => setData('role', val)}
            error={errors.role}
          />
        </div>
      </form>
    </TandurModal>
  );
}
