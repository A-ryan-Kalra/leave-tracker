import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MultiSelect } from "@/components/ui/multi-select";
import { SelectManager } from "./select-manager";
import { useState } from "react";
import { api } from "@/utils/api";
import { toast } from "sonner";
interface Step {
  title: string;
  content: React.ReactNode;
}

interface AssignManagerProps {
  allMembers: {
    label: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
  allUsers: [{ fullName: string; id: string; role: string }] | null;
}

function AssignManager({ allMembers, allUsers }: AssignManagerProps) {
  const [storeDetails, setStoreDetails] = useState<{
    managerId: string;
    totalUsersId: string[];
  }>({ managerId: "", totalUsersId: [] });
  console.log(storeDetails);
  const steps: Step[] = [
    {
      title: "Select manager",
      content: (
        <Card className="">
          <CardHeader className="flex flex-col gap-y-5 justify-between h-full">
            <CardTitle>Assign Manager</CardTitle>
            <CardDescription>
              Please assign a manager before allocating members.
            </CardDescription>
            <SelectManager
              filter=""
              allUsers={allUsers}
              callback={(id: string) =>
                setStoreDetails((prev) => ({ ...prev, managerId: id }))
              }
            />
          </CardHeader>
        </Card>
      ),
    },
    {
      title: "Select Member",
      content: (
        <Card>
          <CardHeader className="flex flex-col gap-y-5 justify-between h-full">
            <CardTitle>Select Member</CardTitle>
            <CardDescription>
              Choose members to allocate to the manager.
            </CardDescription>

            <MultiSelect
              modalPopover={true}
              placeholder="Select Members"
              className=" justify-between rounded-lg border  shadow-sm"
              options={allMembers ?? []}
              // defaultValue={selectedMembers}
              onValueChange={(e) =>
                setStoreDetails((prev) => ({ ...prev, totalUsersId: e }))
              }
              maxCount={2}
            />
          </CardHeader>
        </Card>
      ),
    },

    // {
    //   title: "Review & Submit",
    //   content: <SelectManager allUsers={allUsers} />,
    // },
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setDirection("next");
      setCurrentStep((s) => s + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setDirection("prev");
      setCurrentStep((s) => s - 1);
    }
  };

  async function handleSubmit() {
    try {
      const res = api.post(
        `/users/managers/${storeDetails.managerId}/members`,
        {
          users: storeDetails.totalUsersId,
        }
      );
      const data = (await res).data;
      console.log(data);
      prevStep();
      toast("Success", {
        description: "Members added",
        style: { backgroundColor: "white", color: "black" },
        richColors: true,
      });
    } catch (error) {
      console.error(error);
      toast("Error", {
        description: "Member already assigned",
        style: { backgroundColor: "white", color: "black" },
        richColors: true,
      });
    }
  }
  return (
    <Card className=" max-w-2xl max-sm:max-w-sm  flex items-center mx-auto">
      <CardContent className="">
        <div className="w-full flex flex-col  ">
          <div className="w-full flex  mb-8">
            <div className="flex items-cente bgbl w-2/3 justify-start">
              {steps.map((_, index) => (
                <div key={index} className="flex-1  flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-all duration-200
            ${index <= currentStep ? "bg-blue-600" : "bg-gray-300"}`}
                  >
                    {index + 1}
                  </div>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 transition-all duration-200
              ${index < currentStep ? "bg-blue-600" : "bg-gray-300"}`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content with CSS transition */}
          <div className="relative h-[250px]  w-[300px]   p-2  overflow-hidden">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`absolute top-0 left-0 w-full h-full transition-all duration-500 ease-in-out transform 
              ${
                index === currentStep
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 pointer-events-none"
              } 
              ${
                index < currentStep && direction === "next"
                  ? "-translate-x-full"
                  : ""
              }
              ${
                index > currentStep && direction === "prev"
                  ? "translate-x-full"
                  : ""
              }`}
              >
                {step.content}
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <CardFooter className="flex w-[200px] justify-between">
            <>
              <Button
                onClick={prevStep}
                disabled={currentStep === 0}
                className="px-4 py-2 rounded bg-gray-300 disabled:opacity-50"
              >
                Back
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button
                  disabled={!storeDetails.managerId.trim()}
                  onClick={nextStep}
                  className="px-4 py-2 rounded bg-blue-600 text-white"
                >
                  Next
                </Button>
              ) : (
                <Button
                  disabled={storeDetails.totalUsersId.length === 0}
                  onClick={handleSubmit}
                  className="px-4 py-2 rounded bg-green-600 text-white"
                >
                  Submit
                </Button>
              )}
            </>
          </CardFooter>
        </div>
      </CardContent>
    </Card>
  );
}

export default AssignManager;
