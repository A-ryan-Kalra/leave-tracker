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
  setIsEligible,
}: {
  type: (value: string) => void;
  data: any;
  setIsEligible: (e: number) => void;
}) {
  return (
    <Select
      onValueChange={(e) => {
        type(e);
        setIsEligible(
          data?.filter((res: any) => res?.leaveType?.id === e)[0]?.leaveBalance
        );
      }}
    >
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
