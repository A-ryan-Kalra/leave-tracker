"use client";

import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { ChevronDown, MoreHorizontal } from "lucide-react";

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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
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
import { UserLeaveForm } from "./user-leave-form";
import { EditUserLeaveForm } from "./edit-user-leave-form";
import { api } from "@/utils/api";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ShowAlertDialTypes {
  open: boolean;
  setOpen: () => void;
  userData: any;
  //   groupDetails: any;
  refetch: () => void;
  refetchUsers: () => void;
}

export function EditUser({
  open,
  setOpen,
  userData,
  refetch,
  refetchUsers,
}: ShowAlertDialTypes) {
  const [formField, setFormField] = React.useState({ name: "", role: "" });
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [userLeaveTypeId, setuserLeaveTypeId] = React.useState<string>("");
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [openLeaveForm, setOpenLeaveForm] = React.useState<boolean>(false);
  const [openEditLeaveForm, setOpenEditLeaveForm] =
    React.useState<boolean>(false);

  const columns: ColumnDef<unknown, any>[] = [
    {
      id: "id",
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
      enableSorting: false,
      enableHiding: false,
    },
    // { accessorKey: "leaveType.id", header: "Leave Type" },
    { accessorKey: "leaveType.name", header: "Leave Type" },
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
    { accessorKey: "leaveBalance", header: "Balance" },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const rowData: any = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              {/* <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(rowData.id)}
              >
                Copy Row ID
              </DropdownMenuItem> */}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setOpenEditLeaveForm(true);
                  setuserLeaveTypeId(rowData.leaveType.id);
                }}
              >
                Edit Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  //   setOpenEditLeaveForm(true);
                  setuserLeaveTypeId(rowData.leaveType.id);

                  try {
                    await api.patch(
                      `/users/delete-user-leavetype/${userData?.id}`,
                      { leaveTypeId: rowData.leaveType.id }
                    );
                    refetch();
                    toast("Success", {
                      description: "User leaves deleted",
                      style: { backgroundColor: "white", color: "black" },
                      richColors: true,
                    });
                  } catch (error) {
                    toast("Error", {
                      description: "Something went wront",
                      style: { backgroundColor: "white", color: "black" },
                      richColors: true,
                    });
                  }
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

  const table = useReactTable({
    data: userData?.assignedTypes,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  React.useEffect(() => {
    setFormField({
      name: userData?.fullName,
      role: userData?.role,
    });
  }, [userData]);

  async function handleSubmit() {
    await api.patch(`/users/assignRoles/${userData?.id}`, {
      role: formField.role,
      name: formField.name,
    });
    // refetch();
    refetchUsers();
    setOpen();
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <UserLeaveForm
        setOpen={() => setOpenLeaveForm(false)}
        open={openLeaveForm}
        userId={userData?.id}
        refetch={refetch}
      />
      <EditUserLeaveForm
        setOpen={() => setOpenEditLeaveForm(false)}
        open={openEditLeaveForm}
        userId={userData?.id}
        refetch={refetch}
        userLeaveTypeId={userLeaveTypeId}
      />
      <form>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Fill the fields and update user changes.
            </DialogDescription>
          </DialogHeader>

          {/* Inputs */}
          <div className="grid gap-4 grid-cols-2 py-2">
            <div className="grid gap-3">
              <Label htmlFor="name">Name</Label>
              <Input
                value={formField.name}
                onChange={(e) =>
                  setFormField((prev) => ({ ...prev, name: e.target.value }))
                }
                id="name"
                name="name"
                placeholder="Enter value 1"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="role">Role</Label>

              <Select
                defaultValue={formField.role}
                value={formField.role}
                onValueChange={(e) =>
                  setFormField((prev) => ({ ...prev, role: e }))
                }
              >
                <SelectTrigger className="w-full" aria-label="Select manager">
                  <SelectValue
                    placeholder="Select a manager"
                    className="w-full"
                  />
                </SelectTrigger>
                <SelectContent className="">
                  <SelectItem value={"ADMIN"}>ADMIN</SelectItem>
                  <SelectItem value={"TEAM_MEMBER"}>TEAM_MEMBER</SelectItem>
                  <SelectItem value={"MANAGER"}>MANAGER</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Mini Table */}
          <div className="mt-4">
            <div className="flex justify-between">
              <Label htmlFor="name" className="text-lg">
                Update Leaves
              </Label>
            </div>
            <div className="flex items-center py-2">
              <Button
                onClick={() => {
                  setOpenLeaveForm(true);
                }}
                className="cursor-pointer"
              >
                Add Leaves
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="ml-auto">
                    Columns <ChevronDown />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => {
                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className="capitalize"
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) =>
                            column.toggleVisibility(!!value)
                          }
                        >
                          {column.id}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
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
                        No Leaves Assigned.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSubmit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
