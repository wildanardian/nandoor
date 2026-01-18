import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import FinanceSummaryCard from '@/Components/FinanceSummaryCard';
import TransactionFilter from '@/Components/TransactionFilter';
import TransactionList from '@/Components/TransactionList';
import TransactionItem from '@/Components/TransactionItem';
import TandurModal from '@/Components/TandurModal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import TandurCurrencyInput from '@/Components/TandurCurrencyInput';
import TandurDatePicker from '@/Components/TandurDatePicker';
import TandurSelect from '@/Components/TandurSelect';
import { format, parseISO } from 'date-fns';
import InputError from '@/Components/InputError';

interface Props {
  auth: any;
  farm: any;
  period: any;
  summary: {
    saldo_kas: number;
    total_expense: number;
    total_income: number;
    net_income: number;
  };
  transactions: any[];
  activeActivities: any[];
  filters: {
    type: string;
  };
}

export default function Index({ auth, farm, period, summary, transactions, activeActivities, filters }: Props) {
  // Filter State
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>(filters.type as any || 'all');

  // Modal State
  const [modalType, setModalType] = useState<'expense' | 'income' | null>(null);

  // Forms
  const expenseForm = useForm({
    description: '',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
    farm_activity_id: '',
    type: 'other',
  });

  const incomeForm = useForm({
    description: '',
    quantity: '',
    price_per_unit: '',
    total_amount: '',
    income_date: new Date().toISOString().split('T')[0],
  });

  // Handle Filter Change
  useEffect(() => {
    if (filterType !== filters.type) {
      router.get(route('finance.index'), { type: filterType }, {
        preserveState: true,
        preserveScroll: true,
        only: ['transactions', 'summary', 'filters'],
      });
    }
  }, [filterType]);

  const closeModal = () => {
    setModalType(null);
    expenseForm.reset();
    incomeForm.reset();
    expenseForm.clearErrors();
    incomeForm.clearErrors();
  };

  const submitExpense = (e: React.FormEvent) => {
    e.preventDefault();
    expenseForm.post(route('finance.store-expense'), {
      onSuccess: () => closeModal(),
    });
  };

  const submitIncome = (e: React.FormEvent) => {
    e.preventDefault();
    incomeForm.post(route('finance.store-income'), {
      onSuccess: () => closeModal(),
    });
  };

  // Auto-calc total income
  useEffect(() => {
    const qty = parseFloat(incomeForm.data.quantity) || 0;
    const price = parseFloat(incomeForm.data.price_per_unit) || 0;
    if (qty && price) {
      incomeForm.setData('total_amount', (qty * price).toString());
    }
  }, [incomeForm.data.quantity, incomeForm.data.price_per_unit]);

  const formatRupiah = (val: number) => `Rp ${new Intl.NumberFormat('id-ID').format(val)}`;

  return (
    <AuthenticatedLayout
      header={
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold leading-tight text-dark-tandur">
                Biaya & Pemasukan
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{farm.name}</span>
                <span>•</span>
                <span className="font-medium text-main">{period ? period.name : 'No Active Period'}</span>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden gap-3 md:flex">
              <button
                onClick={() => setModalType('expense')}
                className="rounded-lg bg-danger px-4 py-2 text-sm font-bold text-white-tandur hover:bg-danger/90"
              >
                + Catat Biaya
              </button>
              <button
                onClick={() => setModalType('income')}
                className="rounded-lg bg-main px-4 py-2 text-sm font-bold text-white-tandur hover:bg-main/90"
              >
                + Catat Pemasukan
              </button>
            </div>
          </div>
        </div>
      }
    >
      <Head title="Biaya & Pemasukan" />

      <div className="flex flex-col gap-8 pb-20">
        {/* Section 1: Summary */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FinanceSummaryCard
            title="Saldo Kas"
            value={formatRupiah(summary.saldo_kas)}
            variant="default"
          />
          <FinanceSummaryCard
            title="Total Pengeluaran"
            value={formatRupiah(summary.total_expense)}
            variant="danger"
            subtitle="Periode ini"
          />
          <FinanceSummaryCard
            title="Total Pemasukan"
            value={formatRupiah(summary.total_income)}
            variant="success"
            subtitle="Periode ini"
          />
          <FinanceSummaryCard
            title="Pendapatan Bersih"
            value={formatRupiah(summary.net_income)}
            variant="default" // Logic for color? Keeping default as per original code for now, maybe add logic later
            subtitle={summary.net_income >= 0 ? "Profit" : "Belum profit"}
          />
        </div>

        {/* Section 2: Filter & List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-dark-tandur">Riwayat Transaksi</h3>
            <TransactionFilter selectedType={filterType} onTypeChange={setFilterType} />
          </div>

          <TransactionList>
            {transactions.map((t) => (
              <TransactionItem
                key={t.id}
                date={t.date}
                type={t.type}
                description={t.desc}
                stepName={t.step}
                amount={formatRupiah(t.amount)}
              />
            ))}
            {transactions.length === 0 && (
              <div className="py-8 text-center text-gray-500">Belum ada transaksi catat.</div>
            )}
          </TransactionList>
        </div>
      </div>

      {/* Mobile Actions (Sticky Bottom) */}
      <div className="fixed bottom-0 left-0 w-full border-t border-gray-200 bg-white-tandur p-4 md:hidden z-40">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setModalType('expense')}
            className="w-full rounded-lg bg-danger py-3 text-sm font-bold text-white-tandur shadow-lg active:scale-95"
          >
            - Biaya
          </button>
          <button
            onClick={() => setModalType('income')}
            className="w-full rounded-lg bg-main py-3 text-sm font-bold text-white-tandur shadow-lg active:scale-95"
          >
            + Pemasukan
          </button>
        </div>
      </div>

      {/* --- ADD EXPENSE MODAL --- */}
      <TandurModal
        show={modalType === 'expense'}
        onClose={closeModal}
        title="Catat Pengeluaran"
        footer={
          <>
            <SecondaryButton className="w-full sm:w-auto" onClick={closeModal}>Batal</SecondaryButton>
            <PrimaryButton className="w-full sm:w-auto" onClick={submitExpense} disabled={expenseForm.processing}>
              Simpan
            </PrimaryButton>
          </>
        }
      >
        <form onSubmit={submitExpense} className="space-y-4">
          <div>
            <InputLabel value="Deskripsi Pengeluaran" />
            <TextInput
              placeholder="Contoh: Beli Pupuk Urea"
              className={`w-full mt-1 ${expenseForm.errors.description ? 'border-danger focus:border-danger ring-danger/20' : ''}`}
              value={expenseForm.data.description}
              onChange={e => expenseForm.setData('description', e.target.value)}
            />
            <InputError message={expenseForm.errors.description} className="mt-1" />
          </div>
          <div>
            <TandurCurrencyInput
              label="Nominal"
              value={expenseForm.data.amount}
              onChange={(val) => expenseForm.setData('amount', val ? val.toString() : '')}
              placeholder="Rp 0"
              error={expenseForm.errors.amount}
            />
          </div>
          <div>
            <InputLabel value="Tanggal" />
            <TandurDatePicker
              value={expenseForm.data.expense_date ? parseISO(expenseForm.data.expense_date) : null}
              onChange={(date) => expenseForm.setData('expense_date', date ? format(date, 'yyyy-MM-dd') : '')}
              className="mt-1"
            />
          </div>
          <div>
            <TandurSelect
              label="Tipe Pengeluaran"
              placeholder="-- Pilih Tipe --"
              options={[
                { value: 'fertilizer', label: 'Pupuk' },
                { value: 'chemical', label: 'Obat/Kimia' },
                { value: 'labor', label: 'Tenaga Kerja' },
                { value: 'tool', label: 'Sewa Alat' },
                { value: 'other', label: 'Lainnya' },
              ]}
              value={expenseForm.data.type}
              onChange={val => expenseForm.setData('type', val)}
              error={expenseForm.errors.type}
            />
          </div>
          <div>
            <TandurSelect
              label="Terkait Tahapan (Opsional)"
              placeholder="-- Pilih Tahapan --"
              options={activeActivities.map(act => ({ label: act.name, value: act.id }))}
              value={expenseForm.data.farm_activity_id}
              onChange={val => expenseForm.setData('farm_activity_id', val)}
              error={expenseForm.errors.farm_activity_id}
            />
          </div>
        </form>
      </TandurModal>

      {/* --- ADD INCOME MODAL --- */}
      <TandurModal
        show={modalType === 'income'}
        onClose={closeModal}
        title="Catat Pemasukan"
        footer={
          <>
            <SecondaryButton className="w-full sm:w-auto" onClick={closeModal}>Batal</SecondaryButton>
            <PrimaryButton className="w-full sm:w-auto" onClick={submitIncome} disabled={incomeForm.processing}>
              Simpan
            </PrimaryButton>
          </>
        }
      >
        <form onSubmit={submitIncome} className="space-y-4">
          <div>
            <InputLabel value="Sumber Pemasukan" />
            <TextInput
              placeholder="Contoh: Penjualan Gabah"
              className={`w-full mt-1 ${incomeForm.errors.description ? 'border-danger focus:border-danger ring-danger/20' : ''}`}
              value={incomeForm.data.description}
              onChange={e => incomeForm.setData('description', e.target.value)}
            />
            <InputError message={incomeForm.errors.description} className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <InputLabel value="Jumlah (Kg/Unit)" />
              <TextInput
                type="number"
                className={`w-full mt-1 ${incomeForm.errors.quantity ? 'border-danger focus:border-danger ring-danger/20' : ''}`}
                value={incomeForm.data.quantity}
                onChange={e => incomeForm.setData('quantity', e.target.value)}
              />
              <InputError message={incomeForm.errors.quantity} className="mt-1" />
            </div>
            <div>
              <TandurCurrencyInput
                label="Harga Satuan"
                value={incomeForm.data.price_per_unit}
                onChange={(val) => incomeForm.setData('price_per_unit', val ? val.toString() : '')}
                prefix="Rp"
                error={incomeForm.errors.price_per_unit}
              />
            </div>
          </div>
          <div>
            <TandurCurrencyInput
              label="Total Terima (Otomatis)"
              value={incomeForm.data.total_amount}
              onChange={(val) => incomeForm.setData('total_amount', val ? val.toString() : '')}
              prefix="Rp"
              error={incomeForm.errors.total_amount}
              disabled
            />
          </div>
          <div>
            <InputLabel value="Tanggal Terima" />
            <TandurDatePicker
              value={incomeForm.data.income_date ? parseISO(incomeForm.data.income_date) : null}
              onChange={(date) => incomeForm.setData('income_date', date ? format(date, 'yyyy-MM-dd') : '')}
              className="mt-1"
              placement="top"
            />
          </div>
        </form>
      </TandurModal>

    </AuthenticatedLayout>
  );
}
