import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "../../ui/label";

import SelectLeaveType from "../select-leave-type";
import { Textarea } from "@/components/ui/textarea";
import type { CalendarEvent, startEndDateType } from "type";
import moment from "moment";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

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
  console.log(details);

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
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {/* <AlertDialogTrigger>Open</AlertDialogTrigger> */}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Event Details</AlertDialogTitle>
          <AlertDialogDescription className="my-5 flex w-full flex-col gap-y-7">
            <div className="flex gap-y-2 w-full justify-around  items-center text-lg ">
              <div className="flex flex-col">
                <Label>Start</Label>
                <input
                  disabled
                  type="text"
                  value={moment(startEndDate?.start).format("MMMM D, YYYY")}
                />
              </div>
              <div className="flex flex-col">
                <Label>End</Label>
                <input
                  disabled
                  type="text"
                  value={moment(
                    new Date(startEndDate?.end).setDate(
                      startEndDate?.end.getDate() - 1
                    )
                  ).format("MMMM D, YYYY")}
                />
              </div>
            </div>
            <div className="flex w-full gap-y-2 items-start flex-col">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                className="max-sm:w-[300px]"
                id="reason"
                onChange={(e) =>
                  setDetails((prev) => ({ ...prev, reason: e.target.value }))
                }
                placeholder="Enter Reason"
              />
            </div>

            <div className="flex gap-y-3 max-sm:gap-x-2 items-center justify-between max-sm:justify-start">
              <div className="flex gap-y-2     items-start flex-col">
                <Label>Leave Type</Label>
                <SelectLeaveType
                  type={(value: string) =>
                    setDetails((prev) => ({ ...prev, leaveType: value }))
                  }
                />
              </div>
              <div className="flex gap-y-2    items-start flex-col">
                <Label>Total Days</Label>
                <Input
                  className="max-sm:w-[150px]"
                  value={startEndDate.totalDay?.toString()}
                />
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex gap-y-3 gap-x-2 items-center justify-end max-sm:justify-start">
          <AlertDialogCancel className="cursor-pointer">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleSubmit} className="cursor-pointer">
            Submit
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default ShowLeaveDialog;
