'use client';

import { useEffect, useState } from 'react';

export default function CatchAllPage() {
  const [Component, setComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    import('@/App')
      .then((mod) => {
        setComponent(() => mod.default);
      })
      .catch((err) => {
        console.error('Failed to load Lokus client app:', err);
        setError(err?.message || String(err));
      });
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-[#f4f6f8] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-red-600 mb-2">Failed to load application</h2>
          <pre className="text-xs text-left bg-gray-50 border border-gray-100 p-3 rounded-lg overflow-x-auto text-gray-700 mb-4 whitespace-pre-wrap">
            {error}
          </pre>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-full bg-[#107C41] text-white text-xs font-semibold hover:bg-[#0d6836] transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  if (!Component) {
    return (
      <div className="min-h-screen bg-[#f4f6f8] flex flex-col items-center justify-center font-sans select-none">
        <div className="w-9 h-9 border-3 border-emerald-200 border-t-[#107C41] rounded-full animate-spin mb-4" />
        <div className="text-xs font-bold text-gray-500 tracking-widest uppercase">
          Loading Lokus...
        </div>
      </div>
    );
  }

  return <Component />;
}
