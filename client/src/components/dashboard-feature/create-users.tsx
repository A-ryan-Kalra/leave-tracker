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
import { api } from "@/utils/api";
import React, { useState } from "react";
import { toast } from "sonner";

export function CreateUsers({ refetch }: { refetch: () => void }) {
  const [openNewUser, setOpenNewUser] = React.useState<boolean>(false);
  const [details, setDetails] = useState<{
    fullName: string;
    email: string;
    password: string;
  }>({ email: "", fullName: "", password: "" });

  const handleClose = () => {
    setDetails({ email: "", fullName: "", password: "" });

    setOpenNewUser(false);
  };

  async function handleSubmit() {
    try {
      await api.post(`/users/add-new-user`, {
        ...details,
      });

      toast("Success", {
        description: `New user added successfully.`,
        style: { backgroundColor: "white", color: "black" },
        richColors: true,
      });

      setOpenNewUser(false);
      setDetails({ email: "", fullName: "", password: "" });
      refetch();
    } catch (error) {
      console.error(error);
      toast("Error", {
        description: `Unable to add new users.`,
        style: { backgroundColor: "white", color: "black" },
        richColors: true,
      });
    }
  }

  return (
    <Dialog open={openNewUser} onOpenChange={setOpenNewUser}>
      <form className="flex  justify-end">
        <DialogTrigger
          onClick={() => setOpenNewUser(true)}
          asChild
          className="  "
        >
          <Button className="cursor-pointer w-fit mr-1 relative">
            Create Users
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Create new users here. Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 grid-cols-2">
            <div className="grid gap-3">
              <Label htmlFor="name-1">Name</Label>
              <Input
                id="name-1"
                value={details.fullName}
                onChange={(e) =>
                  setDetails((prev) => ({ ...prev, fullName: e.target.value }))
                }
                name="name"
                placeholder="johnDoe"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="email-1">Email</Label>
              <Input
                value={details.email}
                onChange={(e) =>
                  setDetails((prev) => ({ ...prev, email: e.target.value }))
                }
                id="email-1"
                type="email"
                required
                name="email"
                placeholder="john@doe.com"
              />
            </div>
          </div>
          <div className="grid gap-3">
            <Label htmlFor="password-1">Password</Label>
            <Input
              id="password-1"
              onChange={(e) =>
                setDetails((prev) => ({ ...prev, password: e.target.value }))
              }
              name="password"
              value={details.password}
              placeholder="**********"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button onClick={handleClose} variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              className="cursor-pointer"
              onClick={handleSubmit}
              type="submit"
              disabled={
                !details.email || !details.password || !details.password
              }
            >
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
