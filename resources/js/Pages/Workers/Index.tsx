import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';
import TandurModal from '@/Components/TandurModal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import TandurSelect from '@/Components/TandurSelect';
import TandurCurrencyInput from '@/Components/TandurCurrencyInput';
import TandurDatePicker from '@/Components/TandurDatePicker';
import { parseISO, format } from 'date-fns';
import axios from 'axios';
import TandurDropdown, { DropdownItem } from '@/Components/TandurDropdown';
import { MoreVertical, Search, Edit, Trash2, Calendar, DollarSign, CheckCircle } from 'lucide-react';

interface Worker {
  id: number;
  name: string;
  phone: string | null;
  is_active: boolean;
  kasbon_open: number;
  wages_pending: number;
}

interface WorkerPayment {
  id: number;
  payment_type: 'kasbon' | 'bayar';
  amount: number;
  amount_paid: number;
  payment_date: string;
  status: 'paid' | 'unpaid';
  worker: { name: string };
}

interface ActivityItem {
  id: number;
  name: string;
}

interface PageProps {
  auth: any;
  workers: Worker[];
  recentTransactions: WorkerPayment[];
  activeActivities: ActivityItem[];
  summary: {
    totalWorkers: number;
    activeWorkers: number;
    totalKasbonActive: number;
    totalPayments: number;
  };
  farmId: number | null;
  flash?: {
    success?: string;
    error?: string;
  };
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const SummaryCard = ({ title, value, type = 'neutral' }: { title: string, value: string | number, type?: 'neutral' | 'warning' | 'danger' }) => {
  let colorClass = "bg-white-tandur border-gray-200";
  let textClass = "text-gray-900";

  if (type === 'warning') textClass = "text-orange-600";
  if (type === 'danger') textClass = "text-red-600";

  return (
    <div className={`p-4 rounded-lg border shadow-sm ${colorClass}`}>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <p className={`text-2xl font-bold ${textClass}`}>{value}</p>
    </div>
  );
};

export default function Index({ auth, workers, recentTransactions, activeActivities, summary, flash }: PageProps) {
  // Modal States
  const [modalState, setModalState] = useState<{
    type: 'create' | 'kasbon' | 'completion' | 'settlement' | 'deactivate' | null,
    worker?: Worker | null
  }>({ type: null, worker: null });

  // Common close handler
  const [activeCreateTab, setActiveCreateTab] = useState<'create' | 'assign'>('assign');
  const [isEdit, setIsEdit] = useState(false); // Track edit mode for worker data

  const closeModal = () => {
    setModalState({ type: null, worker: null });
    reset();
    clearErrors();
    setIsEdit(false); // Reset edit mode on close
    setActiveCreateTab('assign'); // Reset tab to default
    setSelectedAssignWorker(null); // Reset selected worker for assign
  };

  // --- Forms ---
  const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
    // Create/Assign
    name: '',
    phone: '',
    notes: '',
    worker_id: '',
    // Common
    payment_date: new Date().toISOString().split('T')[0],
    amount: '',
    // Completion
    farm_activity_id: '',
    wage: '',
  });

  // Create Modal Specifics
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssignWorker, setSelectedAssignWorker] = useState<any | null>(null);

  // Debounced Search for Assign
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (activeCreateTab === 'assign' && searchQuery.length > 1) {
        axios.get(route('workers.search', { query: searchQuery }))
          .then(res => setSearchResults(res.data))
          .catch(err => console.error(err));
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, activeCreateTab]);

  // Handlers
  const openCreateModal = () => {
    setIsEdit(false);
    reset();
    setActiveCreateTab('assign');
    setModalState({ type: 'create', worker: null });
  }

  const openEditModal = (worker: Worker) => {
    setIsEdit(true);
    reset();
    setActiveCreateTab('create'); // Editing always uses the 'create' tab for input fields
    setData(prev => ({
      ...prev,
      worker_id: worker.id.toString(),
      name: worker.name,
      phone: worker.phone || '',
      notes: '', // Notes not typically edited here or not returned, keep cleared or fetch if needed
    }));
    setModalState({ type: 'create', worker: worker });
  };

  const openDeactivateModal = (worker: Worker) => {
    setModalState({ type: 'deactivate', worker });
  }

  const openKasbonModal = (worker: Worker) => {
    setData(prev => ({
      ...prev,
      worker_id: worker.id.toString(),
      date: new Date().toISOString().split('T')[0],
      amount: '',
      notes: '',
      farm_activity_id: activeActivities.length > 0 ? activeActivities[0].id.toString() : ''
    }));
    setModalState({ type: 'kasbon', worker });
  };


  const openCompletionModal = (worker: Worker) => {
    reset();
    setData(prev => ({
      ...prev,
      worker_id: worker.id.toString(),
      date: new Date().toISOString().split('T')[0],
      farm_activity_id: activeActivities.length > 0 ? activeActivities[0].id.toString() : ''
    }));
    setModalState({ type: 'completion', worker });
  };

  const openSettlementModal = (worker: Worker) => {
    reset();
    // Default to paying off full wage pending, or logic?
    // Default suggest: pending wages amount
    setData(prev => ({
      ...prev,
      worker_id: worker.id.toString(),
      payment_date: new Date().toISOString().split('T')[0],
      farm_activity_id: activeActivities.length > 0 ? activeActivities[0].id.toString() : ''
    }));
    setModalState({ type: 'settlement', worker });
  }


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalState.type === 'create') {
      if (activeCreateTab === 'create' && isEdit && modalState.worker) {
        // Update Mode
        router.put(route('workers.update', modalState.worker.id), data, {
          onSuccess: () => closeModal(),
        });
      } else if (activeCreateTab === 'create') {
        post(route('workers.store'), {
          onSuccess: () => {
            closeModal();
            reset();
          },
        });
      } else {
        // Assign mode
        post(route('workers.store'), {
          onSuccess: () => {
            closeModal();
            reset();
          },
        });
      }
    } else if (modalState.type === 'kasbon') {
      post(route('workers.store-kasbon'), {
        onSuccess: closeModal,
        onError: (err) => console.error("Kasbon Error:", err)
      });
    } else if (modalState.type === 'completion') {
      post(route('workers.store-work-completion'), {
        onSuccess: closeModal,
        onError: (err) => console.error("Completion Error:", err)
      });
    } else if (modalState.type === 'settlement') {
      // Remap amount_to_pay because controller expects it, but useForm shared 'amount' for kasbon
      // Ideally separate forms or map.
      // I used 'amount_to_pay' in useForm init above.
      post(route('workers.store-settlement'), {
        onSuccess: closeModal,
        onError: (err) => console.error("Settlement Error:", err)
      });
    }
  };

  return (
    <AuthenticatedLayout
      header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Manajemen Pekerja</h2>}
    >
      <Head title="Pekerja" />

      <div className="">
        <div className="mx-auto">

          {flash?.success && (
            <div className="mb-4 rounded-md bg-green-50 p-4 text-sm text-green-600">
              {flash.success}
            </div>
          )}

          {/* Section 1: Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <SummaryCard title="Total Pekerja" value={summary.totalWorkers} />
            <SummaryCard title="Pekerja Aktif" value={summary.activeWorkers} />
            <SummaryCard title="Total Kasbon Aktif" value={formatCurrency(summary.totalKasbonActive)} type={summary.totalKasbonActive > 0 ? "warning" : "neutral"} />
            <SummaryCard title="Total Pembayaran" value={formatCurrency(summary.totalPayments)} type="neutral" />
          </div>

          <div className="flex flex-col xl:flex-row gap-6">

            {/* Section 2: Worker List */}
            <div className="flex-1 min-w-0">
              <div className="bg-white-tandur shadow-sm sm:rounded-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Daftar Pekerja</h3>
                  <PrimaryButton onClick={openCreateModal}>+ Tambah Pekerja</PrimaryButton>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Pekerja</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Kasbon Aktif</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Upah Selesai</th>
                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white-tandur">
                      {workers.length === 0 ? (
                        <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">Belum ada data pekerja.</td></tr>
                      ) : (
                        workers.map((worker) => (
                          <tr key={worker.id} className={!worker.is_active ? 'bg-gray-50 opacity-60' : ''}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-main/10 flex items-center justify-center text-main font-bold mr-4">
                                  {worker.name.charAt(0)}
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{worker.name}</div>
                                  <div className="text-xs text-gray-500">{worker.phone}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${worker.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {worker.is_active ? 'Aktif' : 'Nonaktif'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-orange-600">
                              {worker.kasbon_open > 0 ? formatCurrency(worker.kasbon_open) : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                              {worker.wages_pending > 0 ? formatCurrency(worker.wages_pending) : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end gap-2">
                                <TandurDropdown
                                  trigger={
                                    <button className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                                      <MoreVertical className="w-5 h-5" />
                                    </button>
                                  }
                                >
                                  <DropdownItem onClick={() => openKasbonModal(worker)}>
                                    <DollarSign className="mr-2 h-4 w-4" />
                                    Kasbon
                                  </DropdownItem>
                                  <DropdownItem onClick={() => openCompletionModal(worker)}>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Selesai Kerja
                                  </DropdownItem>
                                  <DropdownItem onClick={() => openSettlementModal(worker)}>
                                    <DollarSign className="mr-2 h-4 w-4" />
                                    Bayar / Pelunasan
                                  </DropdownItem>
                                  <div className="h-px bg-gray-100 my-1" />
                                  <DropdownItem onClick={() => openEditModal(worker)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Data
                                  </DropdownItem>
                                  <DropdownItem onClick={() => openDeactivateModal(worker)} className="text-red-600 hover:text-red-700">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Nonaktifkan
                                  </DropdownItem>
                                </TandurDropdown>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Section 3: Recent History */}
            <div className="w-full lg:w-80 flex-shrink-0">
              <div className="bg-white-tandur shadow-sm sm:rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Riwayat Terbaru</h3>
                <ul className="-my-5 divide-y divide-gray-200">
                  {recentTransactions.map(tx => (
                    <li key={tx.id} className="py-4">
                      <div className="flex justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{tx.worker.name}</p>
                          <p className="text-xs text-gray-500">{new Date(tx.payment_date).toLocaleDateString('id-ID')} • {tx.payment_type}</p>
                        </div>
                        <div className={`text-sm font-bold ${tx.payment_type === 'kasbon' ? 'text-orange-600' : 'text-green-600'}`}>
                          {tx.payment_type === 'kasbon' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- UNIVERSAL MODAL --- */}
      <TandurModal
        show={modalState.type !== null && modalState.type !== 'deactivate'}
        onClose={closeModal}
        title={
          modalState.type === 'create' ? (isEdit ? 'Edit Data Pekerja' : 'Kelola Pekerja') :
            modalState.type === 'kasbon' ? `Catat Kasbon: ${modalState.worker?.name}` :
              modalState.type === 'completion' ? `Selesaikan Kerja: ${modalState.worker?.name}` :
                modalState.type === 'settlement' ? `Pembayaran (Settlement): ${modalState.worker?.name}` : ''
        }
        footer={
          <>
            <SecondaryButton className="w-full sm:w-auto" onClick={closeModal}>Batal</SecondaryButton>
            <PrimaryButton className="w-full sm:w-auto" form="worker-action-form" disabled={processing}>
              {modalState.type === 'create' && isEdit ? 'Update' : 'Simpan'}
            </PrimaryButton>
          </>
        }
      >
        <form id="worker-action-form" onSubmit={handleSubmit} className="space-y-4">

          {/* CREATE / ASSIGN CONTENT */}
          {modalState.type === 'create' && (
            <>
              {/* Mode Selection Tab */}
              {!isEdit && (
                <div className="flex p-1 bg-gray-100 rounded-lg mb-4">
                  <button
                    type="button"
                    onClick={() => { setActiveCreateTab('assign'); setSearchResults([]); setSearchQuery(''); }}
                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${activeCreateTab === 'assign' ? 'bg-white text-main shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Pilih Pekerja Terdaftar
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveCreateTab('create')}
                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${activeCreateTab === 'create' ? 'bg-white text-main shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Tambah Pekerja Baru
                  </button>
                </div>
              )}

              {activeCreateTab === 'assign' ? (
                <div>
                  <TandurSelect
                    label="Cari Pekerja"
                    placeholder="Ketik nama worker..."
                    options={searchResults.map(w => ({ label: `${w.name} (${w.phone || '-'})`, value: w.id }))}
                    value={data.worker_id}
                    onChange={(val) => setData('worker_id', val)}
                    searchable={true}
                    onSearch={(query) => {
                      setSearchQuery(query);
                      // Debounce logic is already in useEffect, just updating state here
                    }}
                    error={errors.worker_id}
                  />
                  <p className="text-xs text-gray-500 mt-1">Cari pekerja yang sudah terdaftar di sistem.</p>
                </div>
              ) : (
                <>
                  <div><InputLabel value="Nama" /><TextInput className="w-full mt-1" value={data.name} onChange={e => setData('name', e.target.value)} autoFocus />
                    <InputError message={errors.name} className="mt-2" /></div>
                  <div className="mt-4"><InputLabel value="HP" /><TextInput className="w-full mt-1" value={data.phone} onChange={e => setData('phone', e.target.value)} />
                    <InputError message={errors.phone} className="mt-2" /></div>
                  {isEdit && <div className="mt-4"><InputLabel value="Catatan" /><TextInput className="w-full mt-1" value={data.notes} onChange={e => setData('notes', e.target.value)} /></div>}
                </>
              )}
            </>
          )}

          {/* KASBON CONTENT */}
          {modalState.type === 'kasbon' && (
            <>
              <div>
                <TandurSelect
                  label="Aktivitas (Proyek)"
                  placeholder="-- Pilih Aktivitas --"
                  options={activeActivities.map(act => ({ label: act.name, value: act.id }))}
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
                  value={data.payment_date ? parseISO(data.payment_date) : null}
                  onChange={(date) => setData('payment_date', date ? format(date, 'yyyy-MM-dd') : '')}
                  className="mt-1"
                />
              </div>
              <div>
                <InputLabel value="Catatan" />
                <TextInput className="w-full mt-1" value={data.notes} onChange={e => setData('notes', e.target.value)} />
              </div>
            </>
          )}

          {/* COMPLETION CONTENT */}
          {modalState.type === 'completion' && (
            <>
              <div>
                <TandurSelect
                  label="Aktivitas"
                  placeholder="-- Pilih Aktivitas --"
                  options={activeActivities.map(act => ({ label: act.name, value: act.id }))}
                  value={data.farm_activity_id}
                  onChange={val => setData('farm_activity_id', val)}
                  error={errors.farm_activity_id}
                />
              </div>
              <div>
                <TandurCurrencyInput
                  label="Upah"
                  value={data.wage}
                  onChange={(val) => setData('wage', val ? val.toString() : '')}
                  placeholder="100.000"
                  error={errors.wage}
                />
              </div>
              <div>
                <InputLabel value="Tanggal Selesai" />
                <TandurDatePicker
                  value={data.payment_date ? parseISO(data.payment_date) : null}
                  onChange={(date) => setData('payment_date', date ? format(date, 'yyyy-MM-dd') : '')}
                  className="mt-1"
                />
              </div>
            </>
          )}

          {flash?.error && (
            <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-600">
              {flash.error}
            </div>
          )}

          {/* SETTLEMENT CONTENT */}
          {modalState.type === 'settlement' && (
            (() => {
              // Calculate Settlement Details based on Worker State
              const pendingWages = modalState.worker?.wages_pending || 0;
              const openKasbon = modalState.worker?.kasbon_open || 0;

              const potongKasbon = Math.min(pendingWages, openKasbon);
              const siasaTunai = Math.max(0, pendingWages - openKasbon);
              // Logic: Cash Paid = Wages - Kasbon (saturated at 0)

              return (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2 border border-gray-100">
                    <h4 className="font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-2">Ringkasan Pelunasan</h4>

                    <div className="flex justify-between items-center text-green-700">
                      <span>Total Upah (Belum Dibayar):</span>
                      <span className="font-bold">{formatCurrency(pendingWages)}</span>
                    </div>

                    <div className="flex justify-between items-center text-orange-700">
                      <span>Total Kasbon (Belum Lunas):</span>
                      <span className="font-bold">{formatCurrency(openKasbon)}</span>
                    </div>

                    <hr className="border-gray-200 my-2" />

                    <div className="flex justify-between items-center text-gray-600">
                      <span>Potong Kasbon:</span>
                      <span className="font-bold text-red-600">-{formatCurrency(potongKasbon)}</span>
                    </div>

                    <div className="flex justify-between items-center text-lg pt-1 text-gray-900 font-bold border-t border-gray-200 mt-2">
                      <span>Sisa Dibayar Tunai:</span>
                      <span className="text-green-600">{formatCurrency(siasaTunai)}</span>
                    </div>

                    {pendingWages === 0 && openKasbon > 0 && (
                      <p className="text-xs text-orange-600 italic mt-2">
                        Tidak ada upah pending. Settlement tidak dapat memproses pembayaran hutang tanpa upah.
                      </p>
                    )}
                  </div>

                  <div>
                    <InputLabel value="Tanggal Bayar" />
                    <TandurDatePicker
                      value={data.payment_date ? parseISO(data.payment_date) : null}
                      onChange={(date) => setData('payment_date', date ? format(date, 'yyyy-MM-dd') : '')}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <InputLabel value="Catatan" />
                    <TextInput
                      className="w-full mt-1"
                      value={data.notes}
                      onChange={e => setData('notes', e.target.value)}
                      placeholder="Catatan pelunasan..."
                    />
                  </div>
                </div>
              );
            })()
          )}
        </form>
      </TandurModal>

      {/* Deactivate Confirmation Modal */}
      <TandurModal
        show={modalState.type === 'deactivate'}
        onClose={closeModal}
        title="Konfirmasi Nonaktifkan"
        footer={
          <>
            <SecondaryButton className="w-full sm:w-auto" onClick={closeModal}>Batal</SecondaryButton>
            <button
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-transparent bg-red-600 px-6 py-3 text-sm font-bold capitalize tracking-widest text-white transition duration-150 ease-in-out hover:bg-red-500 active:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              disabled={processing}
              onClick={() => {
                if (modalState.worker) {
                  router.patch(route('workers.deactivate', modalState.worker.id), {}, {
                    onSuccess: () => closeModal(),
                  });
                }
              }}
            >
              Nonaktifkan
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Apakah Anda yakin ingin menonaktifkan pekerja <strong>{modalState.worker?.name}</strong>?
          <br /><br />
          Pekerja yang dinonaktifkan tidak akan muncul di daftar aktif, tetapi riwayat transaksi dan kerjanya tetap tersimpan.
        </p>
      </TandurModal>

    </AuthenticatedLayout >
  );
}
