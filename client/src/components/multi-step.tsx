import { useState } from "react";

interface Step {
  title: string;
  content: React.ReactNode;
}

interface ChildrenProps {
  StepOne: any;
  StepTwo: any;
}
export default function MultiStepForm({ StepOne, StepTwo }: ChildrenProps) {
  const steps: Step[] = [
    { title: "Personal Info", content: <StepOne /> },
    { title: "Address", content: <StepTwo /> },
    { title: "Review & Submit", content: <StepThree /> },
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

  return (
    <div className="w-full mx-auto p-6">
      {/* Stepper Header */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((_, index) => (
          <div key={index} className="flex-1 flex items-center">
            <div
              className={`w-10 h-10 rounded-full duration-200 transition-all flex items-center justify-center text-white 
              ${index <= currentStep ? "bg-blue-600" : "bg-gray-300"}`}
            >
              {index + 1}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 ${
                  index < currentStep ? "bg-blue-600" : "bg-gray-300"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content with CSS transition */}
      <div className="relative h-48 mb-6 overflow-hidden">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`absolute top-0 left-0 w-full transition-all duration-500 ease-in-out transform 
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
      <div className="flex justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className="px-4 py-2 rounded bg-gray-300 disabled:opacity-50"
        >
          Back
        </button>
        {currentStep < steps.length - 1 ? (
          <button
            onClick={nextStep}
            className="px-4 py-2 rounded bg-blue-600 text-white"
          >
            Next
          </button>
        ) : (
          <button
            onClick={() => alert("Form submitted!")}
            className="px-4 py-2 rounded bg-green-600 text-white"
          >
            Submit
          </button>
        )}
      </div>
    </div>
  );
}

/* Example Step Components */
// function StepOne() {
//   return (
//     <div>
//       <h2 className="text-xl font-semibold mb-4">Personal Info</h2>
//       <input
//         type="text"
//         placeholder="Name"
//         className="w-full border p-2 rounded mb-3"
//       />
//       <input
//         type="email"
//         placeholder="Email"
//         className="w-full border p-2 rounded"
//       />
//     </div>
//   );
// }

// function StepTwo() {
//   return (
//     <div>
//       <h2 className="text-xl font-semibold mb-4">Address</h2>
//       <input
//         type="text"
//         placeholder="Street"
//         className="w-full border p-2 rounded mb-3"
//       />
//       <input
//         type="text"
//         placeholder="City"
//         className="w-full border p-2 rounded"
//       />
//     </div>
//   );
// }

function StepThree() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Review</h2>
      <p>Check your details before submitting.</p>
    </div>
  );
}
