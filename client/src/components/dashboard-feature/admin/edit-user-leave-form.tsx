"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { api } from "@/utils/api";
import { toast } from "sonner";

export function EditUserLeaveForm({
  open,
  setOpen,
  userId,
  refetch,
  userLeaveTypeId,
}: {
  setOpen: () => void;
  open: boolean;
  userId: string;
  userLeaveTypeId: string;
  refetch: () => void;
}) {
  const [leaveTypes, setLeaveTypes] = React.useState<[]>([]);
  const [formData, setFormData] = React.useState({
    type: "",
    status: "",
    balance: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
    const payload = {
      leaveTypeId: userLeaveTypeId,
      ...(formData.balance !== "" && {
        leaveBalance: Number(formData.balance),
      }),
      isActive: formData.status === "active",
    };
    console.log(payload);
    try {
      const res = await api.patch(
        `/users/update-user-leavetype/${userId}`,
        payload
      );
      await res.data;
      refetch();
      setOpen();
      toast("Success", {
        description: `Leave Type updated`,
        style: { backgroundColor: "white", color: "black" },
        richColors: true,
      });
    } catch (error: any | Error) {
      refetch();
      console.error(error);
      toast("Error", {
        description: `Unable to update leave Type`,
        style: { backgroundColor: "white", color: "black" },
        richColors: true,
      });
    }
  };

  async function fetchLeaveTypes() {
    const res = await api.get(`/users/list-leave-type`);
    const data = res.data.leaveTypes;

    setLeaveTypes(data);
  }
  React.useEffect(() => {
    fetchLeaveTypes();
  }, []);

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        setFormData({ balance: "", status: "", type: "" });
        setOpen();
      }}
    >
      {/* <DialogTrigger asChild>
        <Button variant="outline">Open User Form</Button>
      </DialogTrigger> */}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Leaves</DialogTitle>
          <DialogDescription>
            Fill in the details to update user leaves.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* <div className="flex flex-col gap-2">
            <Label htmlFor="role">Leave Type</Label>
            <Select
              value={formData.type}
              onValueChange={(e) =>
                setFormData((prev) => ({ ...prev, type: e }))
              }
            >
              <SelectTrigger className="w-full" id="role">
                <SelectValue placeholder="Select Leave Type" />
              </SelectTrigger>
              <SelectContent>
                {leaveTypes?.map((type: any) => (
                  <SelectItem className="capitalize" value={type.id}>
                    {type?.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div> */}

          {/* First Name */}
          <div className="grid gap-3 grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="firstName">Status</Label>

              <Select
                value={formData.status}
                onValueChange={(e) =>
                  setFormData((prev) => ({ ...prev, status: e }))
                }
              >
                <SelectTrigger className="w-full" id="role">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Last Name */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="lastName">Balance</Label>
              <Input
                type="number"
                disabled={formData.status === "inactive"}
                id="lastName"
                placeholder="Enter Balance"
                value={formData.balance}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, balance: e.target.value }))
                }
              />
            </div>
          </div>

          <Button
            // disabled={!formData.status.trim() || !formData.balance.trim()}
            type="submit"
            className="mt-2"
          >
            Submit
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
