import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8'
};

export function LoadingSpinner({ size = 'md', text, className = '' }: LoadingSpinnerProps) {
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin`} />
      {text && <span className="text-sm text-gray-600">{text}</span>}
    </div>
  );
}

export function LoadingPage({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="lg" text={text} />
      </div>
    </div>
  );
}

export function LoadingCard({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-8 text-center">
      <LoadingSpinner size="md" text={text} />
    </div>
  );
}

export default LoadingSpinner;