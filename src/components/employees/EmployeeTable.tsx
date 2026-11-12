import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckSquare,
  ExternalLink,
  Pencil,
  Square,
  Trash2,
  X,
} from 'lucide-react';
import type { Employee } from '@/types';
import { Table, type Column } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { initials } from '@/utils/formatDate';

export function EmployeeTable({
  employees,
  units = {},
  roles = {},
  onEdit,
  onBulkDelete,
  emptyAction,
}: {
  employees: Employee[];
  units?: Record<string, string>;
  roles?: Record<string, string>;
  onEdit?: (e: Employee) => void;
  onBulkDelete?: (employees: Employee[]) => void;
  emptyAction?: ReactNode;
}) {
  const navigate = useNavigate();
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [contextMenu, setContextMenu] = useState<{
    employee: Employee;
    x: number;
    y: number;
  } | null>(null);

  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTapRef = useRef<{ id: string; time: number } | null>(null);

  const cancelPendingOpen = () => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => cancelPendingOpen();
  }, []);

  // Keep selectedIds synced with current filtered employees (e.g. after deletion)
  useEffect(() => {
    const valid = new Set(employees.map((e) => e.id));
    setSelectedIds((prev) => {
      const next = prev.filter((id) => valid.has(id));
      return next.length === prev.length ? prev : next;
    });
  }, [employees]);

  // Close floating right-click menu on outside click or Escape
  useEffect(() => {
    if (!contextMenu) return;
    const handleClose = () => setContextMenu(null);
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setContextMenu(null);
    };
    window.addEventListener('click', handleClose);
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('click', handleClose);
      window.removeEventListener('keydown', handleKey);
    };
  }, [contextMenu]);

  const toggleId = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const enterSelectionWith = (id: string) => {
    setSelectionMode(true);
    setSelectedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const selectAll = () => {
    setSelectionMode(true);
    setSelectedIds(employees.map((e) => e.id));
  };

  const deselectAll = () => {
    setSelectedIds([]);
  };

  const exitSelection = () => {
    setSelectionMode(false);
    setSelectedIds([]);
  };

  const selectedEmployees = employees.filter((e) => selectedIds.includes(e.id));
  const allSelected = employees.length > 0 && selectedIds.length === employees.length;

  const isInteractiveTarget = (target: EventTarget | null) =>
    target instanceof HTMLElement &&
    Boolean(target.closest('button, a, input, label'));

  const columns: Column<Employee>[] = [];

  if (selectionMode) {
    columns.push({
      key: 'select',
      title: (
        <input
          type="checkbox"
          aria-label="Select all employees"
          checked={allSelected}
          onChange={() => (allSelected ? deselectAll() : selectAll())}
          className="w-4 h-4 accent-[#107C41] rounded cursor-pointer"
        />
      ),
      render: (e) => (
        <input
          type="checkbox"
          aria-label={`Select ${e.name}`}
          checked={selectedIds.includes(e.id)}
          onChange={() => toggleId(e.id)}
          onClick={(ev) => ev.stopPropagation()}
          className="w-4 h-4 accent-[#107C41] rounded cursor-pointer"
        />
      ),
    });
  }

  columns.push(
    {
      key: 'id',
      title: 'Employee ID',
      render: (e) => <span className="mono">{e.employeeId}</span>,
    },
    {
      key: 'name',
      title: 'Name',
      render: (e) => (
        <div className="person-cell">
          <span className="avatar small">{initials(e.name)}</span>
          <div>
            <strong>{e.name}</strong>
            <small>{e.designation}</small>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      title: 'Email',
      render: (e) => e.email,
    },
    {
      key: 'unit',
      title: 'Unit',
      render: (e) => (
        <Link
          to={'/organisation/' + e.organisationUnitId}
          onClick={(ev) => ev.stopPropagation()}
        >
          {units[e.organisationUnitId] || e.organisationUnitId}
        </Link>
      ),
    },
    {
      key: 'role',
      title: 'Role',
      render: (e) => roles[e.role] || e.role,
    },
    {
      key: 'status',
      title: 'Status',
      render: (e) => <Badge>{e.status}</Badge>,
    }
  );

  if (onEdit) {
    columns.push({
      key: 'actions',
      title: 'Actions',
      render: (e) => (
        <div className="row-actions" onClick={(ev) => ev.stopPropagation()}>
          <Button
            variant="ghost"
            aria-label={'Edit ' + e.name}
            title="Edit employee"
            onClick={() => onEdit(e)}
          >
            <Pencil size={14} />
          </Button>
        </div>
      ),
    });
  }

  return (
    <>
      {selectionMode && (
        <div className="px-5 py-3 bg-emerald-50/80 border-y border-emerald-200/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#107C41] text-white text-xs font-bold">
              {selectedIds.length} selected
            </span>
            <span className="text-xs text-gray-600">
              Click any employee row to toggle selection
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={selectAll} disabled={allSelected}>
              <CheckSquare size={14} /> Select all ({employees.length})
            </Button>
            <Button
              variant="outline"
              onClick={deselectAll}
              disabled={selectedIds.length === 0}
            >
              <Square size={14} /> Deselect all
            </Button>
            {onBulkDelete && (
              <Button
                variant="destructive"
                disabled={selectedIds.length === 0}
                onClick={() => onBulkDelete(selectedEmployees)}
              >
                <Trash2 size={14} />{' '}
                {allSelected ? `Delete all (${selectedIds.length})` : `Delete selected (${selectedIds.length})`}
              </Button>
            )}
            <Button variant="ghost" onClick={exitSelection}>
              <X size={14} /> Cancel
            </Button>
          </div>
        </div>
      )}

      <Table
        rows={employees}
        caption="Employees"
        columns={columns}
        rowClassName={(row) => {
          const isSelected = selectedIds.includes(row.id);
          return `cursor-pointer transition-colors ${
            isSelected ? '!bg-emerald-50/70' : ''
          }`;
        }}
        onRowClick={(emp, event) => {
          if (isInteractiveTarget(event.target)) return;
          setContextMenu(null);

          if (selectionMode) {
            toggleId(emp.id);
            return;
          }

          const now = Date.now();
          if (
            lastTapRef.current &&
            lastTapRef.current.id === emp.id &&
            now - lastTapRef.current.time < 260
          ) {
            cancelPendingOpen();
            lastTapRef.current = null;
            enterSelectionWith(emp.id);
            return;
          }

          lastTapRef.current = { id: emp.id, time: now };
          cancelPendingOpen();
          openTimerRef.current = setTimeout(() => {
            lastTapRef.current = null;
            navigate('/employees/' + emp.id);
          }, 210);
        }}
        onRowDoubleClick={(emp, event) => {
          if (isInteractiveTarget(event.target)) return;
          cancelPendingOpen();
          lastTapRef.current = null;
          enterSelectionWith(emp.id);
        }}
        onRowContextMenu={(emp, event) => {
          event.preventDefault();
          cancelPendingOpen();
          lastTapRef.current = null;
          const x =
            typeof window !== 'undefined'
              ? Math.min(event.clientX, window.innerWidth - 230)
              : event.clientX;
          const y =
            typeof window !== 'undefined'
              ? Math.min(event.clientY, window.innerHeight - 250)
              : event.clientY;
          setContextMenu({ employee: emp, x, y });
        }}
        empty={
          <EmptyState
            title="No employees found"
            description="Add an employee, import a file, or adjust your filters."
            action={emptyAction}
          />
        }
      />

      {/* Right-click Context Menu */}
      {contextMenu && (
        <div
          role="menu"
          aria-label="Employee options"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(ev) => ev.stopPropagation()}
          className="fixed z-50 w-56 bg-white rounded-2xl shadow-xl border border-gray-200/90 p-1.5 text-xs select-none"
        >
          <div className="px-2.5 py-2 border-b border-gray-100 mb-1">
            <strong className="block text-gray-900 truncate">
              {contextMenu.employee.name}
            </strong>
            <span className="text-[11px] text-gray-400">
              {contextMenu.employee.employeeId}
            </span>
          </div>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              const id = contextMenu.employee.id;
              if (selectionMode) {
                toggleId(id);
              } else {
                enterSelectionWith(id);
              }
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl font-semibold text-gray-800 hover:bg-emerald-50 hover:text-[#107C41] text-left cursor-pointer"
          >
            <CheckSquare size={14} className="text-[#107C41]" />
            <span>
              {selectionMode
                ? selectedIds.includes(contextMenu.employee.id)
                  ? 'Deselect employee'
                  : 'Select employee'
                : 'Select employees'}
            </span>
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              const id = contextMenu.employee.id;
              setContextMenu(null);
              navigate('/employees/' + id);
            }}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl font-medium text-gray-700 hover:bg-gray-50 text-left cursor-pointer"
          >
            <ExternalLink size={14} className="text-gray-400" />
            <span>Open employee info</span>
          </button>

          {onEdit && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                const target = contextMenu.employee;
                setContextMenu(null);
                onEdit(target);
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl font-medium text-gray-700 hover:bg-gray-50 text-left cursor-pointer"
            >
              <Pencil size={14} className="text-gray-400" />
              <span>Edit details</span>
            </button>
          )}

          <div className="my-1 border-t border-gray-100" />

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              selectAll();
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl font-medium text-gray-700 hover:bg-gray-50 text-left cursor-pointer"
          >
            <CheckSquare size={14} className="text-gray-400" />
            <span>Select all ({employees.length})</span>
          </button>

          {selectedIds.length > 0 && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                deselectAll();
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl font-medium text-gray-700 hover:bg-gray-50 text-left cursor-pointer"
            >
              <Square size={14} className="text-gray-400" />
              <span>Deselect all</span>
            </button>
          )}

          {onBulkDelete && selectedIds.length > 0 && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setContextMenu(null);
                onBulkDelete(selectedEmployees);
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl font-semibold text-red-600 hover:bg-red-50 text-left cursor-pointer"
            >
              <Trash2 size={14} />
              <span>Delete selected ({selectedIds.length})</span>
            </button>
          )}
        </div>
      )}
    </>
  );
}
