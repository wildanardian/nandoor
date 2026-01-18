import { useState } from 'react';
import EditUserModal from './EditUserModal';
import { router } from '@inertiajs/react';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'umum' | string;
  initials: string;
  is_active: boolean;
}

interface Props {
  users: User[];
  currentUserId: number;
}

export default function UserList({ users, currentUserId }: Props) {
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'umum': return 'Umum';
      default: return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'umum': return 'bg-gray-100 text-gray-800 border border-gray-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleToggleStatus = (user: User) => {
    const action = user.is_active ? 'nonaktifkan' : 'aktifkan';
    if (confirm(`Apakah anda yakin ingin meng-${action} pengguna ${user.name}?`)) {
      router.delete(route('users.destroy', user.id)); // Using destroy route for toggle as per plan
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {users.map((user) => (
        <div
          key={user.id}
          className={`flex flex-col gap-4 rounded-xl border p-4 shadow-sm transition-all hover:shadow-md sm:flex-row sm:items-center sm:justify-between ${user.is_active ? 'bg-white-tandur border-gray-100' : 'bg-gray-50 border-gray-200 opacity-75'}`}
        >
          {/* User Info */}
          <div className="flex items-center gap-4">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-white-tandur ${user.is_active ? 'bg-main' : 'bg-gray-400'}`}>
              {user.initials}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className={`font-bold ${user.is_active ? 'text-dark-tandur' : 'text-gray-500'}`}>
                  {user.name}
                </h4>
                <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${getRoleBadgeColor(user.role)}`}>
                  {getRoleLabel(user.role)}
                </span>
                {!user.is_active && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-800 font-medium border border-red-200">Nonaktif</span>
                )}
                {user.id === currentUserId && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-600 font-medium border border-blue-100">Anda</span>
                )}
              </div>
              <div className="text-sm text-gray-500 font-mono">{user.email}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setEditingUser(user)}
              className="rounded-lg bg-gray-50 p-2 text-main hover:bg-main/10 border border-gray-100"
              title="Edit Data"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
            </button>

            {user.id !== currentUserId && (
              <button
                onClick={() => handleToggleStatus(user)}
                className={`rounded-lg p-2 border ${user.is_active ? 'bg-gray-50 text-danger hover:bg-danger/10 border-gray-100' : 'bg-success/10 text-success hover:bg-success/20 border-success/20'}`}
                title={user.is_active ? "Nonaktifkan Pengguna" : "Aktifkan Pengguna"}
              >
                {user.is_active ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
      ))}

      {editingUser && (
        <EditUserModal
          show={!!editingUser}
          user={editingUser}
          onClose={() => setEditingUser(null)}
        />
      )}
    </div>
  );
}
