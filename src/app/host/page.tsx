'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { generateRoomCode } from '../../lib/p2p';
import { Loader2 } from 'lucide-react';

export default function HostIndexPage() {
  const router = useRouter();

  useEffect(() => {
    const code = generateRoomCode();
    router.replace(`/host/${code}`);
  }, [router]);

  return (
    <div className="w-full h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
      <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
      <p className="text-sm text-slate-400 font-mono">Generating new room code...</p>
    </div>
  );
}
