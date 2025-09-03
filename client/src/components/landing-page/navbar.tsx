import { useUserData } from "@/hooks/user-data";
import { googleAuth } from "@/utils/api";
import { useGoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router";

function NavbarPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const naviage = useNavigate();
  const storeData = useUserData();
  const userData = storeData?.data;
  const responseGoogle = async (authResult: any) => {
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

  const login = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: (error) => {
      console.error("Google login error:", error);
      setError("Google login failed. Please try again.");
      setIsLoading(false);
    },
    flow: "auth-code",
  });

  if (userData) {
    return <Navigate to={"/dashboard/me"} replace />;
  }
  return (
    <nav>
      <div
        tabIndex={0}
        onClick={() => {
          setIsLoading(true);
          setError(null);
          login();
        }}
        className="bg-[#A2E6CB] group cursor-pointer flex items-center text-teal-800 font-semibold text-lg px-4 py-1 rounded-[23px]"
      >
        Sign In
        <span className="relative ml-[6px] inline-block h-[16px] w-[16px]">
          <svg
            width="10"
            height="16"
            viewBox="0 0 10 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="ml-[4px] w-[2px] origin-right transition-all group-hover:w-[10px]"
            preserveAspectRatio="none"
          >
            <path
              d="M 1 8 L 9 8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </svg>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="absolute left-[-4px] top-0 duration-150 group-hover:translate-x-[8px]"
          >
            <path
              d="m6 12 4-4-4-4"
              stroke="currentColor"
              className="icon-dark"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </svg>
        </span>
      </div>
    </nav>
  );
}

export default NavbarPage;
