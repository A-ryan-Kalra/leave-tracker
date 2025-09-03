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
import { CalendarArrowDownIcon, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { api } from "@/utils/api";
import { useUserData } from "@/hooks/user-data";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
export default function Dashboard() {
  const navigate = useNavigate();
  const storeData = useUserData();
  const userData = storeData?.data;

  function handleLogout() {
    localStorage.removeItem("user-info");
    navigate("/login");
  }
  const location = useLocation();

  const grantCalendarPermission = async () => {
    try {
      await api.get(
        `/auth/google/grant-calendar-permission?email=${userData?.email}`
      );
      toast("Calendar Permission Granted!", {
        description: "Check you email",
        style: { backgroundColor: "white", color: "black" },
        richColors: true,
      });
    } catch (error) {
      console.error(error);
      toast("Unable to grant Calendar Permission", {
        description: "Something went wrong",
        style: { backgroundColor: "white", color: "black" },
        richColors: true,
      });
    }
  };

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
          <div className="ml-auto flex gap-x-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={grantCalendarPermission}
                  variant="secondary"
                  className="hover:bg-slate-200 cursor-pointer"
                  size="icon"
                >
                  <CalendarArrowDownIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Grant Calender Permission</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleLogout}
                  variant="secondary"
                  className="hover:bg-slate-200 cursor-pointer"
                  size="icon"
                >
                  <LogOut />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Log out</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </header>
        <SidebarInset>
          <Outlet />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
