import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Copy, Check, Shield } from 'lucide-react';
import { useQuery } from '@/hooks/useQuery';
import { useSession } from '@/hooks/useSession';
import { useNotifications } from '@/hooks/useNotifications';
import { OrganisationService } from '@/services/OrganisationService';
import { EmployeeService } from '@/services/EmployeeService';
import { AssetService } from '@/services/AssetService';
import { ReferenceService } from '@/services/ReferenceService';
import { api } from '@/services/api';
import { OrganisationTree } from '@/components/organisation/OrganisationTree';
import { OrganisationUnitCard } from '@/components/organisation/OrganisationUnitCard';
import { EmployeeTable } from '@/components/employees/EmployeeTable';
import { AssetCard } from '@/components/assets/AssetCard';
import { PageHeading, Panel, QueryState, Details, Tabs } from '@/components/ui/Page';
import { Button } from '@/components/ui/Button';
import { RecordEditor, ConfirmDialog } from '@/components/ui/RecordEditor';
import { EmptyState } from '@/components/ui/EmptyState';
import { descendantIds } from '@/utils/buildTree';
import { permissionScope } from '@/utils/permissions';

export default function OrganisationPage() {
  const { unitId } = useParams();
  const navigate = useNavigate();
  const { user, organisation, permissions, isOwner, isCoAdmin } = useSession();
  const { toast } = useNotifications();
  const [action, setAction] = useState<{ type: 'add' | 'edit' | 'delete'; id: string } | null>(null);
  const [tab, setTab] = useState('Overview');
  const [copiedCode, setCopiedCode] = useState(false);
  const [coAdmins, setCoAdmins] = useState<string[]>([]);
  const [coAdminInput, setCoAdminInput] = useState('');
  const [savingCoAdmins, setSavingCoAdmins] = useState(false);

  const query = useQuery(async () => {
    const [units, employees, assets, refs] = await Promise.all([
      OrganisationService.list(),
      EmployeeService.list(),
      AssetService.list(),
      ReferenceService.list(),
    ]);
    if (unitId && !units.some((u) => u.id === unitId)) {
      throw new Error('Organisation unit not found or outside your permitted scope.');
    }
    return { units, employees, assets, refs };
  }, unitId);

  useEffect(() => {
    if (!organisation?.id) return;
    void api
      .get<{ coAdminEmails: string[] }>(
        `/api/v1/organization/coadmins?organization_id=${organisation.id}`
      )
      .then((res) => setCoAdmins(res.coAdminEmails || []))
      .catch(() => undefined);
  }, [organisation?.id]);

  const data = query.data;
  const unit =
    data?.units.find((u) => u.id === unitId) ||
    data?.units.find((u) => !u.parentId) ||
    data?.units[0];
  const scope = permissionScope(permissions, 'organisation', 'manage');
  const canManage = (id: string) =>
    scope === 'all' ||
    (scope === 'team' && !!data && descendantIds(data.units, user!.organisationUnitId).includes(id));

  const editing = data?.units.find((u) => u.id === action?.id);
  const unitNames = Object.fromEntries((data?.units || []).map((u) => [u.id, u.name]));
  const roleNames = Object.fromEntries((data?.refs.roles || []).map((r) => [r.id, r.name]));

  const copyCompanyCode = () => {
    if (!organisation?.slug) return;
    void navigator.clipboard?.writeText(organisation.slug);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1800);
  };

  const updateCoAdminsList = async (next: string[]) => {
    if (!organisation?.id) return;
    setSavingCoAdmins(true);
    try {
      const res = await api.post<{ coAdminEmails: string[] }>(
        '/api/v1/organization/coadmins',
        { organization_id: organisation.id, co_admin_emails: next }
      );
      setCoAdmins(res.coAdminEmails);
      toast('Co-Admin access updated');
    } catch (err) {
      toast((err as Error).message || 'Failed to update Co-Admins', 'error');
    } finally {
      setSavingCoAdmins(false);
    }
  };

  const handleAddCoAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    const email = coAdminInput.trim().toLowerCase();
    if (!email || !email.includes('@')) return;
    if (!coAdmins.includes(email)) {
      void updateCoAdminsList([...coAdmins, email]);
    }
    setCoAdminInput('');
  };

  return (
    <>
      <PageHeading
        title="Organisation"
        actions={
          unit && canManage(unit.id) ? (
            <Button onClick={() => setAction({ type: 'add', id: unit.id })}>
              <Plus size={16} />
              Add unit
            </Button>
          ) : undefined
        }
      />

      {/* Owner / Co-Admin Governance Strip */}
      {(isOwner || isCoAdmin || scope === 'all') && organisation && (
        <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#107C41]">
              <Shield className="w-4 h-4" />
              <span>Enterprise Ownership &amp; Employee Join Code</span>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 text-sm text-slate-700">
              <span>Unique Company Code:</span>
              <code className="font-mono font-bold px-2.5 py-0.5 rounded-lg bg-emerald-50 text-[#107C41] border border-emerald-200">
                {organisation.slug}
              </code>
              <button
                type="button"
                onClick={copyCompanyCode}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-full border border-slate-200 hover:bg-slate-50 cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-[#107C41]" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCode ? 'Copied' : 'Copy Code'}
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
            <div className="flex flex-wrap items-center gap-1.5">
              {coAdmins.map((email) => (
                <span
                  key={email}
                  className="inline-flex items-center gap-1 text-xs font-medium bg-emerald-50 text-[#107C41] border border-emerald-200 rounded-full px-2.5 py-1"
                >
                  {email}
                  <button
                    type="button"
                    disabled={savingCoAdmins}
                    onClick={() => void updateCoAdminsList(coAdmins.filter((x) => x !== email))}
                    className="text-emerald-700 hover:text-rose-600 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <form onSubmit={handleAddCoAdmin} className="flex items-center gap-2">
              <input
                type="email"
                placeholder="Add Co-Admin email..."
                value={coAdminInput}
                onChange={(e) => setCoAdminInput(e.target.value)}
                className="text-xs rounded-full border border-slate-200 px-3.5 py-1.5 bg-slate-50 focus:outline-none focus:border-emerald-600"
              />
              <Button variant="outline" type="submit" disabled={savingCoAdmins}>
                Add Co-Admin
              </Button>
            </form>
          </div>
        </div>
      )}

      <QueryState query={query}>
        {data && unit && (
          <div className="split-layout">
            <Panel title="Organisation structure" description="Branches · Departments · Teams">
              <OrganisationTree
                units={data.units}
                selected={unit.id}
                onAction={(type, id) => setAction({ type, id })}
                canManage={canManage}
              />
            </Panel>
            <div>
              <Panel
                title={unit.name}
                description={unit.type}
                actions={
                  canManage(unit.id) ? (
                    <div className="inline">
                      <Button
                        variant="ghost"
                        aria-label="Edit selected unit"
                        onClick={() => setAction({ type: 'edit', id: unit.id })}
                      >
                        <Pencil size={16} />
                      </Button>
                      {unit.parentId && (
                        <Button
                          variant="ghost"
                          aria-label="Delete selected unit"
                          onClick={() => setAction({ type: 'delete', id: unit.id })}
                        >
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </div>
                  ) : undefined
                }
              >
                <div className="panel-body">
                  <Details
                    items={[
                      ['Type', unit.type],
                      [
                        'Parent',
                        unit.parentId ? (
                          <Link to={'/organisation/' + unit.parentId}>{unitNames[unit.parentId]}</Link>
                        ) : (
                          'Root unit'
                        ),
                      ],
                      [
                        'Manager',
                        data.refs.employees.find((e) => e.id === unit.managerId)?.name || 'Not assigned',
                      ],
                      [
                        'People and assets',
                        unit.employeeCount + ' employees · ' + unit.assetCount + ' assets',
                      ],
                    ]}
                  />
                </div>
              </Panel>
              <div style={{ marginTop: 24 }}>
                <Tabs tabs={['Overview', 'Employees', 'Assets']} active={tab} onChange={setTab} />
                {tab === 'Overview' && (
                  <Panel title="Child units">
                    <div className="panel-body">
                      {data.units.some((u) => u.parentId === unit.id) ? (
                        <div className="cards-grid">
                          {data.units
                            .filter((u) => u.parentId === unit.id)
                            .map((u) => (
                              <OrganisationUnitCard key={u.id} unit={u} />
                            ))}
                        </div>
                      ) : (
                        <EmptyState
                          title="No child units"
                          description="This unit is the last level in this branch."
                          action={
                            canManage(unit.id) ? (
                              <Button onClick={() => setAction({ type: 'add', id: unit.id })}>
                                Add child unit
                              </Button>
                            ) : undefined
                          }
                        />
                      )}
                    </div>
                  </Panel>
                )}
                {tab === 'Employees' && (
                  <Panel>
                    <EmployeeTable
                      employees={data.employees.filter((e) => e.organisationUnitId === unit.id)}
                      units={unitNames}
                      roles={roleNames}
                    />
                  </Panel>
                )}
                {tab === 'Assets' && (
                  <Panel>
                    <div className="panel-body">
                      {data.assets.some((a) => a.organisationUnitId === unit.id) ? (
                        <div className="cards-grid">
                          {data.assets
                            .filter((a) => a.organisationUnitId === unit.id)
                            .map((a) => (
                              <AssetCard key={a.id} asset={a} />
                            ))}
                        </div>
                      ) : (
                        <EmptyState
                          title="No assets in this unit"
                          description="Assets appear here when registered or assigned to this team."
                          action={
                            <Link className="btn btn-outline" to="/assets">
                              Browse assets
                            </Link>
                          }
                        />
                      )}
                    </div>
                  </Panel>
                )}
              </div>
            </div>
          </div>
        )}
      </QueryState>

      {action && data && action.type !== 'delete' && (
        <RecordEditor
          title={action.type === 'add' ? 'Add organisation unit' : 'Edit organisation unit'}
          onClose={() => setAction(null)}
          initial={
            action.type === 'edit' && editing
              ? {
                  name: editing.name,
                  type: editing.type,
                  parentId: editing.parentId || '',
                  managerId: editing.managerId || '',
                }
              : { type: 'Department', parentId: action.id }
          }
          fields={[
            { key: 'name', label: 'Unit name', required: true },
            {
              key: 'type',
              label: 'Unit type',
              required: true,
              options: ['Company', 'Headquarters', 'Branch', 'Division', 'Department', 'Team'].map(
                (v) => ({ value: v, label: v })
              ),
            },
            {
              key: 'parentId',
              label: 'Parent unit',
              required: action.type === 'add' || !!editing?.parentId,
              disabled: action.type === 'edit' && !editing?.parentId,
              options: data.units
                .filter(
                  (u) =>
                    canManage(u.id) &&
                    (action.type === 'add' || !descendantIds(data.units, action.id).includes(u.id))
                )
                .map((u) => ({ value: u.id, label: u.name })),
            },
            {
              key: 'managerId',
              label: 'Manager',
              options: data.refs.employees
                .filter((e) => !e.deletedAt && e.status === 'Active')
                .map((e) => ({ value: e.id, label: e.name })),
            },
          ]}
          onSave={async (v) => {
            const input = {
              name: v.name,
              type: v.type,
              parentId: v.parentId || null,
              managerId: v.managerId || null,
            };
            const saved =
              action.type === 'add'
                ? await OrganisationService.create(input)
                : await OrganisationService.update(action.id, input);
            toast('Organisation unit saved');
            navigate('/organisation/' + saved.id);
          }}
        />
      )}

      {action?.type === 'delete' && (
        <ConfirmDialog
          title="Delete organisation unit?"
          message={
            'Delete ' +
            editing?.name +
            '? Move its employees, assets and child units first. Audit history is retained.'
          }
          label="Delete unit"
          destructive
          onClose={() => setAction(null)}
          onConfirm={async () => {
            await OrganisationService.delete(action.id);
            toast('Organisation unit deleted');
            navigate('/organisation');
          }}
        />
      )}
    </>
  );
}
