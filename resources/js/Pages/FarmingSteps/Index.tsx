import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import StepSummaryCard from '@/Components/StepSummaryCard';
import StepList from '@/Components/StepList';
import Breadcrumb from '@/Components/Breadcrumb';
import { useState } from 'react';

interface FarmingStepProps {
  farmName: string;
  cropType: string;
  steps: any[];
  hasActivePeriod: boolean;
}

export default function Index({ farmName, cropType, steps, hasActivePeriod }: FarmingStepProps) {

  const stats = {
    total: steps.length,
    done: steps.filter(s => s.is_finished || s.is_locked).length,
    active: steps.filter(s => s.is_in_progress).length,
    pending: steps.filter(s => s.is_draft).length,
  };

  const [isCompletedExpanded, setIsCompletedExpanded] = useState(true);

  const breadcrumbs = [
    { label: 'Dashboard', href: route('dashboard') },
    { label: 'Tahapan Pertanian' },
  ];

  const handleStart = (id: number) => {
    if (confirm('Mulai tahapan ini?')) {
      router.post(route('farming-steps.start', id));
    }
  };

  const handleComplete = (id: number) => {
    if (confirm('Selesaikan tahapan ini?')) {
      router.post(route('farming-steps.complete', id));
    }
  };



  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };



  return (
    <AuthenticatedLayout
      header={
        <div>
          <h2 className="text-2xl font-bold leading-tight text-dark-tandur">
            Tahapan Pertanian
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{farmName}</span>
            <span>•</span>
            <span className="font-medium text-main">{cropType}</span>
          </div>
        </div>
      }
    >
      <Head title="Tahapan Pertanian" />

      <div className="flex flex-col gap-8">
        <div className="px-1">
          <Breadcrumb items={breadcrumbs} />
        </div>

        {/* Section 1: Summary */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StepSummaryCard
            label="Total Tahapan"
            value={stats.total}
            icon={<span>📋</span>}
          />
          <StepSummaryCard
            label="Selesai"
            value={stats.done}
            variant="success"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
              </svg>
            }
          />
          <StepSummaryCard
            label="Sedang Aktif"
            value={stats.active}
            variant="warning"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" />
              </svg>
            }
          />
          <StepSummaryCard
            label="Belum Mulai"
            value={stats.pending}
            variant="neutral"
            icon={<span>⏳</span>}
          />
        </div>

        {/* Section 2: Step List */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-dark-tandur">Daftar Tahapan</h3>

          {!hasActivePeriod ? (
            <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200 border-dashed">
              <p className="text-gray-500 font-medium">Belum ada periode tanam aktif.</p>
              <p className="text-sm text-gray-400 mt-1">Silakan buat atau aktifkan periode tanam di menu Periode.</p>
            </div>
          ) : steps.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200 border-dashed">
              <p className="text-gray-500 font-medium">Tahapan belum digenerate.</p>
              <p className="text-sm text-gray-400 mt-1 mb-4">Sistem akan otomatis membuat tahapan saat Periode Tanam dibuat.</p>
              <div className="flex justify-center">
                <button
                  onClick={() => router.post(route('farming-steps.generate'))}
                  className="px-4 py-2 bg-main text-white-tandur text-sm font-bold rounded-lg hover:bg-main/90 transition shadow-sm"
                >
                  Generate Tahapan Sekarang
                </button>
              </div>
            </div>
          ) : (
            <StepList>
              {
                // Find active step for sticky header
                (() => {
                  const activeStep = steps.find(s => s.is_in_progress);
                  if (activeStep) {
                    return (
                      <div className="sticky top-0 z-10 mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-secondary text-dark-tandur font-bold rounded-full h-8 w-8 flex items-center justify-center text-sm shadow-sm ring-2 ring-yellow-200">
                            {activeStep.step_order}
                          </div>
                          <div>
                            <div className="text-xs uppercase tracking-wider text-yellow-800 font-bold mb-0.5">Step Aktif Saat Ini</div>
                            <div className="font-bold text-dark-tandur text-sm">{activeStep.name}</div>
                          </div>
                        </div>
                        <a href={route('farming-steps.detail', activeStep.id)} className="px-3 py-1.5 bg-white text-dark-tandur text-xs font-bold rounded border border-gray-200 hover:bg-gray-50 shadow-sm">
                          Buka Detail
                        </a>
                      </div>
                    );
                  }
                  return null;
                })()
              }

              {/* Toggle Finished Steps */}
              {stats.done > 0 && (
                <div className="flex justify-end mb-2">
                  <button
                    onClick={() => setIsCompletedExpanded(!isCompletedExpanded)}
                    className="text-xs font-bold text-main hover:text-green-700 flex items-center gap-1 transition-colors"
                  >
                    {isCompletedExpanded ? 'Sembunyikan Step Selesai' : `Tampilkan ${stats.done} Step Selesai`}
                    <svg
                      className={`w-3 h-3 transition-transform ${isCompletedExpanded ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              )}

              {steps.map((step, index) => {
                const isDone = step.is_finished || step.is_locked;
                const isHidden = isDone && !isCompletedExpanded;

                // If hidden, render nothing? Or maybe a very thin placeholder? 
                // Request says "Collapsed (ringkas)" -> meaning show A summarized version, NOT hidden completely.
                // Wait, request said: "Collapse otomatis... Hanya menampilkan: Nomor, Nama, Badge, Tanggal".
                // AND "Tambahkan toggle... Sembunyikan step selesai".
                // So there are 3 states? 
                // 1. Expanded (Full detail)
                // 2. Collapsed (Summary row) -> Default for Done
                // 3. Hidden? (Toggle "Sembunyikan step selesai")

                // Let's refine interpretation.
                // "Toggle global: Tampilkan semua / Sembunyikan" implies visibility.
                // "Collapse otomatis" implies the default state when visible is collapsed.
                // Let's implement:
                // Global Toggle: Show/Hide Finished Steps entirely? Or just toggles between Collapsed/Expanded?
                // "Collapse otomatis untuk step yang sudah selesai" -> Default is collapsed.
                // "Toggle: Tampilkan semua step selesai / Sembunyikan" -> Usually means visibility.

                // Let's go with:
                // Default: Done steps are VISIBLE but COLLAPSED (Summary Row). 
                // Toggle "Sembunyikan" -> Hides them completely.
                // Toggle "Tampilkan" -> Shows them in collapsed state.
                // Clicking "Detail" or Expand on a collapsed step -> Shows full card?

                // Simpler approach for now based on request "Collapse otomatis... detail hanya muncul jika klik".
                // So Done steps are always simplified rows unless interacted with.
                // The Global toggle "Sembunyikan" will hide these rows.

                if (isDone && !isCompletedExpanded) return null; // Global toggle hides them

                if (isDone) {
                  // Render Collapsed Row
                  return (
                    <div
                      key={step.id}
                      className="group flex flex-col sm:flex-row items-center gap-3 rounded-lg border border-gray-100 bg-white p-3 hover:bg-gray-50 transition-all cursor-pointer"
                      onClick={() => router.get(route('farming-steps.detail', step.id))} // Navigate on click
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700 font-bold text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1 flex items-center justify-between min-w-0">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-dark-tandur truncate">{step.name}</span>
                          {/* Short Badge */}
                          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            Selesai
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 whitespace-nowrap hidden sm:block">
                          {step.finished_at ? formatDate(step.finished_at) : '-'}
                        </div>
                      </div>
                      <div className="text-gray-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  );
                }

                // Active / Pending Step (Full Card)
                return (
                  <div
                    key={step.id}
                    className={`
                    group relative flex flex-col sm:flex-row gap-4 rounded-xl border p-5 transition-all duration-200
                    hover:border-main hover:bg-gray-50/50 hover:shadow-md
                    ${step.is_in_progress ? 'bg-secondary/10 border-warning ring-1 ring-warning/50' : 'bg-white-tandur border-gray-100'}
                    ${step.is_draft ? 'opacity-80' : ''}
                  `}
                  >
                    <div className="flex-1 flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        {/* Step Number */}
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold shadow-sm transition-colors 
                          ${step.is_in_progress ? 'bg-secondary text-dark-tandur' : 'bg-gray-100 text-gray-400'}`}
                        >
                          {step.step_order}
                        </div>

                        {/* Content */}
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className={`text-lg font-bold ${step.is_draft ? 'text-gray-500' : 'text-dark-tandur'}`}>
                              {step.name} <span className="text-xs text-gray-400 font-normal">#{step.step_order}</span>
                            </h4>
                            {/* Standardized Badge */}
                            {(() => {
                              if (step.is_finished) return <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Selesai</span>;
                              if (step.is_locked) return <span className="inline-flex items-center rounded-full bg-gray-50 px-2.5 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">Terkunci</span>;
                              if (step.is_in_progress) return <span className="inline-flex items-center rounded-full bg-yellow-50 px-2.5 py-0.5 text-xs font-bold text-yellow-800 ring-1 ring-inset ring-yellow-600/20">Aktif</span>;
                              return <span className="inline-flex items-center rounded-full bg-gray-50 px-2.5 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">Belum Mulai</span>;
                            })()}
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                            {step.is_in_progress && <span>Mulai: {formatDate(step.started_at || step.assigned_date)}</span>}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 self-start sm:self-center mt-4 sm:mt-0">
                        {step.is_draft && (
                          <button onClick={() => handleStart(step.id)} className="px-3 py-1 bg-main text-white text-xs rounded hover:bg-main/90 transition shadow-sm font-semibold">
                            Mulai
                          </button>
                        )}

                        {step.is_in_progress && (
                          <>
                            <button onClick={() => handleComplete(step.id)} className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition shadow-sm font-semibold">
                              Selesaikan
                            </button>
                            <a href={route('farming-steps.detail', step.id)} className="px-3 py-1 bg-white border border-gray-300 text-gray-700 text-xs rounded hover:bg-gray-50 transition shadow-sm font-semibold">
                              Detail
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </StepList>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
