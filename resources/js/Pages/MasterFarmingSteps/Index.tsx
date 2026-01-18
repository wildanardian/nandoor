import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import TandurModal from '@/Components/TandurModal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';

// DnD Imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TandurSelect from '@/Components/TandurSelect';

interface MasterFarmingStep {
  id: number;
  name: string;
  crop_type_id: number | null; // Updated from plant_type_id
  step_order: number;
  description: string | null;
  is_active: boolean;
}

interface CropType {
  id: number;
  name: string;
  slug: string;
}

interface PageProps {
  auth: any;
  steps: Record<string, MasterFarmingStep[]>;
  cropTypes: CropType[]; // Updated from plantTypes
  flash?: {
    success?: string;
  };
}

// Sortable Item Component
function SortableStepItem({ step, openEditModal, confirmDisable }: { step: MasterFarmingStep, openEditModal: any, confirmDisable: any }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: step.id,
    disabled: !step.is_active, // Disable drag for inactive items
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto',
    position: isDragging ? 'relative' as const : undefined,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`${!step.is_active ? 'bg-gray-50 opacity-60' : 'bg-white-tandur'}`}
    >
      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 font-bold">
        {/* Drag Handle for active items */}
        <div className="flex items-center gap-2">
          {step.is_active && (
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab text-gray-400 hover:text-gray-600"
              title="Drag to reorder"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </div>
          )}
          <span>{step.step_order}</span>
        </div>
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
        {step.name}
      </td>
      <td className="whitespace-normal px-6 py-4 text-sm text-gray-500 max-w-xs">
        {step.description || '-'}
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-sm">
        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${step.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {step.is_active ? 'Aktif' : 'Nonaktif'}
        </span>
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
        <button
          onClick={() => openEditModal(step)}
          className="text-indigo-600 hover:text-indigo-900 mr-4"
        >
          Edit
        </button>
        {step.is_active && (
          <button
            onClick={() => confirmDisable(step)}
            className="text-red-600 hover:text-red-900"
          >
            Nonaktifkan
          </button>
        )}
      </td>
    </tr>
  );
}

export default function Index({ auth, steps, cropTypes, flash }: PageProps) {
  const [activeTab, setActiveTab] = useState<string>('umum');
  const [confirmingDeletion, setConfirmingDeletion] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [stepToDelete, setStepToDelete] = useState<MasterFarmingStep | null>(null);

  // Local state for sorted items
  const [currentSteps, setCurrentSteps] = useState<MasterFarmingStep[]>([]);

  // Update local state when prop changes or tab changes
  useEffect(() => {
    setCurrentSteps(steps[activeTab] || []);
  }, [steps, activeTab]);

  // Form handling
  const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
    id: 0,
    name: '',
    crop_type_id: null as number | null, // Updated
    step_order: 1,
    description: '',
    is_active: true,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setCurrentSteps((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);

        // Optimistic UI Update done. Now sync with backend.
        const orderedIds = newItems.map(item => item.id);

        // Determine crop_type_id for the current tab
        const currentCropType = cropTypes.find(t => t.slug === activeTab);
        const cropTypeId = currentCropType ? currentCropType.id : null;

        router.post(route('master-farming-steps.reorder'), {
          crop_type_id: cropTypeId,
          ordered_ids: orderedIds,
        }, {
          preserveScroll: true,
          onSuccess: () => { },
          onError: () => {
            alert('Gagal menyimpan urutan.');
            setCurrentSteps(items); // Revert
          }
        });

        return newItems;
      });
    }
  };


  const openCreateModal = () => {
    setIsEdit(false);
    reset();
    clearErrors();
    // Set default order: max order + 1 for current tab
    const maxOrder = currentSteps.length > 0 ? Math.max(...currentSteps.map(s => s.step_order)) : 0;

    const currentCropType = cropTypes.find(t => t.slug === activeTab);
    const cropTypeId = currentCropType ? currentCropType.id : null;

    setData({
      id: 0,
      name: '',
      crop_type_id: cropTypeId,
      step_order: maxOrder + 1,
      description: '',
      is_active: true,
    });
    setShowModal(true);
  };

  const openEditModal = (step: MasterFarmingStep) => {
    setIsEdit(true);
    clearErrors();
    setData({
      id: step.id,
      name: step.name,
      crop_type_id: step.crop_type_id,
      step_order: step.step_order,
      description: step.description || '',
      is_active: step.is_active,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    reset();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      put(route('master-farming-steps.update', data.id), {
        onSuccess: () => closeModal(),
      });
    } else {
      post(route('master-farming-steps.store'), {
        onSuccess: () => closeModal(),
      });
    }
  };

  const confirmDisable = (step: MasterFarmingStep) => {
    setStepToDelete(step);
    setConfirmingDeletion(true);
  };

  const disableStep = () => {
    if (stepToDelete) {
      destroy(route('master-farming-steps.destroy', stepToDelete.id), {
        preserveScroll: true,
        onSuccess: () => {
          setConfirmingDeletion(false);
          setStepToDelete(null);
        },
      });
    }
  };

  // Tabs list
  const tabs = ['umum', ...cropTypes.map(pt => pt.slug)];

  return (
    <AuthenticatedLayout
      header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Master Tahapan Pertanian</h2>}
    >
      <Head title="Master Tahapan Pertanian" />

      <div className="py-12">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">

          {/* Flash Message */}
          {flash?.success && (
            <div className="mb-4 rounded-md bg-green-50 p-4 text-sm text-green-600">
              {flash.success}
            </div>
          )}

          <div className="overflow-hidden bg-white-tandur shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Daftar Tahapan</h3>
                  <p className="text-sm text-gray-500">
                    Kelola urutan tahapan untuk jenis tanaman: <span className="capitalize font-bold">{activeTab}</span>
                  </p>
                </div>
                <PrimaryButton onClick={openCreateModal}>
                  + Tambah Tahapan
                </PrimaryButton>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 mb-6 overflow-x-auto">
                <div className="flex space-x-8">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`
                                                whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium capitalize
                                                ${activeTab === tab
                          ? 'border-main text-main'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}
                                            `}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Urutan
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Nama Tahapan
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Deskripsi
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Status
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white-tandur">
                      {currentSteps.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                            Belum ada data tahapan untuk tanaman <span className="capitalize">{activeTab}</span>.
                          </td>
                        </tr>
                      ) : (
                        <SortableContext
                          items={currentSteps.map(s => s.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {currentSteps.map((step) => (
                            <SortableStepItem
                              key={step.id}
                              step={step}
                              openEditModal={openEditModal}
                              confirmDisable={confirmDisable}
                            />
                          ))}
                        </SortableContext>
                      )}
                    </tbody>
                  </table>
                </DndContext>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <TandurModal
        show={showModal}
        onClose={closeModal}
        title={isEdit ? 'Edit Tahapan' : 'Tambah Tahapan Baru'}
        footer={
          <>
            <SecondaryButton className="w-full sm:w-auto" onClick={closeModal}>Batal</SecondaryButton>
            <PrimaryButton className="w-full sm:w-auto" form="master-step-form" disabled={processing}>
              {isEdit ? 'Simpan Perubahan' : 'Buat Tahapan'}
            </PrimaryButton>
          </>
        }
      >
        <form id="master-step-form" onSubmit={submit} className="space-y-6">
          <div>
            <InputLabel htmlFor="name" value="Nama Tahapan" />
            <TextInput
              id="name"
              type="text"
              name="name"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
              className="mt-1 block w-full"
              isFocused
              placeholder="Contoh: Pemupukan Awal"
            />
            <InputError message={errors.name} className="mt-2" />
          </div>
          <div>
            <InputLabel htmlFor="crop_type_id" value="Jenis Tanaman" />
            <TandurSelect
              label=""
              options={[
                { label: 'Umum', value: '' },
                ...cropTypes.map(pt => ({ label: pt.name, value: pt.id }))
              ]}
              value={data.crop_type_id || ''}
              onChange={(val) => setData('crop_type_id', val ? parseInt(val) : null)}
              className="mt-1"
              disabled={isEdit}
            />
            {/* Display validation error for crop_type if backend returns it */}
            <InputError message={errors.crop_type_id} className="mt-2" />
          </div>

          <div>
            <InputLabel htmlFor="step_order" value="Urutan Step" />
            <TextInput
              id="step_order"
              type="number"
              name="step_order"
              value={data.step_order.toString()}
              onChange={(e) => setData('step_order', parseInt(e.target.value))}
              className="mt-1 block w-full"
            />
            <p className="text-xs text-gray-500 mt-1">Urutan harus unik untuk jenis tanaman yang sama.</p>
            <InputError message={errors.step_order} className="mt-2" />
          </div>

          <div>
            <InputLabel htmlFor="description" value="Deskripsi (Opsional)" />
            <textarea
              id="description"
              name="description"
              value={data.description}
              onChange={(e) => setData('description', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-main focus:ring-main sm:text-sm"
              rows={3}
            />
            <InputError message={errors.description} className="mt-2" />
          </div>

          {isEdit && (
            <div className="flex items-center">
              <input
                id="is_active"
                type="checkbox"
                checked={data.is_active}
                onChange={(e) => setData('is_active', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-main focus:ring-main"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                Aktif
              </label>
            </div>
          )}
        </form>
      </TandurModal>

      {/* Disable Confirmation Modal */}
      <TandurModal
        show={confirmingDeletion}
        onClose={() => setConfirmingDeletion(false)}
        title="Konfirmasi Nonaktifkan"
        footer={
          <>
            <SecondaryButton className="w-full sm:w-auto" onClick={() => setConfirmingDeletion(false)}>
              Batal
            </SecondaryButton>
            <DangerButton className="w-full sm:w-auto rounded-full justify-center capitalize" onClick={disableStep} disabled={processing}>
              Nonaktifkan
            </DangerButton>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Apakah Anda yakin ingin menonaktifkan tahapan ini? Tahapan "{stepToDelete?.name}" akan dinonaktifkan tetapi tidak dihapus. Anda bisa mengaktifkannya kembali melalui menu Edit.
        </p>
      </TandurModal>

    </AuthenticatedLayout>
  );
}
