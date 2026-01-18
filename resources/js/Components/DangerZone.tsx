interface DangerZoneProps {
  onArchive: () => void;
  onDelete: () => void;
}

export default function DangerZone({ onArchive, onDelete }: DangerZoneProps) {
  return (
    <div className="rounded-xl border border-danger/20 bg-danger/5 p-6">
      <h3 className="mb-4 text-lg font-bold text-danger">Danger Zone</h3>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between rounded-lg bg-white-tandur p-4 shadow-sm">
          <div>
            <div className="font-bold text-dark-tandur">Arsipkan Sawah</div>
            <div className="text-sm text-gray-500">Sawah akan disembunyikan dari daftar aktif.</div>
          </div>
          <button
            onClick={onArchive}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50"
          >
            Arsipkan
          </button>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-white-tandur p-4 shadow-sm">
          <div>
            <div className="font-bold text-danger">Hapus Sawah Permanen</div>
            <div className="text-sm text-gray-500">Semua data akan hilang dan tidak bisa dikembalikan.</div>
          </div>
          <button
            onClick={onDelete}
            className="rounded-lg bg-danger px-4 py-2 text-sm font-bold text-white-tandur hover:bg-danger/90"
          >
            Hapus Sawah
          </button>
        </div>
      </div>
    </div>
  );
}
