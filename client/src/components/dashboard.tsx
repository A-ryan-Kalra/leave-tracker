import { AppSidebar } from "./app-siderbar";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "react-router";

export default function Dashboard() {
  // const navigate = useNavigate();

  // useEffect(() => {
  //   navigate("/dashboard/me");
  // }, []);
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
