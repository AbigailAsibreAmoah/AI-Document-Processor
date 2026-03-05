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
import { FileText, Brain, Zap, Shield } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const success = await login(email, password);
    
    if (success) {
      router.push('/dashboard');
    } else {
      setError('Invalid email or password');
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
              Secure Access Portal
            </h2>
            <p className="text-lg text-slate-600">
              Access your enterprise-grade document processing workspace with advanced AI capabilities.
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
            <CardTitle className="text-2xl font-bold text-slate-900">Sign In</CardTitle>
            <p className="text-slate-600 mt-2">Access your secure document workspace</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="Enter your password"
                  required
                />
              </div>
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
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
            
            <div className="text-center">
              <p className="text-slate-600">
                Don't have an account?{' '}
                <Link href="/register" className="text-slate-900 hover:text-slate-700 font-medium">
                  Create one
                </Link>
              </p>
            </div>
            
            <div className="bg-slate-50 border border-slate-200 rounded-md p-3">
              <p className="text-slate-700 text-sm text-center">
                <strong>Demo Mode:</strong> Use any email/password to create and test the system
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}