"use client";

import * as React from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Loader, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { useQuery } from "@tanstack/react-query";
import EditeLeaveType from "./edit-leave-type";

type LeaveType = {
  id: string;
  name: string;
  status: string;
  description: string;
};

export function LeaveTypeManager() {
  const [storeLeaveDetails, setStoreLeaveDetails] = React.useState<any>();
  const columns: ColumnDef<LeaveType>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
    },
    { accessorKey: "name", header: "Leave Type" },
    {
      accessorKey: "isActive",
      header: "Status",

      cell: ({ row }) => (
        <div className="">
          {row.getValue("isActive") ? (
            <div className="text-green-500  rounded-full">Active</div>
          ) : (
            <div className="text-red-400  rounded-full">Inactive</div>
          )}
        </div>
      ),
    },
    { accessorKey: "description", header: "Description" },
    {
      id: "actions",
      cell: ({ row }) => {
        const leaveType = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={async () => {
                  setOpenEdit(true);
                  const leave = await api.get(
                    `/users/list-leave-type/${leaveType.id}`
                  );
                  setStoreLeaveDetails(leave.data.leaveType);
                }}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  await api.patch(`/users/cancel-leave-type/${leaveType.id}`);
                  refetch();
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const {
    data = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["leave-types"],
    queryFn: fetchLeaves,
  });

  const [open, setOpen] = React.useState<boolean>(false);
  const [openEdit, setOpenEdit] = React.useState<boolean>(false);
  async function fetchLeaves() {
    const res = await api.get("/users/list-leave-type");

    return res.data?.leaveTypes;
  }

  const [formData, setFormData] = React.useState({
    name: "",
    status: "active",
    description: "",
  });

  const table = useReactTable({
    data: data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleAddLeaveType = async () => {
    if (!formData.name.trim()) return;

    await api.post("/users/add-leave-type", {
      name: formData.name,
      status: formData.status === "active",
      description: formData.description,
    });

    refetch();

    setFormData({ name: "", status: "Active", description: "" });
    setOpen(false);
  };

  return (
    <div className="w-full space-y-4 flex flex-col">
      {storeLeaveDetails && (
        <EditeLeaveType
          refetch={refetch}
          open={openEdit}
          storeLeaveDetails={storeLeaveDetails}
          setOpen={() => setOpenEdit(false)}
        />
      )}
      {/* Dialog to add leave type */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger className="ml-auto relative " asChild>
          <Button className="cursor-pointer">Add Leave Type</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Leave Type</DialogTitle>
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
            {/* <div className="grid gap-3">
              <select
                id="status"
                className="border rounded-md p-2"
                value={formData.status}
                onChange={(e) =>
                  setFormData((f) => ({
                    ...f,
                    status: e.target.value,
                  }))
                }
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div> */}
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
              <Button className="cursor-pointer" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              className="cursor-pointer"
              onClick={handleAddLeaveType}
            >
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Table of leave types */}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {isLoading ? (
                    <div className="relative flex items-center w-full">
                      <div className="flex items-center justify-center mx-auto animate-spin">
                        <Loader />
                      </div>
                    </div>
                  ) : (
                    "No Data"
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
