import { Link } from '@inertiajs/react';
import { CheckCircle2, Circle, Tractor, Calendar, ListChecks, Activity, ArrowRight, TableProperties } from 'lucide-react';

interface OnboardingStatus {
  has_farm: boolean;
  has_plots: boolean;
  has_period: boolean;
  has_active_period: boolean;
  has_farming_steps: boolean;
  has_activity: boolean;
  is_completed: boolean;
}

interface OnboardingCardProps {
  status: OnboardingStatus;
  onComplete?: () => void;
  onShowExpense?: () => void;
}

export default function OnboardingCard({ status, onComplete, onShowExpense }: OnboardingCardProps) {
  // Determine current step index (0-based)
  // Step 1: Create Farm
  // Step 2: Create Plots (Requires Farm)
  // Step 3: Create Period (Requires Plots)
  // Step 4: Setup Steps (Requires Period)
  // Step 5: Record Activity

  const steps = [
    {
      id: 'farm',
      title: 'Buat Sawah',
      description: 'Daftarkan lahan pertanian Anda untuk mulai mengelola.',
      icon: Tractor,
      isCompleted: status.has_farm,
      canAccess: true,
      ctaLabel: 'Buat Sawah',
      ctaLink: route('farm-settings.index'),
    },
    {
      id: 'plots',
      title: 'Isi Petak Sawah',
      description: 'Bagi luas sawah menjadi beberapa petak sebelum memulai periode tanam.',
      icon: TableProperties, // Icon for plots/grid
      isCompleted: status.has_plots,
      canAccess: status.has_farm,
      ctaLabel: 'Atur Petak',
      ctaLink: route('farm-settings.index'),
    },
    {
      id: 'period',
      title: 'Buat Periode Panen',
      description: 'Tentukan musim tanam aktif untuk sawah Anda.',
      icon: Calendar,
      isCompleted: status.has_active_period,
      canAccess: status.has_plots, // Requires plots logic
      ctaLabel: 'Buat Periode',
      ctaLink: route('periods.index'), // Direct to Period Management
    },
    {
      id: 'steps',
      title: 'Atur Tahapan Pertanian',
      description: 'Generate atau sesuaikan rencana kegiatan tanam Anda.',
      icon: ListChecks,
      isCompleted: status.has_farming_steps,
      canAccess: status.has_active_period,
      ctaLabel: 'Atur Tahapan',
      ctaLink: route('master-farming-steps.index'),
    },
    {
      id: 'activity',
      title: 'Mulai Catat Aktivitas',
      description: 'Catat pengeluaran, kerja, atau stok pertama Anda untuk mulai menggunakan Tandur.',
      icon: Activity,
      isCompleted: status.has_activity,
      canAccess: status.has_farming_steps,
      ctaLabel: null,
      ctaLink: null,
    }
  ];

  const completedCount = steps.filter(s => s.isCompleted).length;
  const progress = (completedCount / steps.length) * 100;

  // If all completed, return null (should be handled by parent too, but safe here)
  if (completedCount === steps.length) return null;

  return (
    <div className="bg-white-tandur rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-6 bg-gradient-to-br from-main/10 to-transparent border-b border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-4 md:gap-0">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-gray-900 leading-relaxed">Selamat Datang di Tandur! 🌱</h2>
            <p className="text-sm md:text-base text-gray-600 mt-1">Selesaikan langkah berikut untuk menyiapkan kebun Anda.</p>
          </div>
          <div className="bg-white px-3 py-1 rounded-full text-sm font-semibold text-main shadow-sm border border-main/20 self-start md:self-auto">
            {completedCount} / {steps.length} Selesai
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-main transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps List */}
      <div className="p-4 md:p-6 space-y-4">
        {steps.map((step, index) => {
          const isCurrent = !step.isCompleted && step.canAccess && (index === 0 || steps[index - 1].isCompleted);
          const isLocked = !step.canAccess;

          return (
            <div
              key={step.id}
              className={`relative flex flex-col md:flex-row md:items-center p-4 md:p-6 rounded-xl border transition-all ${isCurrent
                ? 'bg-white border-main/50 shadow-md scale-[1.01] ring-1 ring-main/20'
                : 'bg-white border-transparent hover:bg-gray-50'
                } ${isLocked ? 'opacity-50 grayscale' : ''}`}
            >
              {/* Content Section */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center flex-1 w-full gap-3 md:gap-4">
                {/* Icon */}
                <div className={`p-3 rounded-full flex-shrink-0 ${step.isCompleted ? 'bg-green-100 text-green-600' :
                  isCurrent ? 'bg-main/10 text-main' : 'bg-gray-100 text-gray-400'
                  }`}>
                  {step.isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <step.icon className="w-6 h-6" />}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold text-base md:text-lg ${step.isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Action Section */}
              <div className="w-full md:w-auto mt-4 md:mt-0 md:ml-6 flex-shrink-0 onboarding-actions">
                {step.isCompleted ? (
                  <div className="hidden md:block text-sm font-medium text-green-600">Selesai</div>
                ) : step.id === 'activity' && isCurrent ? (
                  <div className="flex flex-col md:flex-row gap-2 md:gap-3 w-full md:w-auto">
                    <button
                      onClick={() => {
                        if (onComplete) onComplete();
                        if (onShowExpense) onShowExpense();
                      }}
                      className="inline-flex justify-center items-center w-full md:w-auto min-h-[44px] px-6 py-2 bg-main border border-transparent rounded-lg font-bold text-xs text-white uppercase tracking-wider hover:bg-emerald-700 active:bg-emerald-900 focus:outline-none focus:ring-2 ring-emerald-300 ring-offset-2 transition ease-in-out duration-150 shadow-sm md:flex-1 md:max-w-[260px]"
                    >
                      Catat Aktivitas Pertama
                    </button>
                    <button
                      onClick={onComplete}
                      className="inline-flex justify-center items-center w-full md:w-auto min-h-[44px] px-4 py-2 bg-white border border-gray-300 rounded-lg font-bold text-xs text-gray-700 uppercase tracking-wider hover:bg-gray-50 focus:outline-none focus:ring-2 ring-gray-200 ring-offset-2 transition ease-in-out duration-150 shadow-sm"
                    >
                      Masuk ke Dashboard
                    </button>
                  </div>
                ) : isCurrent && step.ctaLink ? (
                  <Link
                    href={step.ctaLink}
                    className="inline-flex justify-center items-center w-full md:w-auto min-h-[44px] px-4 py-2 bg-main border border-transparent rounded-lg font-bold text-xs text-white uppercase tracking-wider hover:bg-emerald-700 active:bg-emerald-900 focus:outline-none focus:ring-2 ring-emerald-300 ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150 shadow-sm"
                  >
                    {step.ctaLabel} <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                ) : isLocked ? (
                  <div className="flex md:block justify-start">
                    <span className="text-xs text-gray-400 font-medium px-3 py-1.5 bg-gray-100 rounded-full border border-gray-200">
                      Terkunci
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
