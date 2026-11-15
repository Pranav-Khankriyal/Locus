import { CheckCircle2, XCircle } from 'lucide-react';
import type { VerificationResultData } from '@/types';
import { Details } from '@/components/ui/Page';
import { formatDate } from '@/utils/formatDate';
import { Badge } from '@/components/ui/Badge';

export function VerificationResult({ result }: { result: VerificationResultData }) {
  const Icon = result.verified ? CheckCircle2 : XCircle;
  return (
    <section
      className="result-card"
      role="status"
      style={!result.verified ? { borderColor: '#f8717140', background: '#f8717107' } : undefined}
    >
      <div className="inline" style={{ marginBottom: 23 }}>
        <Icon size={26} color={result.verified ? '#4ade80' : '#fca5a5'} />
        <div>
          <h3 style={{ margin: 0 }}>{result.verified ? 'Integrity Verified' : 'Integrity Mismatch / Unverified'}</h3>
          <p className="subtle">{result.message}</p>
        </div>
      </div>
      <Details
        items={[
          [result.kind, result.name],
          ['Record ID', result.id],
          ['Current Code', result.record],
          ['Integrity Seal', <Badge key="seal-status">{result.verified ? 'Valid Seal' : 'Compromised / Unverified'}</Badge>],
          ['Cryptographic Seal Reference', <span key="seal-ref" className="mono">{result.transactionRef}</span>],
          ['Verified At', formatDate(result.checkedAt, true)],
        ]}
      />
      <p className="subtle" style={{ fontSize: 11, marginTop: 20 }}>
        Validated against Locus SHA-256 Canonical Digest Engine.
      </p>
    </section>
  );
}
