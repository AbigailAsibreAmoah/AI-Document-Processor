'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { PasswordInput } from '../../components/ui/password-input';
import { Label } from '../../components/ui/label';
import { FileText, Brain, Zap, Shield, Mail } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const router = useRouter();

  const sendOtp = async () => {
    if (!email) {
      setError('Please enter your email first');
      return;
    }
    
    setLoading(true);
    // Mock OTP sending - in real app, call API
    setTimeout(() => {
      setShowOtp(true);
      setLoading(false);
      setError('');
      alert('OTP sent to your email (Demo: use any 6-digit code)');
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!showOtp) {
      await sendOtp();
      return;
    }
    
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    
    setLoading(true);
    setError('');

    const success = await register(email, password, name);
    
    if (success) {
      router.push('/login');
    } else {
      setError('Registration failed. Please try again.');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Side - Branding */}
        <div className="hidden lg:block space-y-8">
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
              <h1 className="text-2xl font-bold text-slate-900">
                DocuMind AI
              </h1>
              <p className="text-slate-600 text-sm">Enterprise Document Intelligence</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-900">
              Join Enterprise Users
            </h2>
            <p className="text-lg text-slate-600">
              Create your secure account to access advanced document processing capabilities.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-slate-700" />
                </div>
                <span className="text-slate-700">Process confidential documents</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Brain className="w-4 h-4 text-slate-700" />
                </div>
                <span className="text-slate-700">Advanced AI analysis</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-slate-700" />
                </div>
                <span className="text-slate-700">Bank-level security</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <Card className="w-full shadow-xl border-0">
          <CardHeader className="text-center pb-8">
            <div className="lg:hidden flex items-center justify-center space-x-3 mb-4">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-slate-700 to-slate-900 rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <Zap className="w-1.5 h-1.5 text-white" />
                </div>
              </div>
              <span className="text-xl font-bold text-slate-900">
                DocuMind AI
              </span>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">Create Account</CardTitle>
            <p className="text-slate-600 mt-2">Secure registration with email verification</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {!showOtp ? (
                <>
                  <div>
                    <Label htmlFor="name" className="text-slate-700">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 h-11"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-slate-700">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 h-11"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="password" className="text-slate-700">Password</Label>
                    <PasswordInput
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-1 h-11"
                      placeholder="Create a secure password"
                      required
                    />
                  </div>
                </>
              ) : (
                <div>
                  <Label htmlFor="otp" className="text-slate-700">Verification Code</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Mail className="h-5 w-5 text-slate-500" />
                    <span className="text-sm text-slate-600">Sent to {email}</span>
                  </div>
                  <Input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="mt-2 h-11 text-center text-lg tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">Enter the 6-digit code sent to your email</p>
                </div>
              )}
              
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full h-11 bg-slate-900 hover:bg-slate-800" 
                disabled={loading}
              >
                {loading ? (
                  showOtp ? 'Verifying...' : 'Sending OTP...'
                ) : (
                  showOtp ? 'Verify & Create Account' : 'Send Verification Code'
                )}
              </Button>
            </form>
            
            {showOtp && (
              <div className="text-center">
                <button 
                  onClick={() => setShowOtp(false)}
                  className="text-slate-600 hover:text-slate-800 text-sm"
                >
                  ← Back to registration
                </button>
              </div>
            )}
            
            <div className="text-center">
              <p className="text-slate-600">
                Already have an account?{' '}
                <Link href="/login" className="text-slate-900 hover:text-slate-700 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
            
            <div className="bg-slate-50 border border-slate-200 rounded-md p-3">
              <p className="text-slate-700 text-sm text-center">
                <strong>Demo Mode:</strong> Use any 6-digit code for verification
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}