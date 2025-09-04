import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useUserData } from "@/hooks/user-data";
import moment from "moment";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { CalendarArrowDownIcon, LogOut } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/utils/api";
import { useNavigate } from "react-router";

export function UserProfile() {
  const navigate = useNavigate();
  const storeData = useUserData();
  console.log(storeData);
  const grantCalendarPermission = async () => {
    try {
      await api.get(
        `/auth/google/grant-calendar-permission?email=${storeData?.data?.email}`
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
  function handleLogout() {
    localStorage.removeItem("user-info");
    navigate("/");
  }

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">{storeData?.data?.name}</Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-50">
        <div className="flex  gap-4">
          <Avatar className="">
            <AvatarImage src={storeData?.data?.img || "/default-user.webp"} />
            <AvatarFallback>VC</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="">
              <h4 className="text-sm font-semibold">
                Role: {storeData?.data?.role}
              </h4>
            </div>
            {/* <p className="text-sm">Role {storeData?.data?.role}</p> */}
            <div className="text-muted-foreground text-xs">
              Joined: {moment(storeData?.data?.createdAt).format("MMM D, YYYY")}
            </div>
            <div className="flex gap-x-2 items-center justify-end mt-2  ">
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
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
