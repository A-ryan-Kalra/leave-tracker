import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "../ui/label";

import SelectLeaveType from "./select-leave-type";
import { Textarea } from "@/components/ui/textarea";
import type { CalendarEvent, startEndDateType } from "type";
import moment from "moment";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Button } from "../ui/button";

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
    <Dialog open={open} onOpenChange={setOpen}>
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
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                className=""
                id="reason"
                onChange={(e) =>
                  setDetails((prev) => ({ ...prev, reason: e.target.value }))
                }
                placeholder="Enter Reason"
              />
            </div>

            <div className="flex w-full items-center justify-between gap-x-6">
              <div className="flex  gap-y-2 flex-col">
                <Label>Leave Type</Label>
                <SelectLeaveType
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
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center  justify-end gap-x-2 mt-4">
          <Button onClick={setOpen} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Submit</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ShowLeaveDialog;
