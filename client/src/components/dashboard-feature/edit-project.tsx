import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "../ui/label";

import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

import { MultiSelect } from "../ui/multi-select";
import { api } from "@/utils/api";
import { toast } from "sonner";

interface ShowAlertDialTypes {
  open: boolean;
  setOpen: () => void;
  groupDetails: any;
  refetch: () => void;
}

function EditGroup({
  open,
  setOpen,
  groupDetails,
  refetch,
}: ShowAlertDialTypes) {
  const [allmember, setAllmember] = useState([]);

  const fetchAll = async () => {
    const res = await api.get("/users/list-all");
    const data = await res.data;
    console.log("users-data", data?.allUsers);
    setAllmember(data?.allUsers);
  };

  const [detail, setDetails] = useState<{
    projectName: string;
    groupName?: string;
    managerId?: string;
    userIds?: string[];
  }>({
    projectName: "",
    groupName: "",
    managerId: "",
    userIds: [],
  });

  useEffect(() => {
    fetchAll();
    setDetails({
      groupName: groupDetails?.name,
      projectName: groupDetails?.project?.name,
      managerId: groupDetails?.managerId,
      userIds: groupDetails?.members?.map((member: any) => member?.user?.id),
    });
  }, [groupDetails]);

  async function handleSubmit() {
    try {
      const payload = {
        groupId: groupDetails?.id,
        newProjectName: detail.projectName,
        newGroupName: detail.groupName,
        newManagerId: detail.managerId,
        userIds: detail.userIds,
      };

      await api.patch(`/users/update-group/${payload.groupId}`, payload);

      setOpen();
      toast("Success", {
        description: "Group updated!",
        style: { backgroundColor: "white", color: "black" },
        richColors: true,
      });
      refetch();
    } catch (error) {
      toast("Error", {
        description: "Unable to update",
        style: { backgroundColor: "white", color: "black" },
        richColors: true,
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription className="my-5 flex w-full flex-col gap-y-7">
            <div className="grid gap-4">
              <div className="grid gap-2 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Project Name</Label>
                  <Input
                    value={detail.projectName}
                    onChange={(e) =>
                      setDetails((prev) => ({
                        ...prev,
                        projectName: e.target.value,
                      }))
                    }
                    placeholder="Leave Tracker"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Group Name</Label>
                  <Input
                    value={detail.groupName}
                    onChange={(e) =>
                      setDetails((prev) => ({
                        ...prev,
                        groupName: e.target.value ?? "",
                      }))
                    }
                    placeholder="Frontend"
                  />
                </div>
              </div>

              <div className="grid gap-2 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor={``}>Select Members</Label>
                  <MultiSelect
                    // onClick={(e) => console.log(e)}

                    modalPopover={true}
                    placeholder="Select Members"
                    className=" justify-between rounded-lg border max-w-[250px] shadow-sm"
                    options={
                      allmember
                        ?.filter((member: any) => member?.role !== "ADMIN")
                        .map((member: any) => ({
                          label: member?.fullName,
                          value: member?.id,
                          icon: ({ className }: { className?: string }) => (
                            <div
                              className={`relative w-6 h-6 rounded-full overflow-hidden ${
                                className || ""
                              }`}
                            >
                              <img
                                className="object-cover"
                                src={member?.avatarUrl}
                                alt={member?.avatarUrl}
                              />
                            </div>
                          ),
                        })) || []
                    }
                    // value={detail.userIds}
                    defaultValue={detail?.userIds || []}
                    onValueChange={(e) =>
                      setDetails((prev) => ({ ...prev, userIds: e }))
                    }
                    maxCount={0}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Select Manager</Label>

                  <Select
                    defaultValue={groupDetails?.managerId}
                    value={detail.managerId}
                    onValueChange={(e) =>
                      setDetails((prev) => ({ ...prev, managerId: e }))
                    }
                  >
                    <SelectTrigger aria-label="Select manager">
                      <SelectValue placeholder="Select a manager" />
                    </SelectTrigger>
                    <SelectContent className="">
                      {allmember?.map(
                        (member: any) =>
                          member?.role !== "ADMIN" && (
                            <SelectItem value={member.id}>
                              {member.fullName}
                            </SelectItem>
                          )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center  justify-end gap-x-2 mt-4">
          <Button onClick={setOpen} variant="outline">
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={
              !detail.groupName ||
              !detail.managerId ||
              !detail.projectName ||
              detail.userIds?.length === 0
            }
            className="cursor-pointer"
          >
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default EditGroup;
