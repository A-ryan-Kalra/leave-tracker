import { useUserData } from "@/hooks/user-data";
import { api } from "@/utils/api";
import { useQuery } from "@tanstack/react-query";

import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Loader, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { DataTable } from "../ui/data-table";
export type LeaveRequest = {
  id: string;
  startDate: string;
  endDate: string;
  reason: string;
  leaveType: string;
  applicant: string;
  updatedAt: string;
};

function ManageRejectedRequest() {
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
      applicant: leave?.user?.fullName ?? "-",
      updatedAt: leave?.updatedAt.split("T")[0] ?? "-",
    }));
  }

  const { data, error, isLoading, isError, refetch } = useQuery({
    queryKey: ["leaveRequests-manage-rejected"],
    queryFn: listLeaveRequest,
  });

  async function listLeaveRequest() {
    const response = await api.get(
      `/dashboard/manage-leave-request/${userData?.id}?status=REJECTED&role=MANAGER`
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
      accessorKey: "applicant",
      header: "Applicant",
    },
    {
      accessorKey: "updatedAt",
      header: "Created On",
    },
    {
      id: "actions",
      enableHiding: false,
      // header: "Action",
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
  // if (data?.managers?.length === 0 || undefined) {
  //   return (
  //     <div className="flex w-full justify-center items-center">
  //       <div className=" mt-10">No Results</div>
  //     </div>
  //   );
  // }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  const tableData = mapLeaveRequests(data?.managers);
  return (
    <DataTable columns={leaveColumns} data={tableData} filterColumn="reason" />
  );
}

export default ManageRejectedRequest;
