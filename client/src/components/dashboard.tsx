import { AppSidebar } from "./app-siderbar";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Outlet, useLocation, useNavigate } from "react-router";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { LogOut } from "lucide-react";
import { Button } from "./ui/button";
export default function Dashboard() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("user-info");
    navigate("/login");
  }
  const location = useLocation();

  return (
    <SidebarProvider className="flex">
      <AppSidebar />
      <div className="flex flex-col w-full">
        <header className=" flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb className="">
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard/me">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {location.pathname.includes("dashboard/me")
                    ? "Schedule leaves"
                    : location.pathname.includes("dashboard/admin")
                    ? "Configuration"
                    : location.pathname.includes("dashboard/leave-requests")
                    ? "Manage Your Leaves"
                    : "Manage Applicants Leave Requests"}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <Button
            onClick={handleLogout}
            variant="secondary"
            className="ml-auto hover:bg-slate-200 cursor-pointer"
            size="icon"
          >
            <LogOut />
          </Button>
        </header>
        <SidebarInset>
          <Outlet />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
