'use client';

import dynamic from 'next/dynamic';

const App = dynamic(() => import('@/App'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#fbf9f5] flex flex-col items-center justify-center font-sans select-none">
      <div className="w-9 h-9 border-3 border-emerald-200 border-t-[#107C41] rounded-full animate-spin mb-4" />
      <div className="text-xs font-bold text-slate-500 tracking-widest uppercase">
        Loading Locus...
      </div>
    </div>
  ),
});

export default function CatchAllPage() {
  return <App />;
}

