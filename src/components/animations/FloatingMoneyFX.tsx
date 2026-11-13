'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Player } from '../../types/game';

interface MoneyEvent {
  id: string;
  playerName: string;
  amount: number; // positive = gain, negative = loss
  color: string;
  timestamp: number;
}

interface FloatingMoneyFXProps {
  players: Player[];
}

export function FloatingMoneyFX({ players }: FloatingMoneyFXProps) {
  const [events, setEvents] = useState<MoneyEvent[]>([]);
  const prevBalances = useRef<Record<string, number>>({});

  useEffect(() => {
    // Detect balance shifts
    players.forEach((p) => {
      const prev = prevBalances.current[p.id];
      if (prev !== undefined && prev !== p.balance) {
        const diff = p.balance - prev;
        const newEvent: MoneyEvent = {
          id: `${p.id}-${Date.now()}-${Math.random()}`,
          playerName: p.name,
          amount: diff,
          color: p.color,
          timestamp: Date.now(),
        };

        setEvents((prevEvents) => [...prevEvents.slice(-6), newEvent]);

        // Auto remove event after 2.5s
        setTimeout(() => {
          setEvents((curr) => curr.filter((e) => e.id !== newEvent.id));
        }, 2500);
      }
      prevBalances.current[p.id] = p.balance;
    });
  }, [players]);

  if (events.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden flex items-center justify-center">
      <AnimatePresence>
        {events.map((evt, idx) => {
          const isGain = evt.amount > 0;
          const displayAmount = Math.abs(evt.amount);

          return (
            <motion.div
              key={evt.id}
              initial={{ opacity: 0, scale: 0.5, y: 30 }}
              animate={{
                opacity: [0, 1, 1, 0],
                scale: [0.5, 1.25, 1, 0.9],
                y: -110,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.2, ease: 'easeOut' }}
              style={{ left: `${45 + (idx % 3) * 5}%`, top: `${45 + (idx % 2) * 5}%` }}
              className={`absolute flex flex-col items-center px-4 py-2 rounded-2xl shadow-2xl border-2 backdrop-blur-md ${
                isGain
                  ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-emerald-500/40'
                  : 'bg-red-950/80 border-red-500 text-red-300 shadow-red-500/40'
              }`}
            >
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-white/80">
                {evt.playerName}
              </div>
              <div className="text-2xl font-black font-mono tracking-tight flex items-center gap-0.5">
                <span>{isGain ? '+$' : '-$'}</span>
                <span>{displayAmount}</span>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
