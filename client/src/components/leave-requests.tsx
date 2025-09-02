import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/utils/api";
import Pending from "./dashboard-feature/leave-requests/pending";

export default function LeaveRequests() {
  // const [allUsers, setAllUsers] = useState<
  //   [{ fullName: string; id: string; role: string }] | null
  // >(null);

  return (
    <div className="flex w-full p-2 flex-col gap-6 bg">
      <h1 className="text-xl font-semibold">Leave Requests</h1>
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Pending />
        </TabsContent>

        <TabsContent value="approved"></TabsContent>

        <TabsContent value="rejected"></TabsContent>

        <TabsContent value="cancelled"></TabsContent>
      </Tabs>
    </div>
  );
}
