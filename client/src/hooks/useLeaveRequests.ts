import { api } from "@/utils/api";
import { useQuery } from "@tanstack/react-query";

export function useLeaveRequests(userId?: string) {
  return useQuery({
    queryKey: ["leaveRequests", userId], // ✅ cached per user
    queryFn: async () => {
      if (!userId) return [];

      const response = await api.get(
        `/dashboard/list-approved-leaves/${userId}`
      );

      return (
        response.data?.approvedLeaves?.map((r: any) => ({
          id: r.id,
          reason: r.reason,
          leaveType: r.leaveType?.name,
          start: new Date(r.startDate),
          end: new Date(r.endDate),
          halfDay: undefined,
          totalDay: undefined,
          fullName: r.user.fullName,
        })) || []
      );
    },
    enabled: !!userId, // ✅ only run if userId exists
    staleTime: 1000 * 60 * 5, // ✅ cache for 5 minutes
    retry: 1, // retry once on failure
  });
}
