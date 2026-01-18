import { Link, usePage } from '@inertiajs/react';
import { ReactNode } from 'react';
import FarmSelector from './FarmSelector';
import SidebarItem from './SidebarItem';

interface Farm {
  id: number;
  name: string;
  [key: string]: any;
}

interface SidebarProps {
  farms?: Farm[];
  activeFarm?: Farm;
  onFarmChange?: (farm: Farm) => void;
  className?: string;
}

export default function Sidebar({
  farms = [],
  activeFarm,
  onFarmChange,
  className = '',
}: SidebarProps) {
  const { auth, global_state } = usePage<any>().props;
  const user = auth?.user;
  const isAdmin = user?.role === 'admin';
  const { has_farm, has_active_period } = global_state || {};

  return (
    <aside
      className={`
                flex h-full min-h-screen w-full flex-col bg-white-tandur border-r border-dark-tandur/10
                ${className}
            `}
    >
      {/* Header / Branding / Farm Selector */}
      <div className="flex flex-col gap-6 p-6 pb-2">
        {/* Logo */}
        <div className="flex items-center gap-3 px-1">
          <img src="/images/logo/logo-fix.svg" alt="Tandur" className="h-8 w-8" />
          <span className="text-2xl font-bold tracking-tight text-main">Tandur</span>
        </div>

        {/* Farm Selector */}
        <FarmSelector
          farms={farms}
          activeFarm={activeFarm}
          onFarmChange={onFarmChange}
        />
      </div>

      {/* Main Menu - Scrollable */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide">
        <div className="flex flex-col gap-1">
          <div className="mb-2 px-4 text-xs font-bold uppercase tracking-wider text-gray-400">
            Menu Utama
          </div>

          <SidebarItem
            label="Dashboard"
            href={route('dashboard')}
            active={route().current('dashboard')}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
              </svg>
            }
          />

          <SidebarItem
            label="Tahapan Pertanian"
            href={route('farming-steps.index')}
            active={route().current('farming-steps.*')}
            disabled={!has_farm}
            tooltip="Buat sawah terlebih dahulu untuk mengakses menu ini."
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
              </svg>
            }
          />

          <SidebarItem
            label="Biaya & Pemasukan"
            href={route('finance.index')}
            active={route().current('finance.index')}
            disabled={!has_active_period}
            tooltip="Menu ini aktif jika sawah memiliki periode panen aktif."
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a.75.75 0 0 1-.75-.75V16.5m.75.75 5.25 11.25c0 .414.336.75.75.75h14.25M6 19.125a.75.75 0 0 1-.75-.75v-13.5c0-.414.336-.75.75-.75h13.5c.414 0 .75.336.75.75v13.5a.75.75 0 0 1-.75.75H6Z" />
              </svg>
            }
          />

          <SidebarItem
            label="Pekerja"
            href={route('workers.index')}
            active={route().current('workers.index')}
            disabled={!has_farm}
            tooltip="Buat sawah terlebih dahulu untuk mengakses data pekerja."
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
              </svg>
            }
          />

          <SidebarItem
            label="Stok & Inventaris"
            href={route('inventory.index')}
            active={route().current('inventory.index')}
            disabled={!has_active_period} // Requirement: "Sawah DAN Periode Panen Aktif" - covered by has_active_period
            tooltip="Menu ini aktif jika sawah memiliki periode panen aktif."
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
              </svg>
            }
          />
        </div>

        {/* Divider */}
        <div className="my-4 h-px bg-gray-100 mx-4"></div>

        <div className="flex flex-col gap-1">
          <div className="mb-2 px-4 text-xs font-bold uppercase tracking-wider text-gray-400">
            Manajemen
          </div>

          <SidebarItem
            label="Periode Panen"
            href={route('periods.index')}
            active={route().current('periods.index')}
            disabled={!has_farm}
            tooltip="Buat sawah terlebih dahulu untuk membuat periode panen."
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0h18M5 21h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2Zm5-5.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm7 0a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z" />
              </svg>
            }
          />

          <SidebarItem
            label="Master Tahapan Pertanian"
            href={route('master-farming-steps.index')}
            active={route().current('master-farming-steps.*')}
            // Master steps might not need farm strictly if they are global, but context implies user needs farm usually. 
            // However, Requirement only listed "Tahapan Pertanian" (active one) not Master.
            // But let's apply has active farm rule for safety if it's tied to farm.
            // User did not explicitly mention "Master Tahapan", only "Tahapan Pertanian". 
            // I'll leave Master enabled as it can be generic, OR disable if no farm.
            // Let's assume Master is tied to Farm Settings too (since crop type etc).
            disabled={!has_farm}
            tooltip="Buat sawah terlebih dahulu."
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 17.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
            }
          />

          {isAdmin && (
            <SidebarItem
              label="Manajemen Pengguna"
              href={route('users.index')}
              active={route().current('users.*')}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                </svg>
              }
            />
          )}

          <SidebarItem
            label="Pengaturan Sawah"
            href={route('farm-settings.index')}
            active={route().current('farm-settings.index')}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l-.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            }
          />
        </div>
      </nav>

      {/* User Profile / Logout */}
      <div className="border-t border-gray-100 p-4">
        <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-main text-white font-bold">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-bold text-dark-tandur">{user?.name}</p>
            <p className="truncate text-xs text-gray-500 capitalize">{user?.role === 'admin' ? 'Administrator' : 'Pengguna Umum'}</p>
          </div>
          <Link
            href={route('logout')}
            method="post"
            as="button"
            className="rounded-full p-2 text-gray-400 hover:bg-gray-200 hover:text-danger transition-colors"
            title="Keluar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
            </svg>
          </Link>
        </div>
      </div>
    </aside >
  );
}
