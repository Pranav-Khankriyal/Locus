import { Link } from 'react-router-dom';
import { Layers, ShieldCheck, Users, Package } from 'lucide-react';
import type { ReactNode } from 'react';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="auth-layout">
      <aside className="auth-story">
        <Link to="/" className="brand">
          <Layers className="text-emerald-400" />
          <span>
            LOKUS<span className="brand-light"> Platform</span>
          </span>
        </Link>
        <div>
          <p className="eyebrow">YOUR ORGANISATION, CONNECTED</p>
          <h1>
            One workspace.
            <br />
            Every identity.
            <br />
            <span>Complete clarity.</span>
          </h1>
          <p>Bring your people, permissions and assets together in a workspace built on cryptographic trust.</p>
          <div className="auth-features">
            {[
              [ShieldCheck, 'Cryptographic identities'],
              [Users, 'Role-based access control'],
              [Package, 'Connected enterprise assets'],
            ].map(([Icon, title]) => {
              const I = Icon as typeof Layers;
              return (
                <div key={String(title)}>
                  <I size={20} />
                  <span>{String(title)}</span>
                </div>
              );
            })}
          </div>
        </div>
        <small>Identity · RBAC · Assets · Integrity</small>
      </aside>
      <section className="auth-content">
        <div className="auth-card">{children}</div>
        <p className="auth-note">Lokus Enterprise Trust & Verification Platform</p>
      </section>
    </main>
  );
}
