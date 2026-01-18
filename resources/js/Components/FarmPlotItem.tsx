interface FarmPlotItemProps {
  name: string;
  area?: string;
  activityCount: number;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function FarmPlotItem({
  name,
  area,
  activityCount,
  onEdit,
  onDelete,
}: FarmPlotItemProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white-tandur p-4 shadow-sm transition-all hover:shadow-md">
      <div>
        <h4 className="font-bold text-dark-tandur">{name}</h4>
        <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
          {area && <span>Luas: <span className="font-medium text-dark-tandur">{area} Ha</span></span>}
          {area && <span>•</span>}
          <span>{activityCount} Aktivitas berjalan</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onEdit}
          className="rounded-lg bg-gray-50 p-2 text-gray-600 hover:bg-gray-100"
          title="Edit Petak"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="m2.695 14.762-1.262 3.155a.5.5 0 0 0 .65.65l3.155-1.262a4 4 0 0 0 1.343-.886L17.5 5.501a2.121 2.121 0 0 0-3-3L3.58 13.419a4 4 0 0 0-.885 1.343Z" />
          </svg>
        </button>
        <button
          onClick={onDelete}
          className="rounded-lg bg-gray-50 p-2 text-danger hover:bg-danger/10"
          title="Hapus Petak"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}
