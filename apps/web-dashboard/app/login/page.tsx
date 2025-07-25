'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { redirect } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import DemoNotice from '@/components/DemoNotice';
import { Gamepad2, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const router = useRouter();
  const { user, loading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      router.push('/app');
    }
  }, [user, loading, router]);

  // Don't render login form if user is already authenticated
  if (user && !loading) {
    return null;
  }

  const handleSuccess = () => {
    router.push('/app');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <DemoNotice />
      <div className="flex min-h-screen">
        {/* Left side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-12 items-center justify-center">
          <div className="text-white max-w-md">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Gamepad2 className="w-6 h-6" />
                </div>
                <h1 className="text-3xl font-bold">HomeHost</h1>
              </div>
              <h2 className="text-4xl font-bold mb-6">
                Game hosting made as easy as sharing Netflix
              </h2>
              <p className="text-xl text-indigo-100 mb-8">
                Deploy game servers in minutes, discover communities through friends, and build your gaming empire - all without technical headaches.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-indigo-100">
                <Sparkles className="w-5 h-5" />
                <span>One-click server deployment</span>
              </div>
              <div className="flex items-center gap-3 text-indigo-100">
                <Sparkles className="w-5 h-5" />
                <span>Social discovery - no more IP addresses</span>
              </div>
              <div className="flex items-center gap-3 text-indigo-100">
                <Sparkles className="w-5 h-5" />
                <span>Community-driven hosting</span>
              </div>
              <div className="flex items-center gap-3 text-indigo-100">
                <Sparkles className="w-5 h-5" />
                <span>Plugin marketplace & automation</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Auth Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Mobile branding */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Gamepad2 className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">HomeHost</h1>
              </div>
              <p className="text-gray-600">Game hosting made simple</p>
            </div>

            {mode === 'login' ? (
              <LoginForm
                onSwitchToSignup={() => setMode('signup')}
                onSuccess={handleSuccess}
              />
            ) : (
              <SignupForm
                onSwitchToLogin={() => setMode('login')}
                onSuccess={handleSuccess}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}