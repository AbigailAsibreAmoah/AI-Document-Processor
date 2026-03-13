'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useAuth } from '../../lib/auth-context';
import { X } from 'lucide-react';

// ── types ──────────────────────────────────────────────────────────────────
interface DocConfig {
  type: 'real' | 'neon';
  laneY: number;
  isMain: boolean;
  id: number;
}

// ── processing preview steps ───────────────────────────────────────────────
const STEPS = [
  { icon: '📄', label: 'Document uploaded', detail: 'PDF/DOCX parsed and queued', done: true },
  { icon: '🔍', label: 'Text extraction', detail: 'OCR + layer extraction complete', done: true },
  { icon: '🧠', label: 'AI analysis', detail: 'Clauses, entities & key data detected', done: true },
  { icon: '💬', label: 'Hakuna AI ready', detail: 'Ask anything about your document', done: false },
];

const AI_MESSAGES = [
  { role: 'ai', text: 'I\'ve analysed your contract. It contains 3 non-standard clauses on page 4.' },
  { role: 'user', text: 'What are the payment terms?' },
  { role: 'ai', text: 'Payment is due within 30 days of invoice. Late fees of 1.5% apply monthly.' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [msgIdx, setMsgIdx] = useState(0);
  const { login } = useAuth();
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const docsRef = useRef<any[]>([]);
  const counterRef = useRef(0);

  // ── animation ────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const docTypes = [
      { title: 'CONTRACT', lines: 9, stamp: 'DRAFT', color: '#e74c3c' },
      { title: 'INVOICE', lines: 7, stamp: 'PAID', color: '#2980b9' },
      { title: 'NDA', lines: 8, stamp: 'CONFIDENTIAL', color: '#e74c3c' },
      { title: 'LEGAL BRIEF', lines: 10, stamp: 'REVIEWED', color: '#2980b9' },
      { title: 'REPORT', lines: 8, stamp: 'APPROVED', color: '#2980b9' },
    ];
    const aiLabels = ['EXTRACTING...', 'PARSING...', 'ANALYZING...', 'INDEXING...', 'SUMMARIZING...'];
    const neonTags = ['ANALYZING', 'EXTRACTING', 'PARSED', 'AI SCAN', 'INDEXED'];

    class Doc {
      x: number; y: number; baseY: number; rot: number; drift: number;
      speed: number; isNeon: boolean; isMain: boolean; opacity: number;
      scale: number; type: any; aiLabel: string; neonTag: string;
      scanX: number; id: number; clickable: boolean;
      w: number; h: number;

      constructor(laneY: number, isMain: boolean, id: number) {
        this.id = id;
        this.isMain = isMain;
        this.isNeon = Math.random() > 0.5;
        this.w = this.isNeon ? 108 : 118;
        this.h = this.isNeon ? 142 : 152;
        this.x = (canvas?.width ?? 1200) + 30 + Math.random() * 60;
        this.baseY = laneY;
        this.y = laneY + (Math.random() - 0.5) * (isMain ? 50 : 18);
        this.rot = (Math.random() - 0.5) * (isMain ? 8 : 5) * Math.PI / 180;
        this.drift = (Math.random() - 0.5) * (isMain ? 40 : 20);
        this.speed = isMain ? 1.1 + Math.random() * 0.5 : 0.8 + Math.random() * 0.4;
        this.opacity = 0;
        this.scale = isMain ? 1 : 0.72;
        this.type = docTypes[Math.floor(Math.random() * docTypes.length)];
        this.aiLabel = aiLabels[Math.floor(Math.random() * aiLabels.length)];
        this.neonTag = neonTags[Math.floor(Math.random() * neonTags.length)];
        this.scanX = 0;
        this.clickable = isMain;
      }

      get screenX() { return this.x; }
      get screenY() { return this.y + this.drift * (1 - this.x / (canvas?.width ?? 1200)); }

      update() {
        this.x -= this.speed;
        this.scanX = (this.scanX + 2) % (this.w + 60);
        if (this.x > (canvas?.width ?? 1200) - 200) {
          this.opacity = Math.min(1, this.opacity + 0.03);
        } else if (this.x < -this.w - 50) {
          this.opacity = Math.max(0, this.opacity - 0.05);
        } else {
          this.opacity = Math.min(this.isMain ? 1 : 0.55, this.opacity + 0.02);
        }
        return this.x > -this.w - 100;
      }

      hitTest(mx: number, my: number): boolean {
        if (!this.clickable) return false;
        const hw = (this.w * this.scale) / 2;
        const hh = (this.h * this.scale) / 2;
        return mx >= this.x - hw && mx <= this.x + hw &&
               my >= this.screenY - hh && my <= this.screenY + hh;
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.x, this.screenY);
        ctx.rotate(this.rot);
        ctx.scale(this.scale, this.scale);

        const w = this.w, h = this.h;

        if (this.isNeon) {
          // neon doc
          ctx.beginPath();
          roundRect(ctx, -w/2, -h/2, w, h, 6);
          ctx.fillStyle = 'rgba(8,8,28,0.92)';
          ctx.fill();
          ctx.strokeStyle = `rgba(99,102,241,${0.4 + Math.sin(Date.now()/800)*0.15})`;
          ctx.lineWidth = 1;
          ctx.stroke();

          // glow
          ctx.shadowColor = 'rgba(99,102,241,0.4)';
          ctx.shadowBlur = 14;
          ctx.stroke();
          ctx.shadowBlur = 0;

          // header bar
          ctx.fillStyle = 'rgba(99,102,241,0.75)';
          ctx.beginPath();
          roundRect(ctx, -w/2+8, -h/2+10, w*0.55, 6, 3);
          ctx.fill();

          // text lines
          const lineWidths = [1,0.9,0.75,1,0.6,0.88,0.45,1,0.7,0.88];
          for (let i = 0; i < 8; i++) {
            const ly = -h/2 + 24 + i * 11;
            const lw = (lineWidths[i] || 0.8) * (w - 16);
            const isHl = i === 2 || i === 5;
            ctx.fillStyle = isHl ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.07)';
            ctx.beginPath();
            roundRect(ctx, -w/2+8, ly, lw, isHl ? 4 : 3.5, 2);
            ctx.fill();

            // scan beam
            if (i === 2 || i === 4) {
              const bx = -w/2 + 8 + (this.scanX % (lw + 40)) - 20;
              const grad = ctx.createLinearGradient(bx, ly, bx+30, ly);
              grad.addColorStop(0, 'transparent');
              grad.addColorStop(0.5, 'rgba(99,102,241,0.9)');
              grad.addColorStop(1, 'transparent');
              ctx.fillStyle = grad;
              ctx.beginPath();
              roundRect(ctx, Math.max(-w/2+8, bx), ly, Math.min(30, lw), 3.5, 2);
              ctx.fill();
            }
          }

          // tag
          ctx.fillStyle = 'rgba(99,102,241,0.85)';
          ctx.font = '5px monospace';
          ctx.fillText(this.neonTag + '...', -w/2+8, h/2-18);

          // badge
          ctx.strokeStyle = 'rgba(99,102,241,0.7)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(w/2-14, h/2-14, 8, 0, Math.PI*2);
          ctx.stroke();
          ctx.fillStyle = 'rgba(99,102,241,0.9)';
          ctx.font = '7px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('✓', w/2-14, h/2-11);
          ctx.textAlign = 'left';

        } else {
          // real paper doc
          ctx.beginPath();
          roundRect(ctx, -w/2, -h/2, w, h, 3);
          ctx.fillStyle = '#f5f4ef';
          ctx.shadowColor = 'rgba(99,102,241,0.2)';
          ctx.shadowBlur = 12;
          ctx.fill();
          ctx.shadowBlur = 0;

          // dog ear
          ctx.beginPath();
          ctx.moveTo(w/2-16, -h/2);
          ctx.lineTo(w/2, -h/2+16);
          ctx.lineTo(w/2-16, -h/2+16);
          ctx.closePath();
          ctx.fillStyle = '#ccc8be';
          ctx.fill();

          // title
          ctx.fillStyle = '#1a1a2e';
          ctx.font = 'bold 5.5px sans-serif';
          ctx.fillText(this.type.title, -w/2+9, -h/2+18);

          // text lines
          const lws = [1,0.9,0.75,0.6,1,0.9,0.45,0.75,0.9,1];
          for (let i = 0; i < this.type.lines; i++) {
            const ly = -h/2 + 26 + i * 9;
            if (ly > h/2 - 28) break;
            const lw = lws[i % lws.length] * (w - 18);
            const isHl = i === 3;
            ctx.fillStyle = isHl ? 'rgba(99,102,241,0.22)' : '#c8c5bc';
            ctx.beginPath();
            roundRect(ctx, -w/2+9, ly, lw, isHl ? 4 : 3, 1);
            ctx.fill();
          }

          // scan beam over paper
          const bx = -w/2 + (this.scanX % (w+40));
          const grad = ctx.createLinearGradient(bx, -h/2, bx+25, -h/2);
          grad.addColorStop(0, 'transparent');
          grad.addColorStop(0.5, 'rgba(99,102,241,0.35)');
          grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad;
          ctx.beginPath();
          roundRect(ctx, bx, -h/2+2, 25, h-28, 0);
          ctx.fill();

          // stamp
          ctx.save();
          ctx.translate(w/2-20, h/2-32);
          ctx.rotate(-0.18);
          ctx.strokeStyle = this.type.color === '#e74c3c' ? 'rgba(180,30,30,0.5)' : 'rgba(30,80,180,0.5)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          roundRect(ctx, 0, 0, ctx.measureText(this.type.stamp).width + 6, 9, 1);
          ctx.stroke();
          ctx.fillStyle = this.type.color === '#e74c3c' ? 'rgba(180,30,30,0.6)' : 'rgba(30,80,180,0.6)';
          ctx.font = 'bold 4px sans-serif';
          ctx.fillText(this.type.stamp, 3, 7);
          ctx.restore();

          // AI bar
          ctx.fillStyle = 'rgba(99,102,241,0.13)';
          ctx.beginPath();
          roundRect(ctx, -w/2, h/2-20, w, 20, 0);
          ctx.fill();
          ctx.strokeStyle = 'rgba(99,102,241,0.35)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(-w/2, h/2-20); ctx.lineTo(w/2, h/2-20);
          ctx.stroke();

          // dots
          for (let d = 0; d < 3; d++) {
            const pulse = 0.4 + Math.sin(Date.now()/400 + d*0.5) * 0.4;
            ctx.fillStyle = `rgba(99,102,241,${pulse})`;
            ctx.beginPath();
            ctx.arc(-w/2+8+d*7, h/2-10, 2, 0, Math.PI*2);
            ctx.fill();
          }

          ctx.fillStyle = 'rgba(99,102,241,0.85)';
          ctx.font = '4px monospace';
          ctx.fillText(this.aiLabel, -w/2+28, h/2-7);
        }

        // clickable glow hint for main docs
        if (this.isMain) {
          ctx.strokeStyle = 'rgba(255,255,255,0.12)';
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 4]);
          ctx.beginPath();
          roundRect(ctx, -w/2-4, -h/2-4, w+8, h+8, 8);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        ctx.restore();
      }
    }

    function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
      ctx.beginPath();
      ctx.moveTo(x+r, y);
      ctx.lineTo(x+w-r, y);
      ctx.quadraticCurveTo(x+w, y, x+w, y+r);
      ctx.lineTo(x+w, y+h-r);
      ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
      ctx.lineTo(x+r, y+h);
      ctx.quadraticCurveTo(x, y+h, x, y+h-r);
      ctx.lineTo(x, y+r);
      ctx.quadraticCurveTo(x, y, x+r, y);
      ctx.closePath();
    }

    // spawn timing
    let lastMain = 0, lastTop = 0, lastBottom = 0;
    const MAIN_INTERVAL = 5000;
    const TRICKLE_INTERVAL = 11000;

    function spawnIfNeeded(now: number) {
      const H = canvas?.height ?? 800;
      const mainY = H * 0.45;
      const topY = H * 0.1;
      const bottomY = H * 0.82;

      if (now - lastMain > MAIN_INTERVAL) {
        docsRef.current.push(new Doc(mainY, true, counterRef.current++));
        lastMain = now;
      }
      if (now - lastTop > TRICKLE_INTERVAL + 3000) {
        docsRef.current.push(new Doc(topY, false, counterRef.current++));
        lastTop = now;
      }
      if (now - lastBottom > TRICKLE_INTERVAL + 5000) {
        docsRef.current.push(new Doc(bottomY, false, counterRef.current++));
        lastBottom = now;
      }
    }

    // seed initial docs
    const H0 = canvas.height;
    docsRef.current.push(new Doc(H0 * 0.45, true, counterRef.current++));
    docsRef.current.push(new Doc(H0 * 0.1, false, counterRef.current++));

    function loop(now: number) {
      ctx.clearRect(0, 0, canvas?.width ?? 1200, canvas?.height ?? 800);
      spawnIfNeeded(now);
      docsRef.current = docsRef.current.filter(d => {
        const alive = d.update();
        if (alive) d.draw(ctx);
        return alive;
      });
      animRef.current = requestAnimationFrame(loop);
    }
    animRef.current = requestAnimationFrame(loop);

    // click handler
    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      for (const doc of docsRef.current) {
        if (doc.hitTest(mx, my)) {
          setShowModal(true);
          setStepIdx(0);
          setMsgIdx(0);
          break;
        }
      }
    };
    canvas.addEventListener('click', handleClick);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('click', handleClick);
    };
  }, []);

  // ── modal step animation ──────────────────────────────────────────────────
  useEffect(() => {
    if (!showModal) return;
    setStepIdx(0); setMsgIdx(0);
    const intervals: ReturnType<typeof setTimeout>[] = [];
    STEPS.forEach((_, i) => {
      intervals.push(setTimeout(() => setStepIdx(i + 1), (i + 1) * 700));
    });
    intervals.push(setTimeout(() => setMsgIdx(1), 3500));
    intervals.push(setTimeout(() => setMsgIdx(2), 4800));
    intervals.push(setTimeout(() => setMsgIdx(3), 6200));
    return () => intervals.forEach(clearTimeout);
  }, [showModal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const success = await login(email, password);
    if (success) router.push('/dashboard');
    else setError('Invalid email or password');
    setLoading(false);
  };

  const inputStyle = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at top, #1a1a2e 0%, #0f0f0f 50%, #000000 100%)' }}>

      {/* Canvas animation layer */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ cursor: 'default' }} />

      {/* Login card */}
      <div className="relative z-10 w-full max-w-sm space-y-6"
        style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(18px)', borderRadius: 20, padding: '2rem', border: '1px solid rgba(255,255,255,0.08)' }}>

        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-xl font-black text-black">D</span>
          </div>
          <h1 className="text-white text-2xl font-semibold">Log in to DocuMind</h1>
          <p className="text-gray-400 text-sm">
            Don't have an account?{' '}
            <Link href="/register" className="text-white font-medium hover:underline">Sign up</Link>
          </p>
        </div>

        <div className="space-y-3">
          <button type="button" onClick={() => signIn('google', { callbackUrl: '/oauth-callback' })}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-white font-medium transition-all"
            style={inputStyle}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}>
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
            </svg>
            Log in with Google
          </button>

          <button type="button" onClick={() => signIn('github', { callbackUrl: '/oauth-callback' })}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-white font-medium transition-all"
            style={inputStyle}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
            Log in with GitHub
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.12)' }} />
          <span className="text-gray-500 text-sm">or</span>
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.12)' }} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-gray-300 text-sm mb-1.5 block">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" required
              className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none transition-all"
              style={inputStyle}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')} />
          </div>

          <div>
            <div className="flex justify-between mb-1.5">
              <label className="text-gray-300 text-sm">Password</label>
              <button type="button" className="text-gray-400 text-sm hover:text-white transition-colors">Forgot your password?</button>
            </div>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••" required
                className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none transition-all pr-12"
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')} />
              <button type="button" onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                {showPassword ? (
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl text-red-400 text-sm"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl font-medium transition-opacity disabled:opacity-60"
            style={{ background: 'rgba(255,255,255,0.9)', color: '#000' }}
            onMouseEnter={e => !loading && (e.currentTarget.style.background = '#ffffff')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.9)')}>
            {loading ? 'Signing in...' : 'Log In'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-xs">
          By signing in, you agree to our{' '}
          <span className="text-gray-400 hover:text-white cursor-pointer transition-colors">Terms</span>
          {' '}and{' '}
          <span className="text-gray-400 hover:text-white cursor-pointer transition-colors">Privacy Policy</span>.
        </p>
      </div>

      {/* Processing preview modal */}
      {showModal && (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
          onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md rounded-2xl overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #0d0d1f 0%, #111827 100%)', border: '1px solid rgba(99,102,241,0.3)', boxShadow: '0 0 40px rgba(99,102,241,0.15)' }}
            onClick={e => e.stopPropagation()}>

            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-xs font-black text-black">D</span>
                </div>
                <span className="text-white font-medium text-sm">How DocuMind processes your documents</span>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Steps */}
            <div className="px-5 py-4 space-y-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {STEPS.map((step, i) => {
                const active = i < stepIdx;
                const current = i === stepIdx;
                return (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm transition-all"
                      style={{
                        background: active ? 'rgba(99,102,241,0.2)' : current ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.04)',
                        border: active ? '1px solid rgba(99,102,241,0.6)' : '1px solid rgba(255,255,255,0.1)',
                        boxShadow: active ? '0 0 8px rgba(99,102,241,0.3)' : 'none',
                      }}>
                      {active ? '✓' : current ? (
                        <div className="w-3 h-3 rounded-full border border-indigo-400 border-t-transparent animate-spin" />
                      ) : <span className="text-gray-600 text-xs">{i+1}</span>}
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: active ? '#fff' : 'rgba(255,255,255,0.35)' }}>{step.label}</p>
                      {active && <p className="text-xs mt-0.5" style={{ color: 'rgba(99,102,241,0.8)' }}>{step.detail}</p>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* AI chat preview */}
            <div className="px-5 py-4">
              <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider">Hakuna AI assistant</p>
              <div className="space-y-2">
                {AI_MESSAGES.slice(0, msgIdx).map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-xs px-3 py-2 rounded-xl text-xs"
                      style={{
                        background: msg.role === 'ai' ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.08)',
                        border: msg.role === 'ai' ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.1)',
                        color: msg.role === 'ai' ? 'rgba(180,185,255,0.95)' : 'rgba(255,255,255,0.85)',
                      }}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {msgIdx < AI_MESSAGES.length && stepIdx >= STEPS.length && (
                  <div className="flex justify-start">
                    <div className="px-3 py-2 rounded-xl" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                      <div className="flex gap-1">
                        {[0,1,2].map(d => (
                          <div key={d} className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: `${d*0.15}s` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="px-5 pb-4">
              <button onClick={() => setShowModal(false)}
                className="w-full py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', color: 'rgba(180,185,255,0.95)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.3)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.2)')}>
                Got it — let me sign in
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}