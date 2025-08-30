import { useRouteError } from "react-router";

export default function ErrorBoundary() {
  const error = useRouteError() as Error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Oops! Something went wrong
          </h1>
          <p className="text-gray-600 mb-6">
            We're sorry, but something unexpected happened. Please try again.
          </p>
          {import.meta.env.DEV && (
            <details className="text-left bg-gray-100 p-4 rounded">
              <summary className="cursor-pointer font-semibold text-gray-700 mb-2">
                Error Details (Development)
              </summary>
              <pre className="text-sm text-red-600 whitespace-pre-wrap">
                {error?.message || "Unknown error occurred"}
              </pre>
            </details>
          )}
          <div className="mt-6">
            <button
              onClick={() => (window.location.href = "/")}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
