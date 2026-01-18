import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import AuthLayout from '@/Layouts/AuthLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import PasswordInput from '@/Components/PasswordInput';

export default function Login({ status, canResetPassword }: { status?: string; canResetPassword?: boolean }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    username: '',
    password: '',
    remember: false,
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();

    post(route('login'), {
      onFinish: () => reset('password'),
    });
  };

  return (
    <AuthLayout>
      <Head title="Masuk" />

      <div className="w-full max-w-md mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dark-tandur">Selamat Datang</h1>
          <p className="mt-2 text-gray-600">Masuk untuk melanjutkan</p>
        </div>

        {status && (
          <div className="mb-4 text-sm font-medium text-green-600">
            {status}
          </div>
        )}

        <form onSubmit={submit} className="space-y-6">
          <div>
            <InputLabel htmlFor="username" value="Username" className="mb-2 text-dark-tandur font-medium" />

            <TextInput
              id="username"
              type="text"
              name="username"
              value={data.username}
              className={`mt-1 block w-full ${errors.username ? 'border-danger focus:border-danger ring-danger/20' : ''}`}
              autoComplete="username"
              isFocused={true}
              onChange={(e) => setData('username', e.target.value)}
              placeholder="Masukkan username anda"
            />

            <InputError message={errors.username} className="mt-2 text-danger" />
          </div>

          <div>
            <InputLabel htmlFor="password" value="Password" className="mb-2 text-dark-tandur font-medium" />

            <PasswordInput
              id="password"
              name="password"
              value={data.password}
              className={`mt-1 block w-full ${errors.password ? 'border-danger focus:border-danger ring-danger/20' : ''}`}
              autoComplete="current-password"
              onChange={(e) => setData('password', e.target.value)}
              placeholder="Masukkan password anda"
            />

            <InputError message={errors.password} className="mt-2 text-danger" />
          </div>

          <div className="pt-2">
            <PrimaryButton className="w-full text-base font-bold py-4 rounded-full shadow-lg hover:shadow-xl transition-all" disabled={processing}>
              Masuk
            </PrimaryButton>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}
