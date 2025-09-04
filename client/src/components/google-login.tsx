import { useState } from "react";

import { Navigate, useNavigate } from "react-router";
import { api, googleAuth } from "@/utils/api";
import {
  GoogleLogin as GoogleLoginBtn,
  useGoogleLogin,
} from "@react-oauth/google";
import { useUserData } from "@/hooks/user-data";

function CreateUser() {
  const [passowrd, setPassowrd] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [, setIsLoading] = useState(false);

  const naviage = useNavigate();
  const storeData = useUserData();
  const userData = storeData?.data;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.get(
        `/dashboard/fetch-user?password=${passowrd}&email=${email}`
      );
      const { token } = res?.data;
      const payload = { token };
      localStorage.setItem("user-info", JSON.stringify(payload));

      navigate("/dashboard/me");
    } catch (err: any) {
      setError(
        `Only authorized users are allowed. Contact the admin for sign up`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (authResult: any) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await googleAuth(authResult.code);
      // const { email, role, avatarUrl } = result.data.user;

      const { token } = result.data;
      const payload = { token };
      localStorage.setItem("user-info", JSON.stringify(payload));
      naviage("/dashboard/me");

      // Handle successful authentication
      // You can redirect to dashboard or store user data here
    } catch (error) {
      console.error("Error while requesting google code:", error);
      setError("Failed to authenticate with Google. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  // const login = useGoogleLogin({
  //   onSuccess: responseGoogle,
  //   onError: (error) => {
  //     console.error("Google login error:", error);
  //     setError("Google login failed. Please try again.");
  //     setIsLoading(false);
  //   },
  //   flow: "auth-code",
  // });

  if (userData) {
    return <Navigate to={"/dashboard/me"} replace />;
  }
  const login = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: (error) => {
      console.error("Google login error:", error);
      setError("Google login failed. Please try again.");
      setIsLoading(false);
    },
    flow: "auth-code",
  });

  return (
    <div className="flex h-full w-full">
      <div className="w-full bg-black   max-md:hidden h-dvh relative flex-2  p-2 items-center ">
        <img
          src="/leave-management.png"
          alt="img1"
          draggable={false}
          className="w-full h-full absolute noselect transition ease-in-out top-0 z-10 left-0   object-cover clip-path  touch-none"
        />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center min-h-screen bg-gray-50">
        <form
          onSubmit={handleSubmit}
          className="max-w-sm w-full bg-white shadow-lg rounded-lg p-6 space-y-4"
        >
          <h2 className="text-xl font-bold text-center">Login</h2>

          {error && (
            <div className="bg-red-100 text-red-700 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />

          <input
            type="text"
            placeholder="password"
            value={passowrd}
            onChange={(e) => setPassowrd(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer bg-blue-500 hover:bg-green-600 disabled:bg-green-300 text-white font-semibold py-2 rounded"
          >
            {loading ? "Creating..." : "Create User"}
          </button>
          <p className="text-center">Or</p>
          <button
            onClick={() => {
              setIsLoading(true);
              setError(null);
              login();
            }}
            className="w-full cursor-pointer flex items-center justify-center gap-2 bg-white border border-gray-300 rounded px-4 py-2 shadow hover:shadow-md transition"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              className="h-5"
            />
            Sign in with Google
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateUser;
