import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import StepInfoCard from '@/Components/StepInfoCard';
import StepExpenseItem from '@/Components/StepExpenseItem';
import StepWorkerItem from '@/Components/StepWorkerItem';
import ActivityTimeline from '@/Components/ActivityTimeline';
import SectionCard from '@/Components/SectionCard';
import Breadcrumb from '@/Components/Breadcrumb';
import TandurSelect from '@/Components/TandurSelect';
import TandurDatePicker from '@/Components/TandurDatePicker';
import TandurCurrencyInput from '@/Components/TandurCurrencyInput';
import { parseISO, format } from 'date-fns';

import { router } from '@inertiajs/react';

interface Props {
  step: {
    id: number;
    name: string;
    step_order: number;
    status: 'draft' | 'in_progress' | 'finished' | 'locked';
    started_at: string | null;
    finished_at: string | null;
    farm_activity_id: number;
    // New props from Controller
    is_active: boolean; // keep for legacy if used, or remove if obsoleted by status
    is_editable: boolean;
    is_locked: boolean;
    unpaid_kasbon_count: number;
  };
  logs: any[]; // Add logs prop
  farmName: string;
  cropType: string;
  expenses: any[];
  payments: any[]; // Add payments
  workers: any[];
  stats: {
    total_expense: number;
    total_kasbon: number;
    total_paid: number;
  };
  placeholders: {
    plots: any[];
    workers: any[];
  };
}

import { useState, useEffect } from 'react';
import TandurModal from '@/Components/TandurModal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { useForm } from '@inertiajs/react';

export default function Detail({ step, farmName, cropType, expenses, payments, workers, stats, placeholders, logs }: Props) {
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showWorkerModal, setShowWorkerModal] = useState(false);
  const [showKasbonModal, setShowKasbonModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState<number | null>(null);

  // Expense Form
  const expenseForm = useForm({
    farm_activity_id: step.farm_activity_id,
    type: 'fertilizer',
    description: '',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
  });

  // Worker Form
  const workerForm = useForm({
    farm_activity_id: step.farm_activity_id,
    worker_id: '',
    farm_plot_id: '',
    assigned_at: new Date().toISOString().split('T')[0],
  });

  // Kasbon Form
  const kasbonForm = useForm({
    farm_activity_id: step.farm_activity_id, // Important for context
    worker_id: '',
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Payment Form
  const paymentForm = useForm({
    farm_activity_id: step.farm_activity_id,
    worker_id: '',
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const submitExpense = (e: React.FormEvent) => {
    e.preventDefault();
    expenseForm.post(route('expenses.store'), {
      onSuccess: () => { expenseForm.reset(); setShowExpenseModal(false); }
    });
  };

  const submitWorker = (e: React.FormEvent) => {
    e.preventDefault();
    workerForm.post(route('worker-assignments.store'), {
      onSuccess: () => { workerForm.reset(); setShowWorkerModal(false); }
    });
  };

  const submitKasbon = (e: React.FormEvent) => {
    e.preventDefault();
    kasbonForm.transform((data) => ({ ...data, worker_id: selectedWorkerId }));
    kasbonForm.post(route('workers.store-kasbon'), {
      onSuccess: () => { kasbonForm.reset(); setShowKasbonModal(false); }
    });
  };

  const submitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    paymentForm.transform((data) => ({
      ...data,
      worker_id: selectedWorkerId,
      amount_to_pay: data.amount // Map amount to amount_to_pay for backend
    }));
    paymentForm.post(route('workers.store-settlement'), {
      onSuccess: () => { paymentForm.reset(); setShowPaymentModal(false); }
    });
  };

  const handleStatusChange = (newStatus: 'active' | 'done') => {
    // Legacy support or simplified trigger
    if (newStatus === 'active') { // "Mulai"
      if (confirm('Mulai tahapan ini?')) router.post(route('farming-steps.start', step.id));
    } else { // "Selesai"
      if (confirm('Selesaikan tahapan ini?')) router.post(route('farming-steps.complete', step.id));
    }
  };

  const handleLock = () => {
    if (step.unpaid_kasbon_count > 0) {
      alert(`Tidak dapat mengunci tahap ini karena masih ada ${step.unpaid_kasbon_count} pekerja dengan kasbon belum lunas.`);
      return;
    }
    if (confirm('Kunci tahapan ini secara permanen? Data tidak akan bisa diubah lagi.')) {
      router.post(route('farming-steps.lock', step.id));
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };



  const breadcrumbs = [
    { label: 'Dashboard', href: route('dashboard') },
    { label: 'Tahapan Pertanian', href: route('farming-steps.index') },
    { label: step.name },
  ];

  // Merge structured logs with derived one for legacy data if needed.
  // Prioritize real logs.
  const activities = [
    // Real Logs
    ...(logs || []).map((l: any) => ({
      id: `log-${l.id}`,
      date: formatDate(l.date), // Format log date
      type: l.action === 'finished' || l.action === 'locked' ? 'finish' : (l.action === 'started' ? 'start' : 'info'),
      description: `${l.description} (${l.actor})`
    })),
    // Fallback/Legacy Derived (Optional, maybe keep separate or merge)
    // If we rely purely on new logs, old history is empty. Let's keep derived for now but deduplicate if we get smarter.
    // Simplifying: Just show Logs if available. If logs are empty (old step), show derived.
    // Or just mix them? 
    // Let's stick to the previous implementation of derived activities for "richer" detail on expenses/workers
    // AND add generic system logs.
    ...(expenses.map(e => ({ id: `exp-${e.id}`, date: formatDate(e.date), type: 'expense' as const, description: `${e.category}: ${e.description}` }))),
    ...(workers.map(w => ({ id: `work-${w.id}`, date: formatDate(w.assigned_at), type: 'worker' as const, description: `${w.name} ditugaskan` }))),
    ...(payments || []).map(p => ({
      id: `pay-${p.id}`,
      date: formatDate(p.date),
      type: p.type === 'kasbon' ? 'expense' : 'finish', // Use expense icon for kasbon (orange), check icon for payment (green) ?? Or maybe 'info' for payment? 'finish' is green check.
      // Better: reuse mapped types if ActivityTimeline supports them.
      // ActivityTimeline supports: start, finish, expense, worker, info.
      // Kasbon -> expense (yellow/orange). Bayar -> finish (green)? Or maybe add new types to ActivityTimeline later?
      // For now, let's map: Kasbon -> expense (Yellow), Bayar -> finish (Green) or create new types?
      // Let's use 'expense' for Kasbon (money out/debt) and 'finish' for Payment (settlement/done).
      // Actually, 'expense' is yellow. 'finish' is green. 
      description: p.type === 'kasbon'
        ? `${p.worker_name} Kasbon: ${formatCurrency(p.amount)}`
        : `Pembayaran ke ${p.worker_name}: ${formatCurrency(p.amount)}`
    })),
  ];

  // Sort activities by date descending (newest first)
  // Assuming dates are formatted strings, sorting might be tricky.
  // Ideally, use raw date objects to sort then map. 
  // Given the current setup, we append. The timeline likely renders top-down.
  // Current implementation in Detail.tsx just spreads them.
  // The user didn't ask for sorting fix, but let's at least keep structure valid.


  return (
    <AuthenticatedLayout
      header={
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold leading-tight text-dark-tandur">
                Detail Tahapan
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{farmName}</span>
                <span>•</span>
                <span className="font-medium text-main">{cropType}</span>
              </div>
            </div>
            {/* Lock Button (Top Right) */}
            {step.status === 'finished' && !step.is_locked && (
              <button
                onClick={handleLock}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition flex items-center gap-2 text-sm font-bold shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
                </svg>
                Kunci Tahapan
              </button>
            )}
            {step.is_locked && (
              <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded border border-gray-200 text-sm font-bold flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
                </svg>
                Terkunci
              </span>
            )}
          </div>
        </div>
      }
    >
      <Head title={`Detail Step - ${step.name}`} />

      <div className="flex flex-col gap-8 pb-20">
        <div className="px-1">
          <Breadcrumb items={breadcrumbs} />
        </div>

        {step.is_locked && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
            <span className="text-xl">🔒</span>
            <div>
              <span className="font-bold">Tahapan ini telah dikunci.</span>
              <p className="mt-1">Data bersifat read-only. Anda tidak dapat menambah biaya, menugaskan pekerja, atau mengubah status.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column: Info & Activities */}
          <div className="flex flex-col gap-8 lg:col-span-2">
            {/* Section 1: Info */}
            <StepInfoCard
              step={{
                name: step.name,
                order: step.step_order,
                status: step.status === 'in_progress' ? 'active' : (step.status === 'finished' || step.status === 'locked' ? 'done' : 'pending'), // Map to component expected types
                startDate: step.started_at ? formatDate(step.started_at) : '-',
                endDate: step.finished_at ? formatDate(step.finished_at) : '-',
                notes: undefined
              }}
              onStatusChange={handleStatusChange}
              // We might need to disable action buttons in StepInfoCard if locked
              isLocked={step.is_locked}
            />

            {/* Section 2: Expenses */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-dark-tandur">Rincian Biaya</h3>
                <button
                  disabled={!step.is_editable}
                  onClick={() => setShowExpenseModal(true)}
                  title={!step.is_editable ? 'Tahapan dikunci atau belum dimulai' : ''}
                  className={`text-sm font-bold ${step.is_editable ? 'text-main hover:underline' : 'text-gray-400 cursor-not-allowed'}`}
                >
                  + Tambah Biaya
                </button>
              </div>

              {expenses.length === 0 ? (
                <div className="text-center p-6 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 text-sm">
                  Belum ada biaya tercatat.
                </div>
              ) : (
                <div className="rounded-xl border border-gray-100 bg-white-tandur p-4 shadow-sm">
                  <div className="flex flex-col">
                    {expenses.map((expense) => (
                      <StepExpenseItem
                        key={expense.id}
                        date={formatDate(expense.date)}
                        category={expense.category}
                        description={expense.description}
                        amount={formatCurrency(expense.amount)}
                      />
                    ))}
                  </div>
                  <div className="mt-4 flex justify-between border-t border-dashed border-gray-200 pt-4">
                    <span className="font-medium text-gray-500">Total Biaya</span>
                    <span className="font-bold text-danger">{formatCurrency(stats.total_expense)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Section 3: Workers */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-dark-tandur">Pekerja Bertugas</h3>
                <button
                  disabled={!step.is_editable}
                  onClick={() => setShowWorkerModal(true)}
                  title={!step.is_editable ? 'Tahapan dikunci atau belum dimulai' : ''}
                  className={`text-sm font-bold ${step.is_editable ? 'text-main hover:underline' : 'text-gray-400 cursor-not-allowed'}`}
                >
                  + Tugaskan
                </button>
              </div>

              {workers.length === 0 ? (
                <div className="text-center p-6 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 text-sm">
                  Belum ada pekerja ditugaskan.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {workers.map((worker) => (
                    <StepWorkerItem
                      key={worker.id}
                      workerName={worker.name}
                      plotName={worker.plot_name}
                      kasbonAmount={formatCurrency(worker.kasbon_current)}
                      paymentStatus={worker.kasbon_current > 0 ? 'partial' : 'paid'} // Logic placeholder
                      onKasbon={() => { setSelectedWorkerId(worker.worker_id); setShowKasbonModal(true); }}
                      onPay={() => { setSelectedWorkerId(worker.worker_id); setShowPaymentModal(true); }}
                      // Disable buttons if locked? User: "All transactions MUST remain possible even if step status = finished". "Disabled only if locked".
                      disabled={step.is_locked}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Timeline (Sticky) */}
          <div className="lg:h-fit lg:sticky lg:top-4">
            <SectionCard title="Riwayat Aktivitas" className="p-5">
              {activities.length > 0 ? (
                <ActivityTimeline activities={activities as any} />
              ) : (
                <p className="text-sm text-gray-400 italic">Belum ada aktivitas.</p>
              )}
            </SectionCard>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {/* 1. Expense Modal */}
      {/* 1. Expense Modal */}
      <TandurModal
        show={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        title="Catat Biaya Baru"
        footer={
          <>
            <SecondaryButton className="w-full sm:w-auto" onClick={() => setShowExpenseModal(false)}>Batal</SecondaryButton>
            <PrimaryButton className="w-full sm:w-auto" form="expense-form" disabled={expenseForm.processing}>Simpan</PrimaryButton>
          </>
        }
      >
        <form id="expense-form" onSubmit={submitExpense} className="space-y-4">
          <div>
            <InputLabel htmlFor="expense_date" value="Tanggal Pengeluaran" />
            <TandurDatePicker
              value={expenseForm.data.expense_date ? parseISO(expenseForm.data.expense_date) : null}
              onChange={(date) => expenseForm.setData('expense_date', date ? format(date, 'yyyy-MM-dd') : '')}
              className="mt-1"
            />
          </div>
          <TandurSelect
            label="Kategori"
            options={[
              { label: "Pupuk", value: "fertilizer" },
              { label: "Obat-obatan", value: "chemical" },
              { label: "Tenaga Kerja", value: "labor" },
              { label: "Alat", value: "tool" },
              { label: "Lainnya", value: "other" },
            ]}
            value={expenseForm.data.type}
            onChange={(val) => expenseForm.setData('type', val)}
            className="mt-1"
          />

          <div>
            <InputLabel htmlFor="description" value="Keterangan" />
            <TextInput
              id="description"
              type="text"
              className="mt-1 block w-full"
              value={expenseForm.data.description}
              onChange={(e) => expenseForm.setData('description', e.target.value)}
              required
            />
          </div>
          <div>
            <TandurCurrencyInput
              label="Nominal"
              value={expenseForm.data.amount}
              onChange={(val) => expenseForm.setData('amount', val ? val.toString() : '')}
              autoFocus
            />
          </div>
        </form>
      </TandurModal>

      {/* 2. Worker Assignment Modal */}
      <TandurModal
        show={showWorkerModal}
        onClose={() => setShowWorkerModal(false)}
        title="Tugaskan Pekerja"
        footer={
          <>
            <SecondaryButton className="w-full sm:w-auto" onClick={() => setShowWorkerModal(false)}>Batal</SecondaryButton>
            <PrimaryButton className="w-full sm:w-auto" form="worker-form" disabled={workerForm.processing}>Simpan</PrimaryButton>
          </>
        }
      >
        <form id="worker-form" onSubmit={submitWorker} className="space-y-4">
          <div>
            <InputLabel htmlFor="assigned_at" value="Tanggal Tugas" />
            <TandurDatePicker
              value={workerForm.data.assigned_at ? parseISO(workerForm.data.assigned_at) : null}
              onChange={(date) => workerForm.setData('assigned_at', date ? format(date, 'yyyy-MM-dd') : '')}
              className="mt-1"
            />
          </div>
          <div>
            <TandurSelect
              label="Pilih Pekerja"
              placeholder="-- Pilih Pekerja --"
              options={placeholders.workers.map((w: any) => ({ label: w.name, value: w.id }))}
              value={workerForm.data.worker_id}
              onChange={(val) => workerForm.setData('worker_id', val)}
              className="mt-1"
              searchable
            />
          </div>
          <div>
            <TandurSelect
              label="Pilih Petak"
              placeholder="-- Pilih Petak --"
              options={placeholders.plots.map((p: any) => ({ label: p.name, value: p.id }))}
              value={workerForm.data.farm_plot_id}
              onChange={(val) => workerForm.setData('farm_plot_id', val)}
              className="mt-1"
              searchable
            />
          </div>
        </form>
      </TandurModal>

      {/* 3. Kasbon Modal */}
      <TandurModal
        show={showKasbonModal}
        onClose={() => setShowKasbonModal(false)}
        title="Catat Kasbon"
        footer={
          <>
            <SecondaryButton className="w-full sm:w-auto" onClick={() => setShowKasbonModal(false)}>Batal</SecondaryButton>
            <PrimaryButton className="w-full sm:w-auto" form="kasbon-form" disabled={kasbonForm.processing}>Simpan</PrimaryButton>
          </>
        }
      >
        <form id="kasbon-form" onSubmit={submitKasbon} className="space-y-4">
          <div>
            <InputLabel htmlFor="kasbon_date" value="Tanggal Kasbon" />
            <TandurDatePicker
              value={kasbonForm.data.payment_date ? parseISO(kasbonForm.data.payment_date) : null}
              onChange={(date) => kasbonForm.setData('payment_date', date ? format(date, 'yyyy-MM-dd') : '')}
              className="mt-1"
            />
          </div>
          <div>
            <TandurCurrencyInput
              label="Nominal Kasbon"
              value={kasbonForm.data.amount}
              onChange={(val) => kasbonForm.setData('amount', val ? val.toString() : '')}
            />
          </div>
          <div>
            <InputLabel htmlFor="kasbon_note" value="Catatan" />
            <TextInput
              id="kasbon_note"
              type="text"
              className="mt-1 block w-full"
              value={kasbonForm.data.notes}
              onChange={(e) => kasbonForm.setData('notes', e.target.value)}
            />
          </div>
        </form>
      </TandurModal>

      {/* 4. Payment Modal */}
      <TandurModal
        show={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Bayar / Pelunasan"
        footer={
          <>
            <SecondaryButton className="w-full sm:w-auto" onClick={() => setShowPaymentModal(false)}>Batal</SecondaryButton>
            <PrimaryButton className="w-full sm:w-auto" form="payment-form" disabled={paymentForm.processing}>Bayar</PrimaryButton>
          </>
        }
      >
        <div className="mb-4 text-sm text-gray-500">
          Mencatat pembayaran gaji atau pelunasan kasbon untuk pekerja ini.
        </div>
        <form id="payment-form" onSubmit={submitPayment} className="space-y-4">
          <div>
            <InputLabel htmlFor="payment_date" value="Tanggal Pembayaran" />
            <TandurDatePicker
              value={paymentForm.data.payment_date ? parseISO(paymentForm.data.payment_date) : null}
              onChange={(date) => paymentForm.setData('payment_date', date ? format(date, 'yyyy-MM-dd') : '')}
              className="mt-1"
            />
          </div>
          <div>
            <TandurCurrencyInput
              label="Nominal"
              value={paymentForm.data.amount}
              onChange={(val) => paymentForm.setData('amount', val ? val.toString() : '')}
            />
          </div>
          <div>
            <InputLabel htmlFor="payment_note" value="Catatan" />
            <TextInput
              id="payment_note"
              type="text"
              className="mt-1 block w-full"
              value={paymentForm.data.notes}
              onChange={(e) => paymentForm.setData('notes', e.target.value)}
            />
          </div>
        </form>
      </TandurModal>
    </AuthenticatedLayout >
  );
}
