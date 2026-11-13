'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function PlayRoomParamPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = params?.roomCode as string;

  useEffect(() => {
    if (roomCode) {
      router.replace(`/play?code=${roomCode}`);
    } else {
      router.replace('/play');
    }
  }, [roomCode, router]);

  return (
    <div className="w-full min-h-screen bg-slate-900 flex items-center justify-center text-white">
      <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
    </div>
  );
}
