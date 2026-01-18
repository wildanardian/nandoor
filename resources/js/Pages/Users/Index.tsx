import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import UserList from './Partials/UserList';
import CreateUserModal from './Partials/CreateUserModal';
import PrimaryButton from '@/Components/PrimaryButton';

interface Props {
  auth: any;
  users: any[];
}

export default function Index({ auth, users }: Props) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <AuthenticatedLayout
      header={
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold leading-tight text-dark-tandur">
              Manajemen Pengguna
            </h2>
            <div className="text-sm text-gray-500 mt-1">
              Kelola seluruh pengguna sistem aplikasi Tandur
            </div>
          </div>
          <PrimaryButton onClick={() => setShowCreateModal(true)}>
            + Tambah Pengguna
          </PrimaryButton>
        </div>
      }
    >
      <Head title="Manajemen Pengguna" />

      <div className="py-6">
        <UserList users={users} currentUserId={auth.user.id} />
      </div>

      <CreateUserModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

    </AuthenticatedLayout>
  );
}
