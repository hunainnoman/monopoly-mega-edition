'use client';

import React, { useState } from 'react';
import { Sparkles, Users } from 'lucide-react';

interface MobileLobbyJoinProps {
  initialRoomCode: string;
  onJoin: (roomCode: string, name: string, color: string, tokenIcon: string) => void;
  isLoading: boolean;
  errorMessage?: string | null;
}

const TOKEN_OPTIONS = ['🚗', '🎩', '🐕', '🚢', '🚀', '🐱', '🦖', '💎'];
const COLOR_OPTIONS = [
  '#2563EB', // Blue
  '#059669', // Emerald
  '#DC2626', // Red
  '#D97706', // Amber
  '#7C3AED', // Violet
  '#DB2777', // Pink
];

export function MobileLobbyJoin({ initialRoomCode, onJoin, isLoading, errorMessage }: MobileLobbyJoinProps) {
  const [roomCode, setRoomCode] = useState(initialRoomCode.toUpperCase());
  const [name, setName] = useState('');
  const [selectedToken, setSelectedToken] = useState(TOKEN_OPTIONS[0]);
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim() || !name.trim()) return;
    onJoin(roomCode.trim().toUpperCase(), name.trim(), selectedColor, selectedToken);
  };

  return (
    <div className="w-full min-h-screen bg-slate-900 flex flex-col justify-center px-4 py-8 select-none text-white">
      <div className="w-full max-w-sm mx-auto bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
        <div className="text-center mb-6">
          <div className="inline-block p-2 bg-red-600/20 text-red-400 rounded-xl mb-2">
            <Sparkles className="w-6 h-6 text-red-500" />
          </div>
          <h1 className="text-xl font-black tracking-wide uppercase">Mega Companion</h1>
          <p className="text-xs text-slate-400 mt-1">Connect your phone as a Monopoly controller</p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl text-center">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Room Code
            </label>
            <input
              type="text"
              maxLength={6}
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="e.g. MEGA"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-center font-mono font-black text-lg tracking-widest text-indigo-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Your Name
            </label>
            <input
              type="text"
              maxLength={15}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter player name"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Choose Token
            </label>
            <div className="grid grid-cols-4 gap-2">
              {TOKEN_OPTIONS.map((token) => (
                <button
                  type="button"
                  key={token}
                  onClick={() => setSelectedToken(token)}
                  className={`p-2 text-xl rounded-xl border transition-all ${
                    selectedToken === token
                      ? 'bg-indigo-600 border-indigo-400 scale-105 shadow-md'
                      : 'bg-slate-900 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {token}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Player Color
            </label>
            <div className="flex justify-between gap-1">
              {COLOR_OPTIONS.map((color) => (
                <button
                  type="button"
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  style={{ backgroundColor: color }}
                  className={`w-9 h-9 rounded-full border-2 transition-all ${
                    selectedColor === color ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-70'
                  }`}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !name.trim() || !roomCode.trim()}
            className="w-full py-3 mt-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 font-bold text-sm text-white rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span>Connecting to Host...</span>
            ) : (
              <>
                <Users className="w-4 h-4" />
                Join Game Room
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
