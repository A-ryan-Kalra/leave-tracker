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

interface ShowAlertDialTypes {
  open: boolean;
  setOpen: () => void;
  events: (event: CalendarEvent) => void;
  startEndDate: startEndDateType;
}

function ShowLeaveDialog({ open, setOpen, startEndDate }: ShowAlertDialTypes) {
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {/* <AlertDialogTrigger>Open</AlertDialogTrigger> */}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Event Details</AlertDialogTitle>
          <AlertDialogDescription className="my-5 flex flex-col gap-y-7">
            <div className="flex gap-y-2 items-start flex-col">
              <Label htmlFor="reason">Reason</Label>
              <Textarea id="reason" placeholder="Enter Reason" />
            </div>

            <div className="flex gap-y-3  w-full items-center justify-between">
              <div className="flex gap-y-2 w-fit  items-start flex-col">
                <Label>Leave Type</Label>
                <SelectLeaveType />
              </div>

              <div className="flex gap-y-2 w-full   items-start ">
                <div className="flex flex-col">
                  <Label>Start</Label>
                  <input
                    type="text"
                    value={moment(startEndDate?.start).format("MMMM D, YYYY")}
                  />
                </div>
                <div className="flex flex-col">
                  <Label>End</Label>
                  <input
                    type="text"
                    value={moment(startEndDate?.end).format("MMMM D, YYYY")}
                  />
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default ShowLeaveDialog;
