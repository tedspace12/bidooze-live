import { Contact2, Building2, Banknote, Briefcase, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface RegistrationSidebarProps {
  currentStep: number;
}

const steps: Step[] = [
  {
    id: 1,
    title: "Business Information",
    description: "Business profile details.",
    icon: <Building2 className="w-5 h-5" />,
  },
  {
    id: 2,
    title: "Contact Information",
    description: "Basic contact information",
    icon: <Contact2 className="w-5 h-5" />,
  },
  {
    id: 3,
    title: "Banking Information",
    description: "Basic banking info",
    icon: <Banknote className="w-5 h-5" />,
  },
  {
    id: 4,
    title: "Professional Credentials",
    description: "Professional details",
    icon: <Briefcase className="w-5 h-5" />,
  },
  {
    id: 5,
    title: "Verification",
    description: "ID verification",
    icon: <ShieldCheck className="w-5 h-5" />,
  },
];

export const RegistrationSidebar = ({ currentStep }: RegistrationSidebarProps) => {
  return (
    <div className="bg-[#3F4F22] min-h-screen w-full md:w-96 p-8 flex flex-col fixed">
      <div className="mb-12">
        <div className="max-w-4xl flex items-center gap-1 text-white">
            <Image
              src="/logo/Bidooze2.svg"
              alt="Bidooze Logo"
              height={255}
              width={255}
              className="w-auto h-10"
            />
        </div>
      </div>


      <div className="flex-1 space-y-8">
        {steps.map((step, index) => (
          <div key={step.id} className="relative">
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all",
                  currentStep >= step.id
                    ? "bg-[#CEF17B] border-[#CEF17B] text-[#445E72]"
                    : "bg-transparent border-step-inactive text-white"
                )}
              >
                {step.icon}
              </div>
              <div className="flex-1 pt-2">
                <h3
                  className={cn(
                    "font-semibold text-base mb-1 transition-colors",
                    currentStep >= step.id ? "text-[#CEF17B]" : "text-white"
                  )}
                >
                  {step.title}
                </h3>
                <p
                  className={cn(
                    "text-sm transition-colors",
                    currentStep >= step.id ? "text-[#CEEDB2]" : "text-white/50"
                  )}
                >
                  {step.description}
                </p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className="absolute left-6 top-14 w-0.5 h-8 bg-step-inactive" />
            )}
          </div>
        ))}
      </div>

      <div className="mt-auto pt-8">
        <p className="text-white text-sm">All rights reserved Bidooze</p>
      </div>
    </div>
  );
};
