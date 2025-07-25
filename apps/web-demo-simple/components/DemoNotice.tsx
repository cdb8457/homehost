'use client';

import { useState } from 'react';
import { AlertCircle, X, ExternalLink } from 'lucide-react';

export default function DemoNotice() {
  const [isVisible, setIsVisible] = useState(true);
  
  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 max-w-md bg-amber-50 border border-amber-200 rounded-lg p-4 shadow-lg z-50">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-medium text-amber-900">Demo Mode</h3>
          <p className="text-sm text-amber-700 mt-1">
            Authentication is running in demo mode. To enable full functionality, set up your Supabase project:
          </p>
          <div className="mt-3 space-y-2">
            <a 
              href="https://supabase.com/dashboard/new" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-amber-700 hover:text-amber-800"
            >
              1. Create Supabase Project
              <ExternalLink className="w-3 h-3" />
            </a>
            <p className="text-sm text-amber-700">
              2. Update <code className="bg-amber-100 px-1 rounded">.env.local</code> with your credentials
            </p>
            <p className="text-sm text-amber-700">
              3. Run the database schema from <code className="bg-amber-100 px-1 rounded">AUTH_SETUP.md</code>
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-amber-400 hover:text-amber-600 flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}