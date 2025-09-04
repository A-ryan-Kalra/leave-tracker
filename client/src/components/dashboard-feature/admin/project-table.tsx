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
import { ArrowUpDown, ChevronDown, Loader, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/utils/api";
import { useQuery } from "@tanstack/react-query";
import EditProject from "../edit-project";
import { toast } from "sonner";

// --- Define types based on your API ---
export type StoreDetail = {
  id: string;
  name: string;
  manager: {
    fullName: string;
    email: string;
  };
  project: {
    id: string;
    name: string;
  };
  members: { userId: string }[];
};

export function ProjectTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [open, setOpen] = React.useState<boolean>(false);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [groupDetails, setGroupDetails] = React.useState<StoreDetail | null>(
    null
  );

  async function getAllProjects() {
    const res = await api.get("/users/list-all-project");
    return res.data?.result || [];
  }
  async function getProject(id: string) {
    const res = await api.get(`/users/list-project/${id}`);

    setGroupDetails(res.data?.group || []);
  }
  const {
    data: storeDetails = [],
    isLoading,
    refetch,
    // error,
  } = useQuery({
    queryKey: ["projects"], // cache key
    queryFn: getAllProjects, // fetch function
    staleTime: 1000 * 60 * 5, // keep data fresh for 5 mins
  });

  // console.log("storeProjects", projectDetails);
  const columns: ColumnDef<StoreDetail>[] = [
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
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Group Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("name")}</div>
      ),
    },
    {
      accessorFn: (row) => row.project?.name,
      id: "projectName",
      header: "Project",
      cell: ({ row }) => <div>{row.getValue("projectName")}</div>,
    },
    {
      accessorFn: (row) => row.manager?.fullName,
      id: "managerName",
      header: "Manager",
      cell: ({ row }) => <div>{row.getValue("managerName")}</div>,
    },
    {
      accessorFn: (row) => row.manager?.email,
      id: "managerEmail",
      header: "Manager Email",
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("managerEmail")}</div>
      ),
    },
    {
      accessorFn: (row) => row.members?.length ?? 0,
      id: "membersCount",
      header: "Members",
      cell: ({ row }) => <div>{row.getValue("membersCount")}</div>,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const detail = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  handleUpdateProject(detail.id);
                }}
              >
                Edit Project
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  await api.patch(`/users/delete-project/${detail.project.id}`);
                  toast("Success", {
                    description: "Project deleted!",
                    style: { backgroundColor: "white", color: "black" },
                    richColors: true,
                  });
                  refetch();
                }}
              >
                Delete Project
              </DropdownMenuItem>
              {/* <DropdownMenuItem>View manager</DropdownMenuItem> */}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  async function handleUpdateProject(id: string) {
    setOpen(true);
    await getProject(id);
  }

  const table = useReactTable({
    data: storeDetails,
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

  return (
    <div className="w-full">
      {groupDetails && (
        <EditProject
          open={open}
          refetch={refetch}
          setOpen={() => {
            setOpen(false);
            setGroupDetails(null);
          }}
          groupDetails={groupDetails}
        />
      )}
      {/* Filter by team name */}
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter group..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
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

      {/* Table UI */}
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

      {/* Pagination + selection info */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
