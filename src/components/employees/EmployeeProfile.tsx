import { Link, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import type { Employee, Asset, Identity, OrganisationUnit, AuditEvent } from '@/types';
import { Panel, Details, Tabs } from '@/components/ui/Page';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AssetCard } from '@/components/assets/AssetCard';
import { AuditTimeline } from '@/components/audit/AuditTimeline';
import { EmptyState } from '@/components/ui/EmptyState';
import { unitPath } from '@/utils/buildTree';
import { formatDate } from '@/utils/formatDate';
import { IntegrityService } from '@/services/IntegrityService';
import { useNotifications } from '@/hooks/useNotifications';

function IdentityActions({ employee, identity }: { employee: Employee; identity: Identity }) {
  const [anchoring, setAnchoring] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const { toast } = useNotifications();

  const doAnchor = async () => {
    setAnchoring(true);
    try {
      await IntegrityService.anchorIdentity(employee.id);
      toast('Cryptographic identity seal issued and verified successfully!');
      setTimeout(() => window.location.reload(), 1200);
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setAnchoring(false);
    }
  };

  const doVerify = async () => {
    setVerifying(true);
    try {
      const res = await IntegrityService.verifyIdentity(employee.id) as any;
      const verified = Boolean(res.data?.verified ?? res.data?.blockchain_verified ?? res.verified);
      toast(
        verified
          ? 'Canonical SHA-256 digest matches identity seal!'
          : 'Integrity discrepancy detected! Record does not match registered seal.',
        verified ? 'success' : 'error'
      );
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="inline" style={{ marginTop: 25, gap: 12 }}>
      <Button disabled={anchoring} onClick={doAnchor}>
        {anchoring ? 'Issuing...' : 'Issue Cryptographic Seal'}
      </Button>
      <Button variant="outline" disabled={verifying} onClick={doVerify}>
        {verifying ? 'Verifying...' : 'Verify Cryptographic Seal'}
      </Button>
    </div>
  );
}

export function EmployeeProfile({
  employee,
  assets,
  identity,
  units,
  audit,
  manager,
  roleName,
}: {
  employee: Employee;
  assets: Asset[];
  identity: Identity;
  units: OrganisationUnit[];
  audit: AuditEvent[];
  manager?: string;
  roleName: string;
}) {
  const [params, setParams] = useSearchParams();
  const tabs = ['Overview', 'Organisation', 'Assigned Assets', 'Identity', 'Activity'];
  const tab = tabs.includes(params.get('tab') || '') ? params.get('tab')! : 'Overview';

  return (
    <>
      <Tabs tabs={tabs} active={tab} onChange={(t) => setParams({ tab: t }, { replace: true })} />
      {tab === 'Overview' && (
        <Panel title="Employee information">
          <div className="panel-body">
            <Details
              items={[
                ['Employee ID', employee.employeeId],
                ['Full name', employee.name],
                ['Email', employee.email],
                ['Designation', employee.designation],
                ['Role', roleName],
                ['Status', <Badge key="emp-st">{employee.status}</Badge>],
                ['Identity status', <Badge key="id-st">{employee.identityStatus}</Badge>],
                ['Joined', formatDate(employee.createdAt)],
              ]}
            />
          </div>
        </Panel>
      )}
      {tab === 'Organisation' && (
        <Panel title="Organisation and reporting">
          <div className="panel-body">
            <Details
              items={[
                ['Organisation path', unitPath(units, employee.organisationUnitId).map((u) => u.name).join(' / ')],
                ['Current unit', <Link key="u-link" to={'/organisation/' + employee.organisationUnitId}>{units.find((u) => u.id === employee.organisationUnitId)?.name}</Link>],
                ['Reporting manager', manager || 'No reporting manager'],
                ['Designation', employee.designation],
              ]}
            />
          </div>
        </Panel>
      )}
      {tab === 'Assigned Assets' && (
        <Panel title="Assigned assets" description={assets.length + ' assets currently assigned'}>
          <div className="panel-body">
            {assets.length ? (
              <div className="cards-grid">
                {assets.map((a) => (
                  <AssetCard key={a.id} asset={a} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No assets assigned"
                description="Assets assigned to this employee will appear here."
                action={<Link className="btn btn-outline" to="/assets">Browse assets</Link>}
              />
            )}
          </div>
        </Panel>
      )}
      {tab === 'Identity' && (
        <Panel title="Identity details" description="Cryptographic identity credentials and DID">
          <div className="panel-body">
            <Details
              items={[
                ['Identity ID', identity.id],
                ['Decentralized identifier (DID)', <span key="did" className="mono">{identity.did}</span>],
                ['Seal status', <Badge key="st">{identity.status}</Badge>],
                ['Last verified', formatDate(identity.verifiedAt)],
                ['Employee reference', employee.employeeId],
              ]}
            />
            <IdentityActions employee={employee} identity={identity} />
          </div>
        </Panel>
      )}
      {tab === 'Activity' && (
        <Panel title="Employee activity">
          <AuditTimeline events={audit} />
        </Panel>
      )}
    </>
  );
}
