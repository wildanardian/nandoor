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
}

export default function CreateUserModal({ show, onClose }: Props) {
  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    username: '', // Add username
    email: '',
    password: '', // Add password
    role: 'umum', // Default role
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route('users.store'), {
      onSuccess: () => {
        reset();
        onClose();
      },
      preserveScroll: true,
    });
  };

  return (
    <TandurModal
      show={show}
      onClose={onClose}
      title="Tambah Pengguna Baru"
      footer={
        <>
          <SecondaryButton className="w-full sm:w-auto" onClick={onClose}>Batal</SecondaryButton>
          <PrimaryButton className="w-full sm:w-auto" onClick={submit} disabled={processing}>
            Simpan
          </PrimaryButton>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <InputLabel value="Nama Lengkap" />
          <TextInput
            type="text"
            placeholder="Contoh: Budi Santoso"
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
            placeholder="Contoh: budi123"
            className={`w-full mt-1 ${errors.username ? 'border-danger focus:border-danger ring-danger/20' : ''}`}
            value={data.username}
            onChange={e => setData('username', e.target.value)}
          />
          <InputError message={errors.username} className="mt-1" />
        </div>

        <div>
          <InputLabel value="Email" />
          <TextInput
            type="email"
            placeholder="nama@email.com"
            className={`w-full mt-1 ${errors.email ? 'border-danger focus:border-danger ring-danger/20' : ''}`}
            value={data.email}
            onChange={e => setData('email', e.target.value)}
          />
          <InputError message={errors.email} className="mt-1" />
        </div>

        <div>
          <InputLabel value="Password" />
          <TextInput
            type="password"
            placeholder="********"
            className={`w-full mt-1 ${errors.password ? 'border-danger focus:border-danger ring-danger/20' : ''}`}
            value={data.password}
            onChange={e => setData('password', e.target.value)}
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
          <p className="mt-2 text-xs text-gray-500">
            * <b>Admin</b> dapat mengelola seluruh pengguna dan fitur sistem.<br />
            * <b>Umum</b> hanya bisa mengakses fitur sesuai akses sawah/farm yang diberikan.
          </p>
        </div>
      </form>
    </TandurModal>
  );
}
