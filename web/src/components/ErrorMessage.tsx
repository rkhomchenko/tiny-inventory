import type { ApiError } from '@/types';

interface ErrorMessageProps {
  error: Error | ApiError | unknown;
  title?: string;
  onRetry?: () => void;
}

export function ErrorMessage({ error, title = 'Error', onRetry }: ErrorMessageProps) {
  const getMessage = () => {
    if (error && typeof error === 'object' && 'message' in error) {
      return String(error.message);
    }
    return 'An unexpected error occurred';
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-red-800">{title}</h3>
            <p className="mt-2 text-sm text-red-700">{getMessage()}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
