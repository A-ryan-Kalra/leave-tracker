"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { MultiSelect } from "@/components/ui/multi-select";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { api } from "@/utils/api";
import { toast } from "sonner";
import { useNavigate } from "react-router";

type TabValue = "tab1" | "tab2" | "tab3";

interface AssignMenberProps {
  allMembers: {
    label: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
  //   allUsers: [{ fullName: string; id: string; role: string }] | null;
}

export function CreateProject({
  className,
  defaultTab = "tab1",
  title = "Create Project",
  description = "Fill out the fields below.",
  allMembers,
}: {
  className?: string;
  defaultTab?: TabValue;
  title?: string;
  description?: string;
} & AssignMenberProps) {
  const navigate = useNavigate();
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
  console.log(detail);

  async function handleSubmit() {
    try {
      // const res = await api.post("/users/create-project", {
      //   ...detail,
      // });

      // await res.data;
      setDetails({
        projectName: "",
        groupName: "",
        managerId: "",
        userIds: [],
      });
      toast("Success", {
        description: "Project created",
        style: { backgroundColor: "white", color: "black" },
        richColors: true,
      });
      setTimeout(() => navigate(0), 1500);
    } catch (error) {
      toast("Error", {
        description: "SOmething went wrong",
        style: { backgroundColor: "white", color: "black" },
        richColors: true,
      });
    }
  }
  console.log(allMembers);
  return (
    <Card
      className={cn("w-full  max-w-2xl max-sm:max-w-sm mx-auto", className)}
    >
      <CardHeader>
        <CardTitle className="text-pretty">{title}</CardTitle>
        <CardDescription className="text-pretty">{description}</CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue={defaultTab} className="w-full">
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
                  className=" justify-between rounded-lg border max-w-[300px] shadow-sm"
                  options={allMembers ?? []}
                  value={detail.userIds}
                  // defaultValue={selectedMembers}
                  onValueChange={(e) =>
                    setDetails((prev) => ({ ...prev, userIds: e }))
                  }
                  // maxCount={2}
                />
              </div>
              <div className="grid gap-2">
                <Label>Select Manager</Label>
                <Select
                  value={detail.managerId}
                  onValueChange={(e) =>
                    setDetails((prev) => ({ ...prev, managerId: e }))
                  }
                >
                  <SelectTrigger aria-label="Select manager">
                    <SelectValue placeholder="Select a manager" />
                  </SelectTrigger>
                  <SelectContent className="">
                    {allMembers?.map((member) => (
                      <SelectItem value={member.value}>
                        {member.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="ml-auto ">
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
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
