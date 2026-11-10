import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import type { VerificationResultData } from '@/types';
import { PageHeading, Panel, Tabs } from '@/components/ui/Page';
import { VerificationForm } from '@/components/verification/VerificationForm';

export default function VerificationPage() {
  const [tab, setTab] = useState<VerificationResultData['kind']>('Identity');
  return (
    <>
      <PageHeading
        title="Verification Center"
      />
      <div className="trust-strip">
        <div className="inline">
          <ShieldCheck size={23} className="text-emerald-400" />
          <p>
            Cryptographic verification engine validating SHA-256 canonical integrity digests and tamper-evident audit records.
          </p>
        </div>
      </div>
      <Panel title="Verify a record" description="Select the record type to check against registered integrity seals">
        <div className="panel-body">
          <Tabs
            tabs={['Identity', 'Asset', 'Authorization']}
            active={tab}
            onChange={(t) => setTab(t as VerificationResultData['kind'])}
          />
          <div style={{ maxWidth: 720 }}>
            <VerificationForm key={tab} kind={tab} />
          </div>
        </div>
      </Panel>
    </>
  );
}
