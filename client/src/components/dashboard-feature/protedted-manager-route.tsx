import { useUserData } from "@/hooks/user-data";
import { Navigate } from "react-router";
export default function ProtectedManagerRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeData = useUserData();
  const userData = storeData?.data;
  console.log(userData);
  if (userData?.role !== "MANAGER") {
    return <Navigate to="/dashboard/me" replace />; // or return a forbidden message, etc.
  }
  return children;
}
