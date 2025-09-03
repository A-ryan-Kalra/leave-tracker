import { useUserData } from "@/hooks/user-data";
import { api } from "@/utils/api";
import { useQuery } from "@tanstack/react-query";

import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "../../ui/data-table"; // 👈 reusable component

export type LeaveRequest = {
  id: string;
  startDate: string;
  endDate: string;
  reason: string;
  leaveType: string;
  manager: string;
  updatedAt: string;
};

function Cancelled() {
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

  const { data, error, isLoading, isError, refetch } = useQuery({
    queryKey: ["leaveRequests-cancelled"],
    queryFn: listLeaveRequest,
  });

  async function listLeaveRequest() {
    const response = await api.get(
      `/dashboard/list-leave-request/${userData?.id}?status=CANCELLED`
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
      accessorKey: "updatedAt",
      header: "Created On",
    },
    {
      accessorKey: "manager",
      header: "Manager",
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

export default Cancelled;
