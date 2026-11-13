'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Eye, EyeOff, ShieldAlert, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') || '/';

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);

  // Poll / fetch status on load
  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch('/api/auth/status');
        if (res.ok) {
          const data = await res.json();
          if (data.isAuthenticated) {
            router.push(nextUrl);
            return;
          }
          if (data.isLocked) {
            setIsLocked(true);
            setRemainingSeconds(data.remainingSeconds);
          } else {
            setAttemptsRemaining(data.attemptsRemaining);
          }
        }
      } catch (e) {
        // Ignore network failure on check
      }
    }
    checkStatus();
  }, [nextUrl, router]);

  // Lockout countdown timer
  useEffect(() => {
    if (!isLocked || remainingSeconds <= 0) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          setIsLocked(false);
          setAttemptsRemaining(3);
          setErrorMsg('');
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLocked, remainingSeconds]);

  const formatCountdown = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked || isLoading || !password) return;

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsSuccess(true);
        setTimeout(() => {
          router.push(nextUrl);
          router.refresh();
        }, 600);
      } else {
        if (data.isLocked) {
          setIsLocked(true);
          setRemainingSeconds(data.remainingSeconds || 1800);
          setErrorMsg(data.error || 'Account locked for 30 minutes.');
        } else {
          setAttemptsRemaining(data.attemptsRemaining ?? 2);
          setErrorMsg(data.error || 'Incorrect password.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Connection failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0a0f1d] via-[#111827] to-[#040711] text-white flex flex-col justify-between selection:bg-red-500 selection:text-white relative overflow-hidden">
      
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header Branding */}
      <header className="relative z-10 w-full max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="px-3 py-1 bg-gradient-to-r from-red-600 to-red-700 text-white font-black text-xs tracking-widest uppercase rounded-lg shadow-md border border-red-500/40">
            MONOPOLY
          </div>
          <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
            THE MEGA EDITION
          </span>
        </div>
      </header>

      {/* Login Card (Password Field Only) */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          
          {/* Top gold bar accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-red-500 to-amber-500" />

          {/* Padlock Icon & Title */}
          <div className="flex flex-col items-center text-center">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg border transition-all ${
              isLocked 
                ? 'bg-red-950/80 border-red-500/50 text-red-400' 
                : isSuccess
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-400'
                : 'bg-gradient-to-br from-red-600 to-amber-600 border-red-400/40 text-white'
            }`}>
              {isSuccess ? (
                <CheckCircle2 className="w-7 h-7" />
              ) : isLocked ? (
                <ShieldAlert className="w-7 h-7 animate-pulse" />
              ) : (
                <Lock className="w-7 h-7" />
              )}
            </div>

            <h1 className="text-2xl font-black tracking-tight text-white mt-4">
              Game Access Login
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Enter the session password configured in your environment
            </p>
          </div>

          {/* Lockout Banner with Live Countdown Timer */}
          {isLocked && (
            <div className="mt-6 p-4 bg-red-950/60 border border-red-600/60 rounded-2xl text-center space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-xs font-mono font-black uppercase text-red-400 tracking-wider">
                <ShieldAlert className="w-4 h-4" />
                <span>30-Minute Security Lockout</span>
              </div>
              <p className="text-[11px] text-red-300">
                3 incorrect tries detected. Please wait before attempting again:
              </p>
              <div className="text-3xl font-mono font-black tracking-widest text-red-400 pt-1">
                {formatCountdown(remainingSeconds)}
              </div>
            </div>
          )}

          {/* Form: Password Field ONLY */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Game Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLocked || isLoading || isSuccess}
                  placeholder="Enter game password..."
                  required
                  autoFocus
                  className="w-full px-4 py-3.5 bg-slate-950/80 border border-slate-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/30 rounded-xl text-white font-mono text-sm placeholder:text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed outline-hidden transition-all pr-12"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLocked}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message & Attempts Remaining Badge */}
            {errorMsg && !isLocked && (
              <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {attemptsRemaining !== null && attemptsRemaining < 3 && !isLocked && (
              <div className="text-[11px] font-mono text-amber-400 text-center">
                ⚠️ {attemptsRemaining} attempt{attemptsRemaining === 1 ? '' : 's'} remaining before 30-min lockout
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLocked || isLoading || isSuccess || !password}
              className="w-full py-3.5 bg-gradient-to-r from-red-600 via-red-500 to-amber-500 hover:from-red-500 hover:to-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : isSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Access Granted! Redirecting...</span>
                </>
              ) : (
                <>
                  <span>Unlock Game</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Security Tip */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center text-[10px] font-mono text-slate-500">
            Protected with 3-strike brute-force lockout • 30-minute security cooldown
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-[11px] font-mono text-slate-600">
        Monopoly: The Mega Edition • Free & Open-Source
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-mono text-xs">Loading Security Gate...</div>}>
      <LoginForm />
    </Suspense>
  );
}
