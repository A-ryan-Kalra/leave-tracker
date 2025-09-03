// pages/ApproveRejectPage.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

import { api } from "@/utils/api";
import { Loader } from "lucide-react";

export default function ApproveRejectPage() {
  // const { id, action } = useParams();
  const [done, setDone] = useState(false);
  const [error, showError] = useState(false);
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status");
  const id = searchParams.get("id");
  const firedRef = useRef(false);

  useEffect(() => {
    if (!status || firedRef.current) return;

    firedRef.current = true;
    const endpoint =
      status === "APPROVED"
        ? `/dashboard/approve-leave-request/${id}`
        : `/dashboard/reject-leave-request/${id}`;
    api
      .patch(endpoint)
      .then(() => {
        setDone(true);
      })
      .catch((err) => {
        console.error(err);
        showError(true);
      });
  }, [id, status]);

  if (error)
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
                  {"Unknown error occurred"}
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
  if (!done)
    return (
      <div className="flex items-center w-full h-full justify-center">
        <p className="flex items-center  justify-center animate-spin">
          <Loader className="w-10 h-10" />
        </p>
      </div>
    );

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif", textAlign: "center" }}>
      <h2>
        Leave request {status === "APPROVED" ? "APPROVED" : "REJECTED"} ✅
      </h2>
      <p>You can close this tab or click the button below.</p>
      <button onClick={() => nav("/")}>Go to dashboard</button>
    </div>
  );
}
