import { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
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
  Clock,
  Umbrella,
  IndianRupee,
  ClipboardList,
  Network,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import type { Asset, Employee, OrgRequest, Resource, Role } from '@/types';
import { useSession } from '@/hooks/useSession';
import { useNotifications } from '@/hooks/useNotifications';
import { can } from '@/utils/permissions';
import { initials, formatDate } from '@/utils/formatDate';
import { Sidebar } from '@/components/layout/Sidebar';
import { EmployeeService } from '@/services/EmployeeService';
import { AssetService } from '@/services/AssetService';
import { RequestService } from '@/services/RequestService';
import { RoleService } from '@/services/RoleService';

export function AppShell() {
  const { user, organisation, permissions, logout } = useSession();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchIndex, setSearchIndex] = useState<{
    employees: Employee[];
    assets: Asset[];
    requests: OrgRequest[];
    roles: Role[];
  } | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('lokus:sidebar-expanded');
      if (saved === '0') setSidebarExpanded(false);
    } catch {
      // ignore storage access issues
    }
  }, []);

  const toggleSidebar = () => {
    setSidebarExpanded((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem('lokus:sidebar-expanded', next ? '1' : '0');
      } catch {
        // ignore storage access issues
      }
      return next;
    });
  };

  const allRailLinks: {
    name: string;
    to: string;
    icon: typeof Package;
    resource: Resource;
    group: 'Workforce & HR' | 'Operations & Assets';
  }[] = [
    { name: 'Employees', to: '/employees', icon: Users, resource: 'employees', group: 'Workforce & HR' },
    { name: 'Attendance', to: '/attendance', icon: Clock, resource: 'attendance', group: 'Workforce & HR' },
    { name: 'Leaves', to: '/leaves', icon: Umbrella, resource: 'leaves', group: 'Workforce & HR' },
    { name: 'Payroll & PF', to: '/payroll', icon: IndianRupee, resource: 'payroll', group: 'Workforce & HR' },
    { name: 'Requests', to: '/requests', icon: ClipboardList, resource: 'requests', group: 'Workforce & HR' },
    { name: 'Assets', to: '/assets', icon: Package, resource: 'assets', group: 'Operations & Assets' },
    { name: 'Organisation', to: '/organisation', icon: Network, resource: 'organisation', group: 'Operations & Assets' },
    { name: 'Roles & Access', to: '/roles', icon: ShieldCheck, resource: 'roles', group: 'Operations & Assets' },
    { name: 'Audit History', to: '/audit', icon: History, resource: 'audit', group: 'Operations & Assets' },
    { name: 'Verification', to: '/verification', icon: ScanLine, resource: 'verification', group: 'Operations & Assets' },
  ];

  const railLinks = allRailLinks.filter((l) => can(permissions, l.resource));
  const hrLinks = railLinks.filter((l) => l.group === 'Workforce & HR');
  const opsLinks = railLinks.filter((l) => l.group === 'Operations & Assets');

  useEffect(() => {
    if (!searchOpen || searchIndex) return;
    Promise.all([
      EmployeeService.list().catch(() => [] as Employee[]),
      AssetService.list().catch(() => [] as Asset[]),
      RequestService.list().catch(() => [] as OrgRequest[]),
      RoleService.list().catch(() => [] as Role[]),
    ]).then(([employees, assets, requests, roles]) => {
      setSearchIndex({ employees, assets, requests, roles });
    });
  }, [searchOpen, searchIndex]);

  const openSearch = () => {
    setSearchQuery('');
    setSearchOpen(true);
  };

  const q = searchQuery.trim().toLowerCase();
  const matchedEmployees = q
    ? (searchIndex?.employees || [])
        .filter(
          (e) =>
            e.name.toLowerCase().includes(q) ||
            e.employeeId.toLowerCase().includes(q) ||
            e.designation.toLowerCase().includes(q)
        )
        .slice(0, 4)
    : [];
  const matchedAssets = q
    ? (searchIndex?.assets || [])
        .filter(
          (a) =>
            a.name.toLowerCase().includes(q) ||
            a.assetId.toLowerCase().includes(q)
        )
        .slice(0, 4)
    : [];
  const matchedRequests = q
    ? (searchIndex?.requests || [])
        .filter(
          (r) =>
            r.title.toLowerCase().includes(q) ||
            r.requestNumber.toLowerCase().includes(q) ||
            r.category.toLowerCase().includes(q)
        )
        .slice(0, 4)
    : [];
  const matchedRoles = q
    ? (searchIndex?.roles || [])
        .filter((r) => r.name.toLowerCase().includes(q))
        .slice(0, 3)
    : [];

  return (
    <div className="h-screen max-h-screen w-full bg-[#f7f8fa] flex font-sans text-zinc-900 antialiased overflow-hidden">
      <Sidebar open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      {/* Extendable / Collapsible Desktop Sidebar (Docked Full-Height on Left) */}
      <aside
        className={`hidden lg:flex flex-col justify-between bg-white border-r border-slate-200/70 shrink-0 h-full select-none transition-all duration-200 ease-out ${
          sidebarExpanded ? 'w-60 px-3.5 py-4' : 'w-[68px] px-2.5 py-4 items-center'
        }`}
      >
          {/* Sidebar Header + Collapse/Expand Toggle + Dashboard Link */}
          <div className="flex flex-col gap-3 min-h-0 flex-1 overflow-hidden w-full">
            <div
              className={`flex items-center shrink-0 pb-2 border-b border-slate-100 ${
                sidebarExpanded ? 'justify-between px-1.5' : 'justify-center'
              }`}
            >
              {sidebarExpanded && (
                <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 truncate">
                  {organisation?.name || 'Workspace'}
                </span>
              )}
              <button
                type="button"
                onClick={toggleSidebar}
                aria-expanded={sidebarExpanded}
                aria-label={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
                title={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
                className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                {sidebarExpanded ? (
                  <PanelLeftClose className="w-4 h-4" />
                ) : (
                  <PanelLeftOpen className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Scrollable Navigation Stack */}
            <nav
              aria-label="Primary Navigation"
              className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-1 py-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <NavLink
                to="/dashboard"
                title="Dashboard"
                className={({ isActive }) =>
                  `shrink-0 rounded-xl flex items-center transition-all cursor-pointer ${
                    sidebarExpanded
                      ? 'px-3 py-2.5 gap-3 text-[13.5px] font-medium'
                      : 'w-10 h-10 justify-center mx-auto'
                  } ${
                    isActive
                      ? 'bg-[#107C41] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
                  }`
                }
              >
                <LayoutGrid className="w-[17px] h-[17px] shrink-0" />
                {sidebarExpanded && <span className="truncate">Dashboard</span>}
              </NavLink>

              {hrLinks.length > 0 && (
                <div className="pt-3 flex flex-col gap-1">
                  {sidebarExpanded ? (
                    <span className="px-3 pb-1 text-[10.5px] font-medium uppercase tracking-wider text-slate-400">
                      Workforce & HR
                    </span>
                  ) : (
                    <div className="mx-2 my-1.5 border-t border-slate-100" />
                  )}
                  {hrLinks.map((link) => {
                    const active = location.pathname.startsWith(link.to);
                    const Icon = link.icon;
                    return (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        title={link.name}
                        className={`shrink-0 rounded-xl flex items-center transition-all cursor-pointer ${
                          sidebarExpanded
                            ? 'px-3 py-2.5 gap-3 text-[13.5px] font-medium'
                            : 'w-10 h-10 justify-center mx-auto'
                        } ${
                          active
                            ? 'bg-emerald-50/90 text-[#107C41] font-medium'
                            : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
                        }`}
                      >
                        <Icon className="w-[17px] h-[17px] shrink-0" />
                        {sidebarExpanded && <span className="truncate">{link.name}</span>}
                      </NavLink>
                    );
                  })}
                </div>
              )}

              {opsLinks.length > 0 && (
                <div className="pt-3 flex flex-col gap-1">
                  {sidebarExpanded ? (
                    <span className="px-3 pb-1 text-[10.5px] font-medium uppercase tracking-wider text-slate-400">
                      Assets & Access
                    </span>
                  ) : (
                    <div className="mx-2 my-1.5 border-t border-slate-100" />
                  )}
                  {opsLinks.map((link) => {
                    const active = location.pathname.startsWith(link.to);
                    const Icon = link.icon;
                    return (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        title={link.name}
                        className={`shrink-0 rounded-xl flex items-center transition-all cursor-pointer ${
                          sidebarExpanded
                            ? 'px-3 py-2.5 gap-3 text-[13.5px] font-medium'
                            : 'w-10 h-10 justify-center mx-auto'
                        } ${
                          active
                            ? 'bg-emerald-50/90 text-[#107C41] font-medium'
                            : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
                        }`}
                      >
                        <Icon className="w-[17px] h-[17px] shrink-0" />
                        {sidebarExpanded && <span className="truncate">{link.name}</span>}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </nav>
          </div>

          {/* Bottom Actions (Settings & Logout) */}
          <div className="flex flex-col gap-1 w-full shrink-0 pt-3 border-t border-slate-100">
            <NavLink
              to="/settings"
              title="Settings"
              className={({ isActive }) =>
                `rounded-xl flex items-center transition-all cursor-pointer ${
                  sidebarExpanded
                    ? 'px-3 py-2.5 gap-3 text-[13.5px] font-medium'
                    : 'w-10 h-10 justify-center mx-auto'
                } ${
                  isActive
                    ? 'bg-emerald-50/90 text-[#107C41] font-medium'
                    : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
                }`
              }
            >
              <Settings className="w-[17px] h-[17px] shrink-0" />
              {sidebarExpanded && <span className="truncate">Settings</span>}
            </NavLink>

            <button
              type="button"
              onClick={logout}
              title="Sign out"
              className={`rounded-xl flex items-center text-slate-600 hover:text-red-600 hover:bg-red-50/70 transition-all cursor-pointer ${
                sidebarExpanded
                  ? 'px-3 py-2.5 gap-3 text-[13.5px] font-medium w-full'
                  : 'w-10 h-10 justify-center mx-auto'
              }`}
            >
              <LogOut className="w-[17px] h-[17px] shrink-0" />
              {sidebarExpanded && <span className="truncate">Sign out</span>}
            </button>
          </div>
        </aside>

        {/* Main Column: Compact Top Controls + Content Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          <header className="w-full px-6 sm:px-9 pt-4 pb-2 shrink-0 z-30 select-none">
            <div className="max-w-[1440px] mx-auto w-full flex items-center justify-between lg:justify-end gap-4">
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                aria-label="Open navigation"
                className="lg:hidden w-9 h-9 rounded-full bg-white border border-slate-200/80 flex items-center justify-center text-slate-600 hover:text-slate-900 shadow-xs cursor-pointer"
              >
                <Menu className="w-4 h-4" />
              </button>

              {/* Right Action Controls */}
              <div className="flex items-center gap-2.5">
              {/* Search Button */}
              <button
                type="button"
                className="w-8 h-8 rounded-full bg-white border border-gray-200/80 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-50 shadow-xs transition-colors cursor-pointer"
                aria-label="Search"
                onClick={openSearch}
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
                          <button
                            key={n.id}
                            type="button"
                            onClick={() => markRead(n.id)}
                            className="w-full text-left py-2.5 hover:bg-gray-50/70 rounded-lg px-1 transition-colors cursor-pointer"
                          >
                            <p className="text-xs font-semibold text-gray-800">{n.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                            <span className="text-[10px] text-gray-400 mt-1 block">
                              {formatDate(n.createdAt, true)}
                            </span>
                          </button>
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
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0 min-h-0 overflow-y-auto workspace-scroll px-6 sm:px-9 pt-1 pb-12">
            <div className="max-w-[1440px] mx-auto w-full">
              <Outlet />
            </div>
          </main>
        </div>

      {/* Global Quick Search Modal */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-start justify-center pt-16 px-4"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-200/80 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Jump to Attendance, Leaves, Payroll, PF, Employees, Assets, or Requests…"
                className="w-full text-sm text-gray-900 outline-none placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer"
                aria-label="Close search"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto p-3 space-y-3">
              {!q && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2 mb-1.5">
                    Enterprise Modules
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {railLinks.map((l) => {
                      const Icon = l.icon;
                      return (
                        <button
                          key={l.to}
                          type="button"
                          onClick={() => {
                            navigate(l.to);
                            setSearchOpen(false);
                          }}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:text-[#107C41] text-left cursor-pointer"
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          <span>{l.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {q && matchedEmployees.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2 mb-1">
                    Employees
                  </div>
                  {matchedEmployees.map((emp) => (
                    <button
                      key={emp.id}
                      type="button"
                      onClick={() => {
                        navigate(`/employees/${emp.id}`);
                        setSearchOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-gray-50 text-left text-xs cursor-pointer"
                    >
                      <span className="font-semibold text-gray-900">
                        {emp.name} <span className="text-gray-400">({emp.employeeId})</span>
                      </span>
                      <span className="text-gray-500">{emp.designation}</span>
                    </button>
                  ))}
                </div>
              )}

              {q && matchedAssets.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2 mb-1">
                    Assets
                  </div>
                  {matchedAssets.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => {
                        navigate(`/assets/${a.id}`);
                        setSearchOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-gray-50 text-left text-xs cursor-pointer"
                    >
                      <span className="font-semibold text-gray-900">
                        {a.name} <span className="text-gray-400">({a.assetId})</span>
                      </span>
                      <span className="text-[#107C41] font-semibold">{a.status}</span>
                    </button>
                  ))}
                </div>
              )}

              {q && matchedRequests.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2 mb-1">
                    Requests
                  </div>
                  {matchedRequests.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        navigate('/requests');
                        setSearchOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-gray-50 text-left text-xs cursor-pointer"
                    >
                      <span className="font-semibold text-gray-900">
                        {r.requestNumber} · {r.title}
                      </span>
                      <span className="text-gray-500">{r.status}</span>
                    </button>
                  ))}
                </div>
              )}

              {q && matchedRoles.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2 mb-1">
                    Roles
                  </div>
                  {matchedRoles.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        navigate(`/roles/${r.id}`);
                        setSearchOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-gray-50 text-left text-xs cursor-pointer"
                    >
                      <span className="font-semibold text-gray-900">{r.name}</span>
                      <span className="text-gray-400">Role</span>
                    </button>
                  ))}
                </div>
              )}

              {q &&
                matchedEmployees.length === 0 &&
                matchedAssets.length === 0 &&
                matchedRequests.length === 0 &&
                matchedRoles.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-6">
                    No matching employees, assets, requests, or roles for &quot;{searchQuery}&quot;.
                  </p>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
