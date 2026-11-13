import { NextResponse } from 'next/server';

// In-memory room registry for mapping 4-letter room codes to active Host Peer IDs
const roomRegistry = new Map<string, { hostPeerId: string; updatedAt: number }>();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { roomCode, hostPeerId } = body;
    if (!roomCode || !hostPeerId) {
      return NextResponse.json({ error: 'Missing roomCode or hostPeerId' }, { status: 400 });
    }

    const cleanCode = roomCode.toUpperCase().trim();
    roomRegistry.set(cleanCode, {
      hostPeerId,
      updatedAt: Date.now(),
    });

    return NextResponse.json({ success: true, roomCode: cleanCode, hostPeerId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code')?.toUpperCase().trim();

  if (!code) {
    return NextResponse.json({ error: 'Missing room code' }, { status: 400 });
  }

  const room = roomRegistry.get(code);
  if (!room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  }

  return NextResponse.json(room);
}
