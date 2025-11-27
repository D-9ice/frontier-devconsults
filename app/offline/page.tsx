'use client';

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <svg className="mx-auto w-24 h-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">You're Offline</h1>
        <p className="text-lg text-gray-600 mb-8">
          It looks like you've lost your internet connection. Please check your network and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
        >
          Try Again
        </button>
        <div className="mt-8 text-sm text-gray-500">
          <p>Or contact us when you're back online:</p>
          <p className="mt-2">
            <strong>Email:</strong> info@frontier-devconsults.com
          </p>
          <p>
            <strong>Phone:</strong> +233 249 078 976
          </p>
        </div>
      </div>
    </main>
  );
}
