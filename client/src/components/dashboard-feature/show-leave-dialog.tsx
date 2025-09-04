import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "../ui/label";

import SelectLeaveType from "./select-leave-type";
import { Textarea } from "@/components/ui/textarea";
import type { CalendarEvent, startEndDateType } from "type";
import moment from "moment";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Button } from "../ui/button";
import { api } from "@/utils/api";
import { useUserData } from "@/hooks/user-data";
import { useQuery } from "@tanstack/react-query";

interface ShowAlertDialTypes {
  open: boolean;
  setOpen: () => void;
  events: (event: CalendarEvent) => void;
  startEndDate: startEndDateType;
}

function ShowLeaveDialog({
  open,
  setOpen,
  startEndDate,
  events,
}: ShowAlertDialTypes) {
  const [details, setDetails] = useState({ reason: "", leaveType: "" });
  const storedData = useUserData();
  const userData = storedData?.data;
  // console.log(userData);

  const {
    data: userLeaves,
    // error,
    // isLoading,
    // isError,
  } = useQuery({
    queryKey: ["userLeaveTypes", userData?.id],
    queryFn: listUserLeaveType,
    enabled: !!userData?.id,
    retry: 1,
  });

  function handleSubmit() {
    const payload = {
      ...details,
      id: Date.now().toString(),
      start: startEndDate.start,
      end: startEndDate.end,
      totalDay: startEndDate.totalDay?.toString(),
    };
    events(payload);
    setOpen();
    setDetails({ leaveType: "", reason: "" });
  }

  async function listUserLeaveType() {
    const res = await api.get(
      `/dashboard/list-user-leave-types/${userData?.id}`
    );

    return res.data;
  }
  function closeDialog() {
    setOpen();
    setDetails({ leaveType: "", reason: "" });
  }
  return (
    <Dialog open={open} onOpenChange={closeDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Event Details</DialogTitle>
          <DialogDescription className="my-5 flex w-full flex-col gap-y-7">
            <div className="flex  w-full justify-between items-center text-lg gap-x-6">
              <div className="flex  flex-col gap-y-2">
                <Label>Start</Label>
                <Input
                  disabled
                  type="text"
                  className="disabled:text-black max-sm:text-[11px]"
                  value={moment(startEndDate?.start).format("MMMM D, YYYY")}
                />
              </div>
              <div className="flex flex-col gap-y-2">
                <Label>End</Label>
                <Input
                  disabled
                  className="disabled:text-black max-sm:text-[11px]"
                  type="text"
                  value={moment(
                    new Date(startEndDate?.end).setDate(
                      startEndDate?.end.getDate() - 1
                    )
                  ).format("MMMM D, YYYY")}
                />
              </div>
            </div>

            <div className="flex w-full flex-col gap-y-2 items-start">
              <Label htmlFor="reason">Reason (Max :150)</Label>
              <Textarea
                className=""
                maxLength={150}
                id="reason"
                onChange={(e) =>
                  setDetails((prev) => ({ ...prev, reason: e.target.value }))
                }
                placeholder="Enter Reason"
              />
            </div>

            <div className="flex w-full items-center justify-between gap-x-6">
              <div className="flex  gap-y-2 flex-col">
                <Label>Leave Type (Current Balance)</Label>
                <SelectLeaveType
                  data={userLeaves?.userLeaveTypes}
                  type={(value: string) =>
                    setDetails((prev) => ({ ...prev, leaveType: value }))
                  }
                />
              </div>
              <div className="flex  gap-y-2 flex-col">
                <Label>Total Days</Label>
                <Input
                  className="max-sm:text-black"
                  disabled
                  value={startEndDate.totalDay?.toString()}
                />
              </div>
            </div>

            <div className="flex w-full items-center justify-between gap-x-6">
              <div className="flex  gap-y-2 flex-col">
                <Label>Total Leave Balance</Label>
                <Input
                  className="max-sm:text-black font-black disabled:bg-slate-50"
                  disabled
                  value={userLeaves?.totalBalance?._sum?.leaveBalance?.toString()}
                />
              </div>
              <div className="flex  gap-y-2 flex-col">
                <Label>Remaining Balance</Label>

                <Input
                  className="max-sm:text-black"
                  disabled
                  value={(
                    userLeaves?.totalBalance?._sum?.leaveBalance -
                    (startEndDate?.totalDay ?? 0)
                  )?.toString()}
                />
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div>
          <p className="text-red-500 text-xs ml-auto  text-right">
            {Number(
              (
                userLeaves?.totalBalance?._sum?.leaveBalance -
                (startEndDate?.totalDay ?? 0)
              )?.toString()
            ) <= 0 && "Dont't have sufficient balance"}
          </p>
        </div>
        <div className="flex items-center  justify-end gap-x-2 mt-4">
          <Button onClick={closeDialog} variant="outline">
            Cancel
          </Button>
          <Button
            disabled={
              !details.leaveType.trim() ||
              !details.reason.trim() ||
              Number(
                (
                  userLeaves?.totalBalance?._sum?.leaveBalance -
                  (startEndDate?.totalDay ?? 0)
                )?.toString()
              ) <= 0
            }
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ShowLeaveDialog;
