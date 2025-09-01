import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/utils/api";
import axios from "axios";
import { useEffect, useState } from "react";
const frameworksList = [
  { value: "next.js", label: "Next.js" },
  { value: "react", label: "React" },
  { value: "vue", label: "Vue.js" },
  { value: "angular", label: "Angular" },
];
export function RoleAssignTabs() {
  const [allMembers, setAllMembers] = useState<
    {
      label: string;
      value: string;
      icon: React.ComponentType<{ className?: string }>;
    }[]
  >([]);
  const [selectedMembers, setSelectedMembers] = useState([""]);

  async function fetchAllUsers() {
    const res = await api.get("/users/list-all");
    const data = await res.data;
    console.log("users-data", data);
    if (data?.message === "Success") {
      setAllMembers(
        data?.allUsers
          ?.filter((profile: any) => profile.role === "TEAM_MEMBER")
          ?.map((profile: any) => ({
            label: profile.fullName,
            value: profile.id,
            icon: ({ className }: { className?: string }) => (
              <div
                className={`relative w-6 h-6 rounded-full overflow-hidden ${
                  className || ""
                }`}
              >
                <img
                  className="object-cover"
                  src={profile.avatarUrl}
                  alt={profile.avatarUrl}
                />
              </div>
            ),
          }))
      );
    }
  }
  console.log("allMembers", allMembers);

  useEffect(() => {
    fetchAllUsers();
  }, []);

  return (
    <div className="flex w-full  flex-col gap-6 bg">
      <Tabs defaultValue="assign-manager">
        <TabsList>
          <TabsTrigger value="assign-manager">Assign Manager</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>
        <TabsContent value="assign-manager">
          <Card className="">
            <CardHeader>
              <CardTitle>Assign Manager</CardTitle>
              <CardDescription>
                Make changes to your account here. Click save when you&apos;re
                done.
              </CardDescription>
            </CardHeader>
            <CardContent className="w-[300px]">
              <MultiSelect
                modalPopover={true}
                placeholder="Select Members"
                className=" justify-between rounded-lg border  shadow-sm"
                options={allMembers ?? []}
                // defaultValue={selectedMembers}
                onValueChange={(e) => console.log(e)}
                maxCount={2}
              />
            </CardContent>
            <CardFooter>
              <Button>Save changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>
                Change your password here. After saving, you&apos;ll be logged
                out.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="tabs-demo-current">Current password</Label>
                <Input id="tabs-demo-current" type="password" />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="tabs-demo-new">New password</Label>
                <Input id="tabs-demo-new" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save password</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
