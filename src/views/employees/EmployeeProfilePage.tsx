import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import { useQuery } from '@/hooks/useQuery';
import { useSession } from '@/hooks/useSession';
import { useNotifications } from '@/hooks/useNotifications';
import { EmployeeService } from '@/services/EmployeeService';
import { AssetService } from '@/services/AssetService';
import { IdentityService } from '@/services/IdentityService';
import { AuditService } from '@/services/AuditService';
import { ReferenceService } from '@/services/ReferenceService';
import { EmployeeProfile } from '@/components/employees/EmployeeProfile';
import { EmployeeEditor } from '@/components/employees/EmployeeEditor';
import { ConfirmDialog } from '@/components/ui/RecordEditor';
import { PageHeading, QueryState } from '@/components/ui/Page';
import { Button } from '@/components/ui/Button';
import { can } from '@/utils/permissions';
import { initials } from '@/utils/formatDate';

export default function EmployeeProfilePage() {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const { permissions } = useSession();
  const { toast } = useNotifications();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const query = useQuery(async () => {
    const employee = await EmployeeService.getById(employeeId!);
    const [assets, identity, audit, refs] = await Promise.all([
      AssetService.list({ assigneeId: employee.id }),
      IdentityService.getByEmployeeId(employee.id),
      AuditService.personal(employee.id),
      ReferenceService.list(),
    ]);
    return { employee, assets, identity, audit, refs };
  }, employeeId);

  const d = query.data;
  const manage = can(permissions, 'employees', 'manage');

  return (
    <>
      <PageHeading
        title={d?.employee.name || 'Employee profile'}
        actions={
          d && manage ? (
            <div className="inline-flex flex-wrap items-center gap-2">
              <Button variant="outline" onClick={() => setEditing(true)}>
                <Pencil size={16} /> Edit employee
              </Button>
              <Button variant="destructive" onClick={() => setDeleting(true)}>
                <Trash2 size={16} /> Delete employee
              </Button>
            </div>
          ) : undefined
        }
      />

      <QueryState query={query}>
        {d && (
          <>
            <div className="profile-heading">
              <span className="avatar large">{initials(d.employee.name)}</span>
              <div>
                <strong>{d.employee.name}</strong>
                <p className="subtle">{d.employee.email}</p>
              </div>
            </div>
            <EmployeeProfile
              employee={d.employee}
              assets={d.assets}
              identity={d.identity}
              audit={d.audit}
              units={d.refs.units}
              manager={
                d.refs.employees.find((e) => e.id === d.employee.managerId)?.name
              }
              roleName={
                d.refs.roles.find((r) => r.id === d.employee.role)?.name ||
                d.employee.role
              }
            />
          </>
        )}
      </QueryState>

      {editing && d && (
        <EmployeeEditor employee={d.employee} onClose={() => setEditing(false)} />
      )}

      {deleting && d && (
        <ConfirmDialog
          title="Delete employee?"
          message={`Remove ${d.employee.name} from the employee directory? Their audit and assignment history will be retained.`}
          label="Delete employee"
          destructive
          onClose={() => setDeleting(false)}
          onConfirm={async () => {
            await EmployeeService.delete(d.employee.id);
            toast('Employee deleted');
            navigate('/employees', { replace: true });
          }}
        />
      )}
    </>
  );
}
