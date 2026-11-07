import { useState } from 'react';
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import {
  LayoutGrid,
  LayoutDashboard,
  Package,
  Users,
  ShieldCheck,
  History,
  ScanLine,
  Settings,
  LogOut,
  Search,
  Bell,
  ChevronDown,
  User,
  CheckCheck,
} from 'lucide-react';
import { useSession } from '@/hooks/useSession';
import { useNotifications } from '@/hooks/useNotifications';
import { initials, formatDate } from '@/utils/formatDate';

export function AppShell() {
  const { user, organisation, logout } = useSession();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const location = useLocation();

  const railLinks = [
    { name: 'Assets', to: '/assets', icon: Package },
    { name: 'Employees', to: '/employees', icon: Users },
    { name: 'Roles', to: '/roles', icon: ShieldCheck },
    { name: 'Audit', to: '/audit', icon: History },
    { name: 'Verification', to: '/verification', icon: ScanLine },
  ];

  return (
    <div className="h-screen max-h-screen w-full bg-[#f4f6f8] flex flex-col font-sans text-gray-900 antialiased overflow-hidden">
      {/* Top Header - Edge-to-Edge Compact */}
      <header className="w-full bg-[#f4f6f8] px-5 sm:px-7 pt-2.5 pb-1.5 flex items-center justify-between gap-4 shrink-0 z-30 select-none">
        {/* Brand Logo */}
        <Link to="/dashboard" className="flex items-center group transition-transform hover:opacity-85">
          <img
            src="/lokus-logo.png"
            alt="Lokus"
            className="h-7 sm:h-8 w-auto object-contain mix-blend-multiply"
          />
        </Link>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Search Button */}
          <button
            type="button"
            className="w-8 h-8 rounded-full bg-white border border-gray-200/80 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-50 shadow-xs transition-colors cursor-pointer"
            aria-label="Search"
            onClick={() => alert('Search across assets, employees, and roles')}
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              type="button"
              className="w-8 h-8 rounded-full bg-white border border-gray-200/80 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-50 shadow-xs transition-colors cursor-pointer relative"
              aria-label="Notifications"
              onClick={() => setNotifMenuOpen(!notifMenuOpen)}
            >
              <Bell className="w-3.5 h-3.5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#107C41]" />
              )}
            </button>

            {/* Notifications Dropdown */}
            {notifMenuOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-200/80 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Notifications</h3>
                  <button
                    type="button"
                    onClick={markAllRead}
                    className="text-xs text-emerald-600 hover:underline flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark read
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-gray-50 mt-2">
                  {notifications.length ? (
                    notifications.map((n) => (
                      <div key={n.id} className="py-2.5">
                        <p className="text-xs font-semibold text-gray-800">{n.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                        <span className="text-[10px] text-gray-400 mt-1 block">
                          {formatDate(n.createdAt, true)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 py-4 text-center">You are all caught up</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-1.5 pl-1 pr-2 py-0.5 rounded-full bg-white border border-gray-200/80 hover:bg-gray-50 shadow-xs transition-colors cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-[#107C41] text-white flex items-center justify-center font-bold text-[11px]">
                {initials(user?.name || 'Admin')}
              </div>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {/* User Dropdown */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-200/80 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-xs font-bold text-gray-900">{user?.name || 'Administrator'}</p>
                  <p className="text-[11px] text-gray-400 truncate">{user?.email || 'admin@lokus.io'}</p>
                </div>
                <div className="py-1">
                  <Link
                    to={'/employees/' + user?.id}
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 rounded-xl"
                  >
                    <User className="w-3.5 h-3.5 text-gray-400" /> My Profile
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 rounded-xl"
                  >
                    <Settings className="w-3.5 h-3.5 text-gray-400" /> Workspace Settings
                  </Link>
                </div>
                <div className="pt-1 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-xl cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace Area - Fits 100vh with Left Rail */}
      <div className="flex-1 w-full pl-2.5 sm:pl-3.5 pr-5 sm:pr-7 pt-1 pb-3 flex gap-3.5 sm:gap-4 min-w-0 min-h-0 overflow-hidden">
        {/* Left Floating Rail - Reduced Left Margin, Upper Margin & Individual Squircle White BG on Each Button */}
        <aside className="hidden lg:flex flex-col items-center justify-between pb-2 mt-4 sm:mt-5 bg-transparent w-12 shrink-0 h-[calc(100%-1.25rem)] select-none">
          {/* Top Home/Dashboard Squircle Button with White Card Surrounding It */}
          <div className="flex flex-col items-center gap-3">
            <NavLink
              to="/dashboard"
              title="Dashboard"
              className="w-11 h-11 rounded-2xl bg-white shadow-xs border border-gray-200/80 p-0.5 flex items-center justify-center transition-all hover:scale-105 hover:shadow-sm cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#107C41] text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-95">
                <LayoutGrid className="w-4 h-4" />
              </div>
            </NavLink>

            {/* Navigation Icon Stack (Assets, Employees, Roles, Audit, Verification) */}
            <div className="flex flex-col items-center gap-2 mt-0.5">
              {railLinks.map((link) => {
                const active = location.pathname.startsWith(link.to);
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    title={link.name}
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-xs border ${
                      active
                        ? 'bg-emerald-50 text-[#107C41] border-[#107C41]/35 ring-2 ring-emerald-500/20 font-bold'
                        : 'bg-white text-gray-500 border-gray-200/80 hover:text-gray-900 hover:border-gray-300 hover:scale-105 hover:shadow-sm'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* Bottom Icon Stack (Settings & Logout) */}
          <div className="flex flex-col items-center gap-2 w-full">
            <NavLink
              to="/settings"
              title="Settings"
              className={({ isActive }) =>
                `w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-xs border ${
                  isActive
                    ? 'bg-emerald-50 text-[#107C41] border-[#107C41]/35 ring-2 ring-emerald-500/20 font-bold'
                    : 'bg-white text-gray-500 border-gray-200/80 hover:text-gray-900 hover:border-gray-300 hover:scale-105 hover:shadow-sm'
                }`
              }
            >
              <Settings className="w-5 h-5" />
            </NavLink>

            <button
              type="button"
              onClick={logout}
              title="Sign out"
              className="w-11 h-11 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex items-center justify-center text-gray-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50/50 hover:scale-105 hover:shadow-sm transition-all cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 min-h-0 flex flex-col overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
