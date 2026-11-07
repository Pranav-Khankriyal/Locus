import type { Metadata } from 'next';
import './globals.css';
import '@/workspace.css';

export const metadata: Metadata = {
  title: 'Lokus - Enterprise Trust & Identity Platform',
  description: 'Enterprise Cryptographic Identity, RBAC, and Asset Management Platform',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-[#f4f6f8] text-gray-900 antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
