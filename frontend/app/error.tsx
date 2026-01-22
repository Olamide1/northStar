'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center space-y-4 max-w-md">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="text-gray-600">{error.message || 'An unexpected error occurred'}</p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-black text-white font-semibold hover:bg-gray-800 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
