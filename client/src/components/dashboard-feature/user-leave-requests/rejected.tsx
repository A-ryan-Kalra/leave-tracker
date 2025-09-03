import { useUserData } from "@/hooks/user-data";
import { api } from "@/utils/api";
import { useQuery } from "@tanstack/react-query";

import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "../../ui/data-table"; // 👈 reusable component
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { toast } from "sonner";
export type LeaveRequest = {
  id: string;
  startDate: string;
  endDate: string;
  reason: string;
  leaveType: string;
  manager: string;
  updatedAt: string;
};

function Rejected() {
  const storeData = useUserData();
  const userData = storeData?.data;

  // Mapper: JSON → LeaveRequest[]
  function mapLeaveRequests(raw: any[]): LeaveRequest[] {
    return raw?.map((leave) => ({
      id: leave?.id,
      startDate: leave?.startDate?.split("T")[0],
      endDate: leave?.endDate?.split("T")[0],
      reason: leave?.reason,
      leaveType: leave?.leaveType?.name ?? "-",
      manager: leave?.user?.groups?.[0]?.group?.manager?.fullName ?? "-",
      updatedAt: leave?.updatedAt.split("T")[0] ?? "-",
    }));
  }

  const { data, error, isLoading, isError } = useQuery({
    queryKey: ["leaveRequests-rejected"],
    queryFn: listLeaveRequest,
  });

  async function listLeaveRequest() {
    const response = await api.get(
      `/dashboard/list-leave-request/${userData?.id}?status=REJECTED`
    );
    return response.data;
  }

  const leaveColumns: ColumnDef<LeaveRequest>[] = [
    {
      accessorKey: "startDate",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Start Date
          <ArrowUpDown />
        </Button>
      ),
    },
    {
      accessorKey: "endDate",
      header: "End Date",
    },
    {
      accessorKey: "reason",
      header: "Reason",
      cell: ({ row }) => {
        return (
          <div className="max-w-sm truncate">{row.getValue("reason")}</div>
        );
      },
    },
    {
      accessorKey: "leaveType",
      header: "Leave Type",
    },
    {
      accessorKey: "manager",
      header: "Manager",
    },
    {
      accessorKey: "updatedAt",
      header: "Created On",
    },
    {
      id: "actions",
      enableHiding: false,
      // header: "Action",

      // cell: ({ row }) => {
      //   const request = row.original;
      //   return (
      //     <DropdownMenu>
      //       <DropdownMenuTrigger asChild>
      //         <Button variant="ghost" className="h-8 w-8 p-0">
      //           <span className="sr-only">Open menu</span>
      //           <MoreHorizontal />
      //         </Button>
      //       </DropdownMenuTrigger>
      //       <DropdownMenuContent align="end">
      //         <DropdownMenuLabel>Actions</DropdownMenuLabel>

      //         <DropdownMenuSeparator />
      //         {/* <DropdownMenuItem>View Profile</DropdownMenuItem> */}
      //         <DropdownMenuItem
      //           onClick={async () => {
      //             try {
      //               await api.patch(
      //                 `/dashboard/cancel-leave-request/${userData?.id}?leaveRequestId=${request?.id}`
      //               );
      //               toast("Success", {
      //                 description: `Leave request rejected`,
      //                 style: { backgroundColor: "white", color: "black" },
      //                 richColors: true,
      //               });
      //               refetch();
      //             } catch (error) {
      //               console.error(error);
      //             }
      //           }}
      //         >
      //           Cancel Request
      //         </DropdownMenuItem>
      //       </DropdownMenuContent>
      //     </DropdownMenu>
      //   );
      // },
    },
  ];

  if (isLoading) {
    return (
      <div className="flex w-full justify-center items-center">
        <div className="animate-spin mt-10">
          <Loader />
        </div>
      </div>
    );
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  const tableData = mapLeaveRequests(data?.leaveRequests);
  return (
    <DataTable columns={leaveColumns} data={tableData} filterColumn="reason" />
  );
}

export default Rejected;
