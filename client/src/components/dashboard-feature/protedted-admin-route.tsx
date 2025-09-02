import { useUserData } from "@/hooks/user-data";
import { Navigate } from "react-router";
export default function AdminRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeData = useUserData();
  const userData = storeData?.data;
  if (userData?.role !== "ADMIN") {
    return <Navigate to="/dashboard/me" replace />; // or return a forbidden message, etc.
  }
  return children;
}
