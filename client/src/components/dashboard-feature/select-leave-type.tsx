import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function SelectLeaveType({
  type,
  data,
}: {
  type: (value: string) => void;
  data: any;
}) {
  return (
    <Select onValueChange={(e) => type(e)}>
      <SelectTrigger className="w-[180px] max-sm:w-[150px]">
        <SelectValue placeholder="Leave Type" />
      </SelectTrigger>
      <SelectContent>
        {data?.map((type: any) => (
          <SelectItem value={type?.leaveType?.id}>
            {type?.leaveType?.name} ({type?.leaveBalance})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default SelectLeaveType;
