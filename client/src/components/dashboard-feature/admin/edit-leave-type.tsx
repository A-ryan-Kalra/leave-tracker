import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/utils/api";
import React, { useEffect } from "react";

function EditeLeaveType({
  refetch,
  open,
  setOpen,
  storeLeaveDetails,
}: {
  refetch: () => void;
  open: boolean;
  setOpen: () => void;
  storeLeaveDetails: any;
}) {
  const [formData, setFormData] = React.useState({
    name: "",
    status: "active",
    description: "",
  });

  const handleAddLeaveType = async () => {
    if (!formData.name.trim()) return;

    const res = await api.patch(
      `/users/update-leave-type/${storeLeaveDetails?.id}`,
      {
        payload: {
          name: formData.name,
          isActive: formData.status === "active",
          description: formData.description,
        },
      }
    );

    refetch();

    setFormData({ name: "", status: "", description: "" });
    setOpen();
  };

  useEffect(() => {
    setFormData({
      description: storeLeaveDetails.description,
      name: storeLeaveDetails.name,
      status: storeLeaveDetails.isActive ? "active" : "inactive",
    });
  }, [storeLeaveDetails]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Leave Type</DialogTitle>
          <DialogDescription>
            Fill the fields to create a new leave type.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-3 grid-cols-2">
            <div className="grid gap-3">
              <Label htmlFor="name">Leave Type</Label>
              <Input
                id="name"
                placeholder="Enter Leave Type"
                value={formData.name}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="name">Status</Label>
              <Select
                defaultValue={formData.status}
                onValueChange={(e) =>
                  setFormData((f) => ({
                    ...f,
                    status: e,
                  }))
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Status</SelectLabel>
                    <SelectItem value="active">Activate</SelectItem>
                    <SelectItem value="inactive">Inactivate</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-3 mt-5">
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              placeholder="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData((f) => ({ ...f, description: e.target.value }))
              }
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button
              onClick={setOpen}
              className="cursor-pointer"
              variant="outline"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            className="cursor-pointer"
            onClick={handleAddLeaveType}
          >
            Edit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EditeLeaveType;
