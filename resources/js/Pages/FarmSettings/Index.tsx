import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import FarmInfoForm from '@/Components/FarmInfoForm';
import FarmPlotItem from '@/Components/FarmPlotItem';
import FarmUserAccessItem from '@/Components/FarmUserAccessItem';
import DangerZone from '@/Components/DangerZone';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { useState } from 'react';
import TandurSelect from '@/Components/TandurSelect';
import { useAlert } from '@/Contexts/AlertContext';
import AddUserToFarmModal from './Partials/AddUserToFarmModal';
import EditFarmUserModal from './Partials/EditFarmUserModal';
import TandurModal from '@/Components/TandurModal';

// Interfaces
interface FarmPlot {
  id: number;
  name: string;
  area_ha: number;
  activities_count: number;
}

interface UserAccess {
  id: number;
  name: string;
  email: string;
  pivot: {
    role: string;
  };
}

interface Farm {
  id: number;
  name: string;
  crop_type_id: number;
  area_ha: number;
  area_measured_at?: string;
  plots?: FarmPlot[];
  users?: UserAccess[];
  owner_id: number;
  has_active_period: boolean;
}

interface CropType {
  id: number;
  name: string;
  slug: string;
}

interface PageProps {
  auth: { user: { id: number; name: string; email: string } };
  farm: Farm | null;
  cropTypes: CropType[];
  potentialUsers: { id: number; name: string; email: string }[];
  flash: {
    success?: string;
    error?: string;
  };
}

export default function Index({ auth, farm, cropTypes, flash, potentialUsers }: PageProps) {
  const { showAlert } = useAlert();
  const [isCreating, setIsCreating] = useState(false);

  // --- Start: Farm Info Logic ---
  const farmData = farm ? {
    name: farm.name,
    area: farm.area_ha?.toString() || '',
    date: farm.area_measured_at || '',
    cropType: (farm.crop_type_id || '').toString(),
  } : {
    name: '',
    area: '',
    date: '',
    cropType: '',
  };

  const handleFarmSubmit = (data: any) => {
    if (farm) {
      router.put(route('farms.update', farm.id), data, { preserveScroll: true });
    } else {
      router.post(route('farms.store'), data, {
        preserveScroll: true,
        onSuccess: () => setIsCreating(false),
      });
    }
  };
  // --- End: Farm Info Logic ---

  // --- Start: Plot Logic ---
  const [isPlotModalOpen, setIsPlotModalOpen] = useState(false);
  const [editingPlot, setEditingPlot] = useState<FarmPlot | null>(null);
  const [isDeletePlotModalOpen, setIsDeletePlotModalOpen] = useState(false);
  const [plotToDelete, setPlotToDelete] = useState<FarmPlot | null>(null);

  const { data: plotData, setData: setPlotData, post: postPlot, put: putPlot, reset: resetPlot, processing: plotProcessing, errors: plotErrors, clearErrors: clearPlotErrors } = useForm({
    name: '',
    area_ha: '',
  });

  const openAddPlot = () => {
    setEditingPlot(null);
    resetPlot();
    clearPlotErrors();
    setIsPlotModalOpen(true);
  };

  const openEditPlot = (plot: FarmPlot) => {
    setEditingPlot(plot);
    setPlotData({
      name: plot.name,
      area_ha: plot.area_ha.toString(),
    });
    clearPlotErrors();
    setIsPlotModalOpen(true);
  };

  const submitPlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!farm) return;

    if (editingPlot) {
      putPlot(route('farm-plots.update', editingPlot.id), {
        onSuccess: () => setIsPlotModalOpen(false),
      });
    } else {
      postPlot(route('farm-plots.store', farm.id), {
        onSuccess: () => setIsPlotModalOpen(false),
      });
    }
  };

  const confirmDeletePlot = (plot: FarmPlot) => {
    setPlotToDelete(plot);
    setIsDeletePlotModalOpen(true);
  };

  const handleDeletePlot = () => {
    if (plotToDelete) {
      router.delete(route('farm-plots.destroy', plotToDelete.id), {
        onSuccess: () => setIsDeletePlotModalOpen(false),
      });
    }
  };
  // --- End: Plot Logic ---

  // --- Start: User Access Logic ---
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isRemoveUserModalOpen, setIsRemoveUserModalOpen] = useState(false);
  const [userToRemove, setUserToRemove] = useState<UserAccess | null>(null);
  const [editingUser, setEditingUser] = useState<UserAccess | null>(null);

  const openAddUser = () => {
    setIsAddUserModalOpen(true);
  };

  const openEditUser = (user: UserAccess) => {
    setEditingUser(user);
  };

  const confirmRemoveUser = (user: UserAccess) => {
    setUserToRemove(user);
    setIsRemoveUserModalOpen(true);
  };

  // We are removing the Pivot `FarmUserAccess` ID.
  // But our interface has `users` list.
  // Actually, standard usage via relation usually assumes deleting pivot.
  // The controller `destroy` accepts `FarmUserAccess $farmUserAccess`.
  // I need the pivot ID. The `users` relation pivot data might not include ID unless included in query.
  // Default `withPivot` only includes keys specified. `withPivot('role')` -> pivot table keys + role.
  // Usually pivot contains generic fields. Pivot ID is usually `id` if pivot is model-based.
  // But wait, `farm_user_access` has `id`.
  // I need to ensure `withPivot` includes `id`. Or access via `user.pivot.id` if Laravel loads it.
  // Standard `belongsToMany` doesn't load pivot ID by default unless requested `withPivot('id', ...)`?
  // Actually `Farm` model has `farmUserAccesses` relation (hasMany).
  // If `users` relation (belongsToMany) excludes pivot key, I can't delete by ID easily.
  // UPDATE: I will assume `pivot.id` is available (need to update Model if not?)
  // Let's pass `user` and `farm` ID via a helper endpoint or ensure pivot Id is loaded.
  // Or... `Farm` model `users()`: `->withPivot('id', 'role')`?
  // I'll update `Farm.php` `users` relation just in case. But for now I will try assuming standard.
  // If `users` relation used `FarmUserAccess` (HasMany), it's easier.
  // But wait, `FarmController` passes `users`.
  // I'll assume we might need to delete by User ID?
  // My controller `destroy` uses `FarmUserAccess $farmUserAccess`. Route binding expects ID of that row.
  // So I NEED pivot ID.
  // I'll update `Farm.php` right after this to be safe: `withPivot('id', 'role')`.

  const handleRemoveUser = () => {
    if (userToRemove && farm) {
      // Updated to use user.id directly as per new route format
      router.delete(route('farm-user-access.destroy', [farm.id, userToRemove.id]), {
        onSuccess: () => setIsRemoveUserModalOpen(false)
      });
    }
  };
  // --- End: User Access Logic ---

  // --- Start: Danger Logic ---
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isDeleteFarmModalOpen, setIsDeleteFarmModalOpen] = useState(false);
  const { data: deleteFarmData, setData: setDeleteFarmData, delete: destroyFarm, processing: deleteFarmProcessing, errors: deleteFarmErrors } = useForm({
    confirmationName: '',
  });

  const handleArchive = () => {
    if (!farm) return;
    router.post(route('farms.archive', farm.id), {}, {
      onSuccess: () => setIsArchiveModalOpen(false)
    });
  };

  const submitDeleteFarm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!farm) return;
    if (deleteFarmData.confirmationName !== farm.name) {
      // add error logic if useForm supports setting logic error or just local state error
      // We can use setError manually if we want, or just rely on backend if implemented
      // But better checking frontend.
      alert("Nama sawah tidak sesuai"); // Simple alert for now or implement local error
      return;
    }

    destroyFarm(route('farms.destroy', farm.id), {
      onSuccess: () => setIsDeleteFarmModalOpen(false)
    });
  };
  // --- End: Danger Logic ---

  return (
    <AuthenticatedLayout
      header={
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold leading-tight text-dark-tandur">
                Pengaturan Sawah
              </h2>
              {farm && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{farm.name}</span>
                </div>
              )}
            </div>
            {/* ALERT TEST BUTTONS */}
            {/* <div className="flex gap-2">
              <button
                onClick={() => showAlert({ type: 'success', title: 'Payment processed', description: 'Transaction ID: #14402' })}
                className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs"
              >
                Test Success
              </button>
              <button
                onClick={() => showAlert({ type: 'warning', title: 'Connection failed', description: 'Check your internet connection' })}
                className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-xs"
              >
                Test Warning
              </button>
              <button
                onClick={() => showAlert({ type: 'info', title: 'Update available', description: 'Version 2.1.0 ready to install' })}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs"
              >
                Test Info
              </button>
              <button
                onClick={() => showAlert({ type: 'error', title: 'Something went wrong', description: 'Please try again later' })}
                className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs"
              >
                Test Error
              </button>
            </div> */}
          </div>
        </div>
      }
    >
      <Head title="Pengaturan Sawah" />

      <div className="py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">

          {/* Flash Messages */}
          {flash?.error && (
            <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-600 border border-red-200">
              {flash.error}
            </div>
          )}
          {flash?.success && (
            <div className="mb-6 rounded-md bg-green-50 p-4 text-sm text-green-600 border border-green-200">
              {flash.success}
            </div>
          )}

          {!farm && !isCreating ? (
            // Empty State
            <div className="text-center py-20 bg-white-tandur rounded-2xl shadow-sm border border-gray-100">
              <div className="mx-auto h-24 w-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                {/* Icon */}
                <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
              </div>
              <h3 className="mt-2 text-xl font-bold text-gray-900">Belum Ada Sawah</h3>
              <p className="mt-1 text-gray-500 max-w-sm mx-auto">
                Anda perlu menambahkan sawah terlebih dahulu.
              </p>
              <div className="mt-6">
                <PrimaryButton onClick={() => setIsCreating(true)}>
                  + Tambah Sawah
                </PrimaryButton>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-8 pb-20">
              {/* Section 1: Info (FarmInfoForm) */}
              <div className="bg-white-tandur rounded-xl">
                <FarmInfoForm
                  farm={farmData}
                  cropTypes={cropTypes}
                  onSubmit={handleFarmSubmit}
                  disabled={farm?.has_active_period}
                />
                {isCreating && (
                  <button onClick={() => setIsCreating(false)} className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline">
                    Batal
                  </button>
                )}
              </div>

              {!isCreating && farm && (
                <>
                  {/* Section 2: Plots */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-dark-tandur">Pembagian Petak Lahan</h3>
                      <button onClick={openAddPlot} className="text-sm font-bold text-main hover:underline">+ Tambah Petak</button>
                    </div>
                    {farm.plots && farm.plots.length > 0 ? (
                      <div className="flex flex-col gap-3">
                        {farm.plots.map((plot) => (
                          <FarmPlotItem
                            key={plot.id}
                            name={plot.name}
                            area={plot.area_ha.toString()}
                            activityCount={plot.activities_count}
                            onEdit={() => openEditPlot(plot)}
                            onDelete={() => confirmDeletePlot(plot)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300 transform transition-all">
                        <p className="text-gray-500 text-sm">Belum ada petak lahan. Silakan tambah petak baru.</p>
                      </div>
                    )}
                  </div>

                  {/* Section 3: Users */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-dark-tandur">Akses Pengguna</h3>
                      <button onClick={openAddUser} className="text-sm font-bold text-main hover:underline">+ Tambah Pengguna</button>
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-white-tandur p-4 shadow-sm">
                      <div className="flex flex-col">
                        {farm.users && farm.users.length > 0 ? (
                          farm.users.map((user) => (
                            <FarmUserAccessItem
                              key={user.id}
                              userName={user.name}
                              role={user.pivot.role}
                              isCurrentUser={user.id === auth.user.id}
                              onEdit={() => openEditUser(user)}
                              onRemove={() => confirmRemoveUser(user)}
                            />
                          ))
                        ) : (
                          <div className="py-8 text-center bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                            <p className="text-gray-500 text-sm">Belum ada pengguna lain yang bisa mengakses.</p>
                            <button
                              onClick={openAddUser}
                              className="mt-2 text-main font-bold text-sm hover:underline"
                            >
                              Tambah Pengguna?
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Danger Zone */}
                  <DangerZone
                    onArchive={() => setIsArchiveModalOpen(true)}
                    onDelete={() => setIsDeleteFarmModalOpen(true)}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* --- Modals --- */}

      {/* 1. Plot Modal */}
      <TandurModal
        show={isPlotModalOpen}
        onClose={() => setIsPlotModalOpen(false)}
        title={editingPlot ? 'Edit Petak Lahan' : 'Tambah Petak Lahan'}
        footer={
          <>
            <SecondaryButton className="w-full sm:w-auto" onClick={() => setIsPlotModalOpen(false)}>Batal</SecondaryButton>
            <PrimaryButton
              className="w-full sm:w-auto"
              onClick={submitPlot}
              disabled={plotProcessing || (farm ? ((farm.plots?.reduce((a, b) => a + Number(b.area_ha), 0) || 0) + parseFloat(plotData.area_ha || '0') - (editingPlot ? Number(editingPlot.area_ha) : 0) > Number(farm.area_ha)) : false)}
            >
              {editingPlot ? 'Simpan' : 'Tambah'}
            </PrimaryButton>
          </>
        }
      >
        <form onSubmit={submitPlot} className="space-y-4">
          <div className="mb-4">
            <InputLabel htmlFor="name" value="Nama Petak" />
            <TextInput
              id="name"
              value={plotData.name}
              onChange={(e) => setPlotData('name', e.target.value)}
              className="mt-1 block w-full"
              placeholder="Contoh: Petak A1"
              autoFocus // Focus on open
            />
            <InputError message={plotErrors.name} className="mt-2" />
          </div>
          <div className="mb-6">
            <InputLabel htmlFor="area_ha" value="Luas (Ha)" />
            <div className="relative">
              <TextInput
                id="area_ha"
                type="number"
                step="0.01"
                value={plotData.area_ha}
                onChange={(e) => setPlotData('area_ha', e.target.value)}
                className="mt-1 block w-full"
                placeholder="0.00"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">Ha</span>
              </div>
            </div>
            <InputError message={plotErrors.area_ha} className="mt-2" />

            {/* Area Validation Info */}
            {farm && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm border border-gray-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-500">Total Luas Sawah:</span>
                  <span className="font-bold text-gray-700">{farm.area_ha} Ha</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Sisa Lahan:</span>
                  <span className={`font-bold ${(farm.area_ha - (farm.plots?.reduce((a, b) => a + Number(b.area_ha), 0) || 0) + (editingPlot ? Number(editingPlot.area_ha) : 0) - parseFloat(plotData.area_ha || '0')) < 0
                    ? 'text-red-600'
                    : 'text-green-600'
                    }`}>
                    {(Number(farm.area_ha) - (farm.plots?.reduce((a, b) => a + Number(b.area_ha), 0) || 0)).toFixed(2)} Ha
                  </span>
                </div>
                {/* Show validation warning if negative */}
                {(farm.area_ha - (farm.plots?.reduce((a, b) => a + Number(b.area_ha), 0) || 0) + (editingPlot ? Number(editingPlot.area_ha) : 0) - parseFloat(plotData.area_ha || '0')) < 0 && (
                  <div className="mt-2 text-xs text-red-500">
                    Total luas petak melebihi luas sawah!
                  </div>
                )}
              </div>
            )}
          </div>
        </form>
      </TandurModal>

      {/* 2. Add User Modal */}
      <AddUserToFarmModal
        show={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        farmId={farm?.id || 0}
        potentialUsers={potentialUsers || []}
      />

      {/* Edit User Modal */}
      {editingUser && (
        <EditFarmUserModal
          show={!!editingUser}
          onClose={() => setEditingUser(null)}
          farmId={farm?.id || 0}
          user={editingUser}
        />
      )}

      {/* 3. Delete Plot Confirmation */}
      <Modal show={isDeletePlotModalOpen} onClose={() => setIsDeletePlotModalOpen(false)}>
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900">Hapus Petak Lahan?</h2>
          <p className="mt-1 text-sm text-gray-600">
            Apakah Anda yakin ingin menghapus petak "<strong>{plotToDelete?.name}</strong>"? Data yang dihapus tidak dapat dikembalikan.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <SecondaryButton onClick={() => setIsDeletePlotModalOpen(false)}>Batal</SecondaryButton>
            <DangerButton onClick={handleDeletePlot}>Hapus</DangerButton>
          </div>
        </div>
      </Modal>

      {/* 4. Remove User Confirmation */}
      <Modal show={isRemoveUserModalOpen} onClose={() => setIsRemoveUserModalOpen(false)}>
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900">Cabut Akses Pengguna?</h2>
          <p className="mt-1 text-sm text-gray-600">
            Apakah Anda yakin ingin mencabut akses "<strong>{userToRemove?.name}</strong>"?
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <SecondaryButton onClick={() => setIsRemoveUserModalOpen(false)}>Batal</SecondaryButton>
            <DangerButton onClick={handleRemoveUser}>Cabut Akses</DangerButton>
          </div>
        </div>
      </Modal>

      {/* 5. Archive Farm Confirmation */}
      <Modal show={isArchiveModalOpen} onClose={() => setIsArchiveModalOpen(false)}>
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900">Arsipkan Sawah?</h2>
          <p className="mt-1 text-sm text-gray-600">
            Sawah ini akan disembunyikan dari daftar aktif Anda. Anda dapat mengaksesnya kembali melalui menu Arsip.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <SecondaryButton onClick={() => setIsArchiveModalOpen(false)}>Batal</SecondaryButton>
            <button onClick={handleArchive} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 shadow-sm transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25">
              Arsipkan
            </button>
          </div>
        </div>
      </Modal>

      {/* 6. Delete Farm Confirmation */}
      <Modal show={isDeleteFarmModalOpen} onClose={() => setIsDeleteFarmModalOpen(false)}>
        <form onSubmit={submitDeleteFarm} className="p-6">
          <h2 className="text-lg font-medium text-danger">Hapus Sawah Permanen?</h2>
          <p className="mt-1 text-sm text-gray-600">
            Tindakan ini tidak dapat dibatalkan. Semua data terkait sawah ini (petak, aktivitas, keuangan, dll) akan dihapus permanen.
          </p>
          <div className="mt-4">
            <InputLabel htmlFor="confirm_name" value={`Ketik "${farm?.name}" untuk konfirmasi`} />
            <TextInput
              id="confirm_name"
              value={deleteFarmData.confirmationName}
              onChange={(e) => setDeleteFarmData('confirmationName', e.target.value)}
              className="mt-1 block w-full"
              placeholder={farm?.name}
            />
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <SecondaryButton onClick={() => setIsDeleteFarmModalOpen(false)}>Batal</SecondaryButton>
            <DangerButton disabled={deleteFarmProcessing || deleteFarmData.confirmationName !== farm?.name}>
              Hapus Permanen
            </DangerButton>
          </div>
        </form>
      </Modal>

    </AuthenticatedLayout>
  );
}
