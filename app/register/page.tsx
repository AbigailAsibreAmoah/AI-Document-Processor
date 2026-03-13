'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useAuth } from '../../lib/auth-context';
import { Mail, CheckCircle, XCircle } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { register } = useAuth();
  const router = useRouter();

  const inputStyle = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
  };

  const passwordRules = [
    { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
    { label: 'At least 1 uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
    { label: 'At least 1 number', test: (p: string) => /[0-9]/.test(p) },
    { label: 'At least 1 special character', test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
  ];

  const passwordValid = passwordRules.every(r => r.test(password));

  const sendOtp = async () => {
    if (!name) { setError('Please enter your name'); return; }
    if (!email) { setError('Please enter your email'); return; }
    if (!passwordValid) {
      setError('Please meet all password requirements');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setShowOtp(true);
        setSuccess(`Verification code sent to ${email}`);
      } else {
        setError(data.error || 'Failed to send verification code');
      }
    } catch {
      setError('Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!showOtp) {
      await sendOtp();
      return;
    }

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const verifyRes = await fetch(`/api/auth/send-otp?email=${encodeURIComponent(email)}&code=${otp}`);
      const verifyData = await verifyRes.json();

      if (!verifyData.success) {
        setError(verifyData.error || 'Invalid verification code');
        setLoading(false);
        return;
      }

      const success = await register(email, password, name);
      if (success) {
        router.push('/login');
      } else {
        setError('Registration failed. Email may already be in use.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'radial-gradient(ellipse at top, #1a1a2e 0%, #0f0f0f 50%, #000000 100%)' }}
    >
      <div className="w-full max-w-sm space-y-6">

        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-xl font-black text-black">D</span>
          </div>
          <h1 className="text-white text-2xl font-semibold">
            {showOtp ? 'Check your email' : 'Create your account'}
          </h1>
          {!showOtp && (
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-white font-medium hover:underline">
                Sign in
              </Link>
            </p>
          )}
          {showOtp && (
            <p className="text-gray-400 text-sm text-center">
              We sent a 6-digit code to <span className="text-white">{email}</span>
            </p>
          )}
        </div>

        {!showOtp && (
          <>
            {/* Social Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => signIn('google', { callbackUrl: '/oauth-callback' })}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-white font-medium transition-all"
                style={inputStyle}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
              >
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                  <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                  <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"/>
                  <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
                </svg>
                Continue with Google
              </button>

              <button
                type="button"
                onClick={() => signIn('github', { callbackUrl: '/oauth-callback' })}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-white font-medium transition-all"
                style={inputStyle}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
                Continue with GitHub
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.12)' }} />
              <span className="text-gray-500 text-sm">or</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.12)' }} />
            </div>

            {/* Form fields */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {[
                { label: 'Full Name', value: name, setter: setName, type: 'text', placeholder: 'Abigail Amoah' },
                { label: 'Email', value: email, setter: setEmail, type: 'email', placeholder: 'you@example.com' },
              ].map(({ label, value, setter, type, placeholder }) => (
                <div key={label}>
                  <label className="text-gray-300 text-sm mb-1.5 block">{label}</label>
                  <input
                    type={type}
                    value={value}
                    onChange={e => setter(e.target.value)}
                    placeholder={placeholder}
                    required
                    className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none transition-all"
                    style={inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
                  />
                </div>
              ))}

              <div>
                <label className="text-gray-300 text-sm mb-1.5 block">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none transition-all pr-12"
                    style={inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
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

                {/* Password rules */}
                {password.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {passwordRules.map(rule => (
                      <div key={rule.label} className="flex items-center gap-2">
                        {rule.test(password) ? (
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                        )}
                        <span className={`text-xs ${rule.test(password) ? 'text-emerald-400' : 'text-gray-500'}`}>
                          {rule.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {error && (
                <div className="px-4 py-3 rounded-xl text-red-400 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-medium transition-opacity disabled:opacity-60"
                style={{ background: 'rgba(255,255,255,0.9)', color: '#000' }}
                onMouseEnter={e => !loading && (e.currentTarget.style.background = '#ffffff')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.9)')}
              >
                {loading ? 'Sending code...' : 'Send Verification Code'}
              </button>
            </form>
          </>
        )}

        {/* OTP Step */}
        {showOtp && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-gray-300 text-sm mb-1.5 block">Verification Code</label>
              <div className="flex items-center gap-2 mb-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400 text-sm">Sent to {email}</span>
              </div>
              <input
                type="text"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                required
                className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none text-center text-2xl tracking-widest"
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
              />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl text-red-400 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                {error}
              </div>
            )}
            {success && (
              <div className="px-4 py-3 rounded-xl text-green-400 text-sm" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-medium transition-opacity disabled:opacity-60"
              style={{ background: 'rgba(255,255,255,0.9)', color: '#000' }}
            >
              {loading ? 'Verifying...' : 'Verify & Create Account'}
            </button>

            <div className="flex justify-center gap-6">
              <button type="button" onClick={sendOtp} className="text-gray-400 text-sm hover:text-white transition-colors">
                Resend code
              </button>
              <button
                type="button"
                onClick={() => { setShowOtp(false); setError(''); setSuccess(''); setOtp(''); }}
                className="text-gray-400 text-sm hover:text-white transition-colors"
              >
                ← Back
              </button>
            </div>
          </form>
        )}

        <p className="text-center text-gray-500 text-xs">
          By signing up, you agree to our{' '}
          <span className="text-gray-400 hover:text-white cursor-pointer transition-colors">Terms</span>
          {' '}and{' '}
          <span className="text-gray-400 hover:text-white cursor-pointer transition-colors">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}