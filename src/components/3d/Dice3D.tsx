'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SpeedDieFace } from '../../types/game';

// Pip layouts for faces 1 to 6
function DiceFace({ value, isBlue = false, isBus = false, isMrMono = false }: { 
  value?: number; 
  isBlue?: boolean; 
  isBus?: boolean; 
  isMrMono?: boolean 
}) {
  const pipColor = isBlue ? 'bg-white' : 'bg-slate-900';
  const faceBg = isBlue 
    ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800 text-white border-blue-400' 
    : 'bg-gradient-to-br from-white via-slate-50 to-slate-200 text-slate-900 border-slate-300';

  return (
    <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center p-2 shadow-inner select-none ${faceBg}`}>
      {isBus ? (
        <div className="flex flex-col items-center">
          <span className="text-xl">🚌</span>
          <span className="text-[8px] font-black uppercase tracking-tight text-yellow-300 leading-none">BUS</span>
        </div>
      ) : isMrMono ? (
        <div className="flex flex-col items-center">
          <span className="text-xl">🎩</span>
          <span className="text-[7.5px] font-black uppercase tracking-tighter text-amber-200 leading-none">MR.MONO</span>
        </div>
      ) : (
        <div className="w-full h-full relative">
          {/* Face 1 */}
          {value === 1 && (
            <div className={`w-3.5 h-3.5 rounded-full ${isBlue ? 'bg-white' : 'bg-red-600'} absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-inner`} />
          )}

          {/* Face 2 */}
          {value === 2 && (
            <>
              <div className={`w-2.5 h-2.5 rounded-full ${pipColor} absolute top-1 left-1 shadow-inner`} />
              <div className={`w-2.5 h-2.5 rounded-full ${pipColor} absolute bottom-1 right-1 shadow-inner`} />
            </>
          )}

          {/* Face 3 */}
          {value === 3 && (
            <>
              <div className={`w-2.5 h-2.5 rounded-full ${pipColor} absolute top-1 left-1 shadow-inner`} />
              <div className={`w-2.5 h-2.5 rounded-full ${pipColor} absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-inner`} />
              <div className={`w-2.5 h-2.5 rounded-full ${pipColor} absolute bottom-1 right-1 shadow-inner`} />
            </>
          )}

          {/* Face 4 */}
          {value === 4 && (
            <>
              <div className={`w-2.5 h-2.5 rounded-full ${pipColor} absolute top-1 left-1 shadow-inner`} />
              <div className={`w-2.5 h-2.5 rounded-full ${pipColor} absolute top-1 right-1 shadow-inner`} />
              <div className={`w-2.5 h-2.5 rounded-full ${pipColor} absolute bottom-1 left-1 shadow-inner`} />
              <div className={`w-2.5 h-2.5 rounded-full ${pipColor} absolute bottom-1 right-1 shadow-inner`} />
            </>
          )}

          {/* Face 5 */}
          {value === 5 && (
            <>
              <div className={`w-2.5 h-2.5 rounded-full ${pipColor} absolute top-1 left-1 shadow-inner`} />
              <div className={`w-2.5 h-2.5 rounded-full ${pipColor} absolute top-1 right-1 shadow-inner`} />
              <div className={`w-2.5 h-2.5 rounded-full ${pipColor} absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-inner`} />
              <div className={`w-2.5 h-2.5 rounded-full ${pipColor} absolute bottom-1 left-1 shadow-inner`} />
              <div className={`w-2.5 h-2.5 rounded-full ${pipColor} absolute bottom-1 right-1 shadow-inner`} />
            </>
          )}

          {/* Face 6 */}
          {value === 6 && (
            <>
              <div className={`w-2.5 h-2.5 rounded-full ${pipColor} absolute top-1 left-1 shadow-inner`} />
              <div className={`w-2.5 h-2.5 rounded-full ${pipColor} absolute top-1 right-1 shadow-inner`} />
              <div className={`w-2.5 h-2.5 rounded-full ${pipColor} absolute top-1/2 left-1 -translate-y-1/2 shadow-inner`} />
              <div className={`w-2.5 h-2.5 rounded-full ${pipColor} absolute top-1/2 right-1 -translate-y-1/2 shadow-inner`} />
              <div className={`w-2.5 h-2.5 rounded-full ${pipColor} absolute bottom-1 left-1 shadow-inner`} />
              <div className={`w-2.5 h-2.5 rounded-full ${pipColor} absolute bottom-1 right-1 shadow-inner`} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

// 3D Animated Tumbling Die Cube
export function Die3D({ 
  value, 
  isSpeedDie = false, 
  speedFace, 
  rollKey = 0 
}: { 
  value: number; 
  isSpeedDie?: boolean; 
  speedFace?: SpeedDieFace; 
  rollKey?: number;
}) {
  return (
    <div className="relative flex flex-col items-center">
      {/* 3D Tumbling Cube with Physics Shadow */}
      <motion.div
        key={rollKey}
        initial={{ 
          rotateX: Math.random() * 360 + 720, 
          rotateY: Math.random() * 360 + 720, 
          rotateZ: Math.random() * 180,
          scale: 0.7, 
          y: -40 
        }}
        animate={{ 
          rotateX: 0, 
          rotateY: 0, 
          rotateZ: 0, 
          scale: 1, 
          y: 0 
        }}
        transition={{ 
          type: 'spring', 
          stiffness: 260, 
          damping: 18, 
          mass: 1.2 
        }}
        className="cursor-pointer"
      >
        <DiceFace
          value={typeof speedFace === 'number' ? speedFace : value}
          isBlue={isSpeedDie}
          isBus={isSpeedDie && speedFace === 'bus'}
          isMrMono={isSpeedDie && speedFace === 'mr_monopoly'}
        />
      </motion.div>

      {/* Physics Floor Shadow (Squashes and fades as die falls) */}
      <motion.div
        key={`shadow-${rollKey}`}
        initial={{ scale: 0.3, opacity: 0.2 }}
        animate={{ scale: 1, opacity: 0.6 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className="w-10 h-2 bg-slate-900/30 rounded-full blur-[2px] mt-1"
      />
    </div>
  );
}
