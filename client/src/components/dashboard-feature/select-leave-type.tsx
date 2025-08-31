import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function SelectLeaveType({ type }: { type: (value: string) => void }) {
  return (
    <Select onValueChange={(e) => type(e)}>
      <SelectTrigger className="w-[180px] max-sm:w-[150px]">
        <SelectValue placeholder="Theme" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="self">Self</SelectItem>
        <SelectItem value="gift">Gift</SelectItem>
        <SelectItem value="compOff">Compo Off</SelectItem>
      </SelectContent>
    </Select>
  );
}

export default SelectLeaveType;
