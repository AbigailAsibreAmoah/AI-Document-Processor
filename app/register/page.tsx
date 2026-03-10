'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useAuth } from '../../lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { PasswordInput } from '../../components/ui/password-input';
import { Label } from '../../components/ui/label';
import { FileText, Brain, Zap, Shield, Mail, Github } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { register } = useAuth();
  const router = useRouter();

  const sendOtp = async () => {
    if (!email) { setError('Please enter your email first'); return; }
    if (!name) { setError('Please enter your name first'); return; }
    if (!password || password.length < 6) { setError('Password must be at least 6 characters'); return; }

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
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-slate-950">

      {/* Ripple background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="ripple"></div>
        <div className="ripple ripple-delay"></div>
        <div className="ripple ripple-delay-2"></div>
      </div>

      <div className="relative w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

        {/* Left Side */}
        <div className="hidden lg:block space-y-8 text-white">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-slate-700 to-slate-900 rounded-xl flex items-center justify-center">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                <Zap className="w-2 h-2 text-white" />
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-bold">DocuMind AI</h1>
              <p className="text-slate-400 text-sm">Enterprise Document Intelligence</p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Join Enterprise Users</h2>
            <p className="text-lg text-slate-400">
              Create your secure account to access advanced document processing capabilities.
            </p>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-blue-400" />
                <span>Process confidential documents</span>
              </div>

              <div className="flex items-center space-x-3">
                <Brain className="w-5 h-5 text-purple-400" />
                <span>Advanced AI analysis</span>
              </div>

              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-green-400" />
                <span>Bank-level security</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <Card className="w-full shadow-xl border-0 bg-white/95 backdrop-blur">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-slate-900">
              Create Account
            </CardTitle>
            <p className="text-slate-600 text-sm mt-2">
              Secure registration with email verification
            </p>
          </CardHeader>

          <CardContent className="space-y-5">

            {/* OAuth buttons */}
            <div className="space-y-3">

              <Button
                type="button"
                variant="outline"
                className="w-full h-11"
                onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              >
                Continue with Google
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full h-11"
                onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
              >
                <Github className="w-4 h-4 mr-2" />
                Continue with GitHub
              </Button>

            </div>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200"></div>
              <span className="text-xs text-slate-500">OR</span>
              <div className="h-px flex-1 bg-slate-200"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {!showOtp ? (
                <>
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Password</Label>
                    <PasswordInput
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-1"
                      required
                    />
                  </div>
                </>
              ) : (
                <div>
                  <Label htmlFor="otp">Verification Code</Label>

                  <div className="flex items-center gap-2 mt-1 text-sm text-slate-600">
                    <Mail className="w-4 h-4" />
                    Sent to {email}
                  </div>

                  <Input
                    id="otp"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                    }
                    className="mt-2 text-center tracking-widest text-lg"
                    maxLength={6}
                    required
                  />
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-600 text-sm">
                  {success}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 bg-slate-900 hover:bg-slate-800"
                disabled={loading}
              >
                {loading
                  ? showOtp ? 'Verifying...' : 'Sending code...'
                  : showOtp ? 'Verify & Create Account' : 'Send Verification Code'}
              </Button>

            </form>

            <p className="text-center text-sm text-slate-600">
              Already have an account?{' '}
              <Link href="/login" className="text-slate-900 font-medium">
                Sign in
              </Link>
            </p>

          </CardContent>
        </Card>

      </div>

      {/* Ripple CSS */}
      <style jsx>{`
        .ripple {
          position: absolute;
          width: 400px;
          height: 400px;
          border-radius: 9999px;
          border: 2px solid rgba(255,255,255,0.05);
          animation: ripple 6s infinite;
        }

        .ripple-delay {
          animation-delay: 2s;
        }

        .ripple-delay-2 {
          animation-delay: 4s;
        }

        @keyframes ripple {
          0% {
            transform: scale(0.5);
            opacity: 0.7;
          }
          100% {
            transform: scale(3);
            opacity: 0;
          }
        }
      `}</style>

    </div>
  );
}