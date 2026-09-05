import { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';

export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState('enter'); // enter → logo → text → exit

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('logo'),  100);
    const t2 = setTimeout(() => setPhase('text'),  700);
    const t3 = setTimeout(() => setPhase('exit'),  2000);
    const t4 = setTimeout(() => onDone(),          2600);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, [onDone]);

  return (
    <div
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center"
      style={{
        background: 'radial-gradient(ellipse at 40% 40%, rgba(34,197,94,0.06) 0%, #0d0d0d 70%)',
        opacity: phase === 'exit' ? 0 : 1,
        transition: phase === 'exit' ? 'opacity 0.5s ease-out' : 'none',
      }}
    >
      {/* Animated background rings */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
          style={{
            border: '1px solid rgba(34,197,94,0.06)',
            transform: `translate(-50%, -50%) scale(${phase === 'enter' ? 0.6 : 1})`,
            transition: 'transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full"
          style={{
            border: '1px solid rgba(34,197,94,0.09)',
            transform: `translate(-50%, -50%) scale(${phase === 'enter' ? 0.6 : 1})`,
            transition: 'transform 1.2s 0.1s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full"
          style={{
            border: '1px solid rgba(34,197,94,0.14)',
            transform: `translate(-50%, -50%) scale(${phase === 'enter' ? 0.6 : 1})`,
            transition: 'transform 1.2s 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        />
      </div>

      {/* Logo */}
      <div
        style={{
          opacity: phase === 'enter' ? 0 : 1,
          transform: phase === 'enter' ? 'scale(0.5)' : 'scale(1)',
          transition: 'opacity 0.5s ease-out, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <div
          className="w-24 h-24 rounded-3xl overflow-hidden mb-6 mx-auto"
          style={{
            boxShadow: '0 0 60px rgba(34,197,94,0.3), 0 0 120px rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.3)',
          }}
        >
          <img src="/icon-192.png" alt="BE" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Text */}
      <div
        style={{
          opacity: phase === 'text' || phase === 'exit' ? 1 : 0,
          transform: phase === 'text' || phase === 'exit' ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
          textAlign: 'center',
        }}
      >
        <h1 className="text-2xl font-black text-base-50 tracking-tight">Big Ethiopia</h1>
        <p
          className="text-sm font-bold uppercase tracking-[0.3em] mt-1"
          style={{ color: '#22c55e' }}
        >
          Finance Tracker
        </p>
      </div>

      {/* Loading bar */}
      <div
        className="absolute bottom-16 left-1/2 -translate-x-1/2 h-0.5 rounded-full overflow-hidden"
        style={{
          width: '80px',
          background: 'rgba(34,197,94,0.15)',
          opacity: phase === 'text' ? 1 : 0,
          transition: 'opacity 0.3s',
        }}
      >
        <div
          className="h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, #22c55e, #4ade80)',
            width: phase === 'text' ? '100%' : '0%',
            transition: 'width 1.2s ease-out',
          }}
        />
      </div>
    </div>
  );
}
