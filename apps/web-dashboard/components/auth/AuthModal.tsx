'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'signup';
}

export default function AuthModal({ isOpen, onClose, defaultMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Content */}
        <div className="p-8">
          {mode === 'login' ? (
            <LoginForm
              onSwitchToSignup={() => setMode('signup')}
              onSuccess={onClose}
            />
          ) : (
            <SignupForm
              onSwitchToLogin={() => setMode('login')}
              onSuccess={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}