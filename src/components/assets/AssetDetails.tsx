import { Link } from 'react-router-dom';
import type { Asset, AssetAssignment } from '@/types';
import { Panel, Details } from '@/components/ui/Page';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/utils/formatDate';

export function AssetDetails({
  asset,
  assignment,
  names,
  unitName,
  organisationName,
}: {
  asset: Asset;
  assignment?: AssetAssignment;
  names: Record<string, string>;
  unitName: string;
  organisationName: string;
}) {
  return (
    <div className="dashboard-grid">
      <Panel title="Asset information">
        <div className="panel-body">
          <Details
            items={[
              ['Asset ID', <span key="id" className="mono">{asset.assetId}</span>],
              ['Type', asset.type],
              ['Serial number', asset.serialNumber || '—'],
              ['Condition', asset.condition],
              ['Location', asset.locationId || 'HQ'],
              ['Organisation unit', <Link key="u" to={'/organisation/' + asset.organisationUnitId}>{unitName}</Link>],
              ['Registered', formatDate(asset.createdAt)],
              ['Expiry', formatDate(asset.expiresAt)],
            ]}
          />
        </div>
      </Panel>
      <Panel title="Ownership & Cryptographic Integrity">
        <div className="panel-body">
          <Details
            items={[
              ['Owner', organisationName],
              [
                'Current assignee',
                asset.currentAssigneeId ? (
                  <Link key="assignee" to={'/employees/' + asset.currentAssigneeId}>
                    {names[asset.currentAssigneeId] || asset.currentAssigneeId}
                  </Link>
                ) : (
                  'Unassigned'
                ),
              ],
              ['Assigned by', assignment ? names[assignment.assignedById] || assignment.assignedById : '—'],
              ['Assigned on', formatDate(assignment?.assignedAt)],
              ['Asset status', <Badge key="st">{asset.status}</Badge>],
              ['Integrity Seal', <Badge key="seal">{asset.blockchainStatus === 'Verified' ? 'Verified Seal' : (asset.blockchainStatus || 'Pending')}</Badge>],
            ]}
          />
        </div>
      </Panel>
    </div>
  );
}
