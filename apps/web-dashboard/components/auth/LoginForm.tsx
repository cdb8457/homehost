'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle,
  Chrome,
  MessageCircle
} from 'lucide-react';

interface LoginFormProps {
  onSwitchToSignup: () => void;
  onSuccess?: () => void;
}

export default function LoginForm({ onSwitchToSignup, onSuccess }: LoginFormProps) {
  const { signIn, loading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔐 Form submitted');
    setFormError(null);

    if (!formData.email || !formData.password) {
      console.log('🔐 Form validation failed');
      setFormError('Please fill in all fields');
      return;
    }

    console.log('🔐 Calling signIn...');
    const result = await signIn(formData.email, formData.password, formData.rememberMe);
    console.log('🔐 signIn result:', result);
    
    if (result.error) {
      console.log('🔐 Login error:', result.error);
      setFormError(result.error);
    } else {
      console.log('🔐 Login success, calling onSuccess');
      onSuccess?.();
    }
  };

  const displayError = formError || error;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
        <p className="text-gray-600">Sign in to continue your gaming journey</p>
      </div>

      {/* Note: Social login temporarily disabled */}
      {/* TODO: Implement OAuth integration with backend */}

      {/* Error Message */}
      {displayError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span className="text-red-700 text-sm">{displayError}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your password"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Remember Me */}
        <div className="flex items-center">
          <input
            id="rememberMe"
            type="checkbox"
            checked={formData.rememberMe}
            onChange={(e) => setFormData(prev => ({ ...prev, rememberMe: e.target.checked }))}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
            Remember me
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      {/* Switch to Signup */}
      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Don&apos;t have an account?{' '}
          <button
            onClick={onSwitchToSignup}
            className="text-indigo-600 hover:text-indigo-500 font-medium"
          >
            Sign up for free
          </button>
        </p>
      </div>
    </div>
  );
}