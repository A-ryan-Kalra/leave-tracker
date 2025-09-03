import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { SelectManager } from "./select-manager";
import { useState } from "react";
import { api } from "@/utils/api";
import { toast } from "sonner";
import { useNavigate } from "react-router";
interface Step {
  title: string;
  content: React.ReactNode;
}

interface AssignMemberProps {
  allUsers: [{ fullName: string; id: string; role: string }] | null;
}

function AssignMember({ allUsers }: AssignMemberProps) {
  const [storeDetails, setStoreDetails] = useState<{
    managerId: string;
    name: string;
    role: string;
  }>({ managerId: "", role: "", name: "" });

  const steps: Step[] = [
    {
      title: "Select manager",
      content: (
        <Card className="">
          <CardHeader className="flex flex-col gap-y-5 justify-between h-full">
            <CardTitle>Manager Assignment</CardTitle>
            <CardDescription>
              Please assign or unassign a manager before allocating members.
            </CardDescription>
            <SelectManager
              filter="all"
              allUsers={allUsers}
              callback={(id: string, role: string, name: string) =>
                setStoreDetails((prev) => ({
                  ...prev,
                  managerId: id,
                  role,
                  name,
                }))
              }
            />
          </CardHeader>
        </Card>
      ),
    },

    {
      title: "Submit",
      content: (
        <Card className="h-[150px]">
          <CardHeader className="flex flex-col gap-y-5 text-2xl justify-between h-full">
            <CardTitle>{storeDetails.name}</CardTitle>
            <CardDescription>
              Please{" "}
              {storeDetails.role === "TEAM_MEMBER" ? "assign" : "unassign"} a
              manager
            </CardDescription>
          </CardHeader>
        </Card>
      ),
    },
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const navigate = useNavigate();
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
      api.post(
        `/users/assign-manager/${storeDetails.managerId}?choice=${storeDetails.role}`
      );

      prevStep();

      toast("Success", {
        description: `Manager ${
          storeDetails.role === "TEAM_MEMBER" ? "assigned" : "unassigned"
        }`,
        style: { backgroundColor: "white", color: "black" },
        richColors: true,
      });
      setTimeout(() => {
        navigate(0);
      }, 2000);
    } catch (error) {
      console.error(error);
      toast("Error", {
        description: "Something went wrong",
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
                  disabled={!storeDetails.managerId.trim()}
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

export default AssignMember;
