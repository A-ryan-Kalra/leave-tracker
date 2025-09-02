"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface AllValueProps {
  allUsers: [{ fullName: string; id: string; role: string }] | null;
  callback: (value: string, role: string, name: string) => void;
  filter: string;
}

export function SelectManager({ allUsers, callback, filter }: AllValueProps) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? allUsers?.find((user) => user.fullName === value)?.fullName
            : "Please select a user"}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Please select a user" className="h-9" />
          <CommandList>
            <CommandEmpty>No User found.</CommandEmpty>
            <CommandGroup>
              {filter === "all"
                ? allUsers?.map(
                    (user) =>
                      user?.role !== "ADMIN" && (
                        <CommandItem
                          key={user?.id}
                          value={user?.fullName}
                          onSelect={(currentValue) => {
                            setValue(
                              currentValue === value ? "" : currentValue
                            );
                            callback(user?.id, user?.role, user?.fullName);
                            setOpen(false);
                          }}
                        >
                          {user?.fullName}{" "}
                          {user.role === "MANAGER" ? "(Manager)" : ""}
                          <Check
                            className={cn(
                              "ml-auto",
                              value === user?.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      )
                  )
                : allUsers?.map(
                    (user) =>
                      user?.role === "MANAGER" && (
                        <CommandItem
                          key={user?.id}
                          value={user?.fullName}
                          onSelect={(currentValue) => {
                            setValue(
                              currentValue === value ? "" : currentValue
                            );
                            callback(user?.id, user?.role, user?.fullName);
                            setOpen(false);
                          }}
                        >
                          {user?.fullName}
                          <Check
                            className={cn(
                              "ml-auto",
                              value === user?.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      )
                  )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
