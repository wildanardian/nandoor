import { useForm } from '@inertiajs/react';
import TandurModal from '@/Components/TandurModal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import TandurSelect from '@/Components/TandurSelect';
import InputError from '@/Components/InputError';
import { FormEventHandler, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  username: string; // Add username
  email: string;
  role: string;
}

interface Props {
  show: boolean;
  user: User;
  onClose: () => void;
}

export default function EditUserModal({ show, user, onClose }: Props) {
  const { data, setData, put, processing, errors, reset } = useForm({
    name: '',
    username: '', // Add
    email: '',
    password: '', // Add
    role: '',
  });

  useEffect(() => {
    if (show && user) {
      setData({
        name: user.name,
        username: user.username || '', // Add
        email: user.email,
        password: '', // Reset password field
        role: user.role, // 'admin' or 'umum'
      });
    }
  }, [show, user]);

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    put(route('users.update', user.id), {
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
      title={`Edit Pengguna: ${user.name}`}
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
          <InputLabel value="Nama Lengkap" />
          <TextInput
            type="text"
            className={`w-full mt-1 ${errors.name ? 'border-danger focus:border-danger ring-danger/20' : ''}`}
            value={data.name}
            onChange={e => setData('name', e.target.value)}
          />
          <InputError message={errors.name} className="mt-1" />
        </div>

        <div>
          <InputLabel value="Username" />
          <TextInput
            type="text"
            value={data.username}
            onChange={e => setData('username', e.target.value)}
            className={`w-full mt-1 ${errors.username ? 'border-danger focus:border-danger ring-danger/20' : ''}`}
          />
          <InputError message={errors.username} className="mt-1" />
        </div>

        <div>
          <InputLabel value="Email Pengguna" />
          <TextInput
            type="email"
            value={data.email}
            onChange={e => setData('email', e.target.value)}
            className={`w-full mt-1 ${errors.email ? 'border-danger focus:border-danger ring-danger/20' : ''}`}
          />
          <InputError message={errors.email} className="mt-1" />
        </div>

        <div>
          <InputLabel value="Password Baru (Opsional)" />
          <TextInput
            type="password"
            placeholder="Isi jika ingin mengubah password"
            value={data.password}
            onChange={e => setData('password', e.target.value)}
            className={`w-full mt-1 ${errors.password ? 'border-danger focus:border-danger ring-danger/20' : ''}`}
          />
          <InputError message={errors.password} className="mt-1" />
        </div>

        <div>
          <TandurSelect
            label="Peran / Global Role"
            placeholder="-- Pilih Peran --"
            options={[
              { value: 'admin', label: 'Admin (Akses Penuh)' },
              { value: 'umum', label: 'Umum (Akses Standar)' },
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
