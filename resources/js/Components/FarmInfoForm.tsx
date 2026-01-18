import { useForm } from '@inertiajs/react';
import TandurSelect from '@/Components/TandurSelect';
import TandurDatePicker from '@/Components/TandurDatePicker';
import { parseISO, format } from 'date-fns';

interface CropType {
  id: number;
  name: string;
  slug: string;
}

interface FarmInfoFormProps {
  farm: {
    name: string;
    area: string;
    date: string;
    cropType: string;
  };
  cropTypes: CropType[];
  onSubmit: (data: any) => void;
  disabled?: boolean;
}

export default function FarmInfoForm({ farm, cropTypes, onSubmit, disabled = false }: FarmInfoFormProps) {
  const { data, setData, post, processing, errors } = useForm({
    name: farm.name,
    area: farm.area,
    date: farm.date,
    cropType: farm.cropType,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white-tandur p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-dark-tandur">Informasi Sawah</h3>
        {disabled && (
          <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-200">
            Beberapa info dikunci selama periode aktif.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Nama Sawah */}
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-medium text-gray-700">Nama Sawah</label>
          <input
            id="name"
            type="text"
            value={data.name}
            onChange={(e) => setData('name', e.target.value)}
            className="rounded-lg border-gray-200 shadow-sm focus:border-main focus:ring-main"
            placeholder="Contoh: Sawah Blok A"
          />
        </div>

        {/* Luas */}
        <div className="flex flex-col gap-2">
          <label htmlFor="area" className="text-sm font-medium text-gray-700">Luas Lahan (Ha)</label>
          <input
            id="area"
            type="text"
            value={data.area}
            onChange={(e) => setData('area', e.target.value)}
            placeholder="0.0"
            disabled={disabled}
            className={`rounded-lg border-gray-200 shadow-sm focus:border-main focus:ring-main ${disabled ? 'bg-gray-100 text-gray-500' : ''}`}
          />
        </div>

        {/* Tanggal Pengukuran */}
        <div className="flex flex-col gap-2">
          <TandurDatePicker
            label="Tanggal Pengukuran"
            value={data.date ? parseISO(data.date) : null}
            onChange={(date) => setData('date', date ? format(date, 'yyyy-MM-dd') : '')}
            placeholder="Pilih Tanggal"
          />
        </div>

        {/* Jenis Tanaman (Dropdown) */}
        <div className="flex flex-col gap-2">
          {cropTypes && cropTypes.length > 0 ? (
            <TandurSelect
              label="Jenis Tanaman (Aktif)"
              placeholder="Pilih Jenis Tanaman"
              options={cropTypes.map(type => ({ label: type.name, value: type.id }))}
              value={data.cropType}
              onChange={(val) => setData('cropType', val)}
              disabled={disabled}
            />
          ) : (
            <div className="text-sm text-red-500 italic">
              Belum ada jenis tanaman, silakan tambah terlebih dahulu.
            </div>
          )}
        </div>
      </div>

      <div className="mt-2 flex justify-end">
        <button
          type="submit"
          disabled={processing}
          className="rounded-lg bg-main px-6 py-2.5 text-sm font-bold text-white-tandur shadow-sm hover:bg-main/90 disabled:opacity-50"
        >
          Simpan Perubahan
        </button>
      </div>
    </form>
  );
}
