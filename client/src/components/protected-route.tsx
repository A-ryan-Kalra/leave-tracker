import { Navigate } from "react-router";
import { useUserData } from "../hooks/user-data";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const userContext = useUserData();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    userContext?.getToken();
  }, []);

  useEffect(() => {
    if (!userContext?.isLoading) {
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [userContext?.isLoading]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!userContext?.data) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
