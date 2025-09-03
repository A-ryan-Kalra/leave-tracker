import * as React from "react";
import { Link, useLocation } from "react-router";

import { VersionSwitcher } from "./version-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useUserData } from "@/hooks/user-data";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const userContext = useUserData();

  const location = useLocation();

  const data = {
    //   versions: ["1.0.1", "1.1.0-alpha", "2.0.0-beta1"],
    versions: ["1.0.1"],
    navMain: [
      {
        title: "Track & Manage leaves",
        //   url: "/dashboard",
        items: [
          userContext?.data?.role === "ADMIN" && {
            title: "Admin Room Control",
            url: "/dashboard/admin",
          },
          {
            title: "Dashboard",
            url: "/dashboard/me",
          },
          {
            title: "My Leave Requests",
            url: "/dashboard/leave-requests",
          },
          userContext?.data?.role === "MANAGER" && {
            title: "Manage Leave Requests",
            url: "/dashboard/manage-leave-requests",
          },
        ],
      },
    ],
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <VersionSwitcher
          versions={data.versions}
          defaultVersion={data.versions[0]}
        />
        {/* <SearchForm /> */}
      </SidebarHeader>
      <SidebarContent>
        {/* We create a SidebarGroup for each parent. */}
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map(
                  (item) =>
                    item && (
                      <SidebarMenuItem key={item.title} className="">
                        <SidebarMenuButton
                          asChild
                          isActive={location.pathname === item.url}
                          className=""
                        >
                          <Link className="" to={item.url}>
                            {item.title}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
