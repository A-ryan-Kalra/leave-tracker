import { RoleAssignTabs } from "./role-assign-tabs";

function ControlRoom() {
  return (
    <div className=" w-full h-full p-2 flex flex-col gap-y-2">
      <h1 className="text-xl font-semibold">Admin</h1>
      <div className="flex items-start w-full h-full ">
        <RoleAssignTabs />
      </div>
    </div>
  );
}

export default ControlRoom;
