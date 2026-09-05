import React from 'react';
import { AlertTriangle, RefreshCw, Key } from 'lucide-react';

interface ErrorBannerProps {
  error: string;
  onRetry?: () => void;
  onReset?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ error, onRetry, onReset }) => {
  const isKeyError =
    error.toLowerCase().includes('api_key') ||
    error.toLowerCase().includes('gemini_api_key') ||
    error.toLowerCase().includes('api key');

  return (
    <div className="max-w-xl mx-auto my-8 p-6 bg-rose-50 border border-rose-200 rounded-2xl shadow-xs text-center">
      <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
        {isKeyError ? <Key className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
      </div>

      <h3 className="text-base font-bold text-rose-900 mb-2">
        {isKeyError ? 'Gemini API Key Required' : 'Processing Error Encountered'}
      </h3>

      <p className="text-xs text-rose-700 max-w-md mx-auto mb-6 leading-relaxed">
        {error}
      </p>

      <div className="flex items-center justify-center gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Request</span>
          </button>
        )}

        {onReset && (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-rose-300 text-rose-800 hover:bg-rose-100 text-xs font-semibold transition-colors cursor-pointer"
          >
            <span>Back to Search</span>
          </button>
        )}
      </div>
    </div>
  );
};
