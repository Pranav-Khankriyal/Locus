import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Network,
  Users,
  ShieldCheck,
  Package,
  Laptop,
  FileBadge,
  History,
  ScanLine,
  Settings,
  LogOut,
  X,
  ChevronDown,
  Clock,
  Umbrella,
  IndianRupee,
  ClipboardList,
} from 'lucide-react';
import { useSession } from '@/hooks/useSession';
import { can } from '@/utils/permissions';
import { initials } from '@/utils/formatDate';
import type { Resource } from '@/types';
import { Button } from '@/components/ui/Button';

const navigation = [
  { section: 'MAIN', links: [{ name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard }] },
  { section: 'ORGANISATION', links: [{ name: 'Organisation', to: '/organisation', icon: Network, resource: 'organisation' }] },
  {
    section: 'WORKFORCE & HR',
    links: [
      { name: 'Attendance', to: '/attendance', icon: Clock, resource: 'attendance' },
      { name: 'Leaves', to: '/leaves', icon: Umbrella, resource: 'leaves' },
      { name: 'Payroll & PF', to: '/payroll', icon: IndianRupee, resource: 'payroll' },
      { name: 'Requests', to: '/requests', icon: ClipboardList, resource: 'requests' },
    ],
  },
  {
    section: 'MANAGEMENT',
    links: [
      { name: 'Employees', to: '/employees', icon: Users, resource: 'employees' },
      { name: 'Roles & Permissions', to: '/roles', icon: ShieldCheck, resource: 'roles' },
    ],
  },
  {
    section: 'ASSETS',
    links: [
      { name: 'All Assets', to: '/assets', icon: Package, resource: 'assets', end: true },
      { name: 'Physical Assets', to: '/assets/physical', icon: Laptop, resource: 'assets' },
      { name: 'Digital Assets', to: '/assets/digital', icon: FileBadge, resource: 'assets' },
    ],
  },
  {
    section: 'VERIFICATION',
    links: [
      { name: 'Audit History', to: '/audit', icon: History, resource: 'audit' },
      { name: 'Verification Engine', to: '/verification', icon: ScanLine, resource: 'verification' },
    ],
  },
  { section: 'SETTINGS', links: [{ name: 'Settings', to: '/settings', icon: Settings }] },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, organisation, permissions, logout } = useSession();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      <button
        type="button"
        aria-label="Close navigation"
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <aside
        id="workspace-navigation"
        role="dialog"
        aria-modal="true"
        aria-label="Workspace navigation"
        className="relative z-10 w-72 max-w-[85vw] h-full bg-white border-r border-gray-200/80 shadow-2xl flex flex-col justify-between p-4 overflow-y-auto select-none"
      >
        <div>
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0 p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-zinc-950 text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-xs">
                {initials(organisation?.name || 'ACME')}
              </span>
              <div className="min-w-0 flex-1">
                <strong className="block text-xs font-bold text-zinc-900 truncate">
                  {organisation?.name || 'Acme Corporation'}
                </strong>
                <small className="block text-[11px] text-zinc-400">Enterprise DID Tier</small>
              </div>
              <ChevronDown size={14} className="text-zinc-400 shrink-0" />
            </div>
            <Button variant="ghost" aria-label="Close navigation" onClick={onClose}>
              <X size={18} />
            </Button>
          </div>

          <nav className="mt-4 space-y-4" aria-label="Workspace navigation">
            {navigation.map((group) => {
              const links = group.links.filter(
                (link) => !('resource' in link) || can(permissions, link.resource as Resource)
              );
              return links.length ? (
                <div key={group.section} className="space-y-1">
                  <p className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    {group.section}
                  </p>
                  <div className="space-y-0.5">
                    {links.map((link) => (
                      <NavLink
                        key={link.name}
                        aria-label={link.name}
                        title={link.name}
                        end={'end' in link ? Boolean(link.end) : false}
                        to={link.to}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-900 font-semibold border-l-2 border-emerald-600 shadow-xs'
                              : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                          }`
                        }
                      >
                        <link.icon size={16} className="text-emerald-600" />
                        <span>{link.name}</span>
                      </NavLink>
                    ))}
                  </div>
                </div>
              ) : null;
            })}
          </nav>
        </div>

        <div className="pt-4 mt-4 border-t border-zinc-100 space-y-3">
          <div className="flex items-center gap-2 px-2 text-[11px] font-semibold text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Workspace Active · Connected
          </div>
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-zinc-50 border border-zinc-200/70">
            <span className="w-8 h-8 rounded-full bg-zinc-950 text-white font-bold text-xs flex items-center justify-center shrink-0">
              {initials(user?.name || 'U')}
            </span>
            <div className="min-w-0 flex-1">
              <strong className="block text-xs font-bold text-zinc-900 truncate">
                {user?.name || 'Admin'}
              </strong>
              <small className="block text-[11px] text-zinc-400 truncate">
                {user?.designation || 'Workspace administrator'}
              </small>
            </div>
            <Button variant="ghost" aria-label="Sign out" onClick={logout}>
              <LogOut size={16} />
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
}
