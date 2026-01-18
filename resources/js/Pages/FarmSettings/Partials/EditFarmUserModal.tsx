import { useForm } from '@inertiajs/react';
import TandurModal from '@/Components/TandurModal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TandurSelect from '@/Components/TandurSelect';
import { FormEventHandler, useEffect } from 'react';

interface UserAccess {
  id: number;
  name: string;
  pivot: {
    role: string;
  };
}

interface Props {
  show: boolean;
  onClose: () => void;
  farmId: number;
  user: UserAccess;
}

export default function EditFarmUserModal({ show, onClose, farmId, user }: Props) {
  const { data, setData, put, processing, errors } = useForm({
    role: '',
  });

  useEffect(() => {
    if (show && user) {
      setData('role', user.pivot.role);
    }
  }, [show, user]);

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    put(route('farm-user-access.update', [farmId, user.id]), {
      onSuccess: () => {
        onClose();
      },
      preserveScroll: true,
    });
  };

  return (
    <TandurModal
      show={show}
      onClose={onClose}
      title={`Edit Akses: ${user.name}`}
      footer={
        <>
          <SecondaryButton className="w-full sm:w-auto" onClick={onClose}>Batal</SecondaryButton>
          <PrimaryButton className="w-full sm:w-auto" onClick={submit} disabled={processing}>
            Simpan Perubahan
          </PrimaryButton>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
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
