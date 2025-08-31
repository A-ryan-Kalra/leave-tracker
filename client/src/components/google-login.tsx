import { useGoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { googleAuth } from "../utils/api";
import { useNavigate } from "react-router";

function GoogleLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const naviage = useNavigate();

  const responseGoogle = async (authResult: any) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("Google auth result:", authResult);
      const result = await googleAuth(authResult.code, "TEAM_MEMBER");
      // const { email, role, avatarUrl } = result.data.user;
      const { token } = result.data;
      const payload = { token };
      localStorage.setItem("user-info", JSON.stringify(payload));
      naviage("/dashboard");

      // Handle successful authentication
      // You can redirect to dashboard or store user data here
    } catch (error) {
      console.error("Error while requesting google code:", error);
      setError("Failed to authenticate with Google. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const login = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: (error) => {
      console.error("Google login error:", error);
      setError("Google login failed. Please try again.");
      setIsLoading(false);
    },
    flow: "auth-code",
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Login</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <button
          onClick={() => {
            setIsLoading(true);
            setError(null);
            login();
          }}
          disabled={isLoading}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold py-2 px-4 rounded transition-colors flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Logging in...
            </>
          ) : (
            "Login with Google"
          )}
        </button>
      </div>
    </div>
  );
}

export default GoogleLogin;
