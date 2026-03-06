import {
  Contact2,
  Building2,
  Banknote,
  Briefcase,
  ShieldCheck,
  Check,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface Step {
  id: number;
  title: string;
  description: string;
  icon: LucideIcon;
}

interface RegistrationSidebarProps {
  currentStep: number;
  onStepClick?: (stepId: number) => void;
}

type StepState = "completed" | "active" | "upcoming";

const FULL_LOGO_SRC = "/logo/Bidooze2.svg";
const ICON_ONLY_LOGO_SRC = "/logo/BIDOOZE_ICON2.svg";

const steps: Step[] = [
  {
    id: 1,
    title: "Business Information",
    description: "Business profile details.",
    icon: Building2,
  },
  {
    id: 2,
    title: "Contact Information",
    description: "Basic contact information",
    icon: Contact2,
  },
  {
    id: 3,
    title: "Banking Information",
    description: "Basic banking info",
    icon: Banknote,
  },
  {
    id: 4,
    title: "Professional Credentials",
    description: "Professional details",
    icon: Briefcase,
  },
  {
    id: 5,
    title: "Verification",
    description: "ID verification",
    icon: ShieldCheck,
  },
];

export const REGISTRATION_STEPS = steps.map(({ id, title }) => ({ id, title }));

const getStepState = (currentStep: number, stepId: number): StepState => {
  if (currentStep > stepId) return "completed";
  if (currentStep === stepId) return "active";
  return "upcoming";
};

export const RegistrationSidebar = ({ currentStep, onStepClick }: RegistrationSidebarProps) => {
  return (
    <aside
      className="hidden md:fixed md:inset-y-0 md:left-0 md:flex min-h-screen flex-col bg-[#3F4F22] md:w-[72px] lg:w-96 md:px-3 md:py-4 lg:p-8 transition-[width,padding] duration-300"
      aria-label="Registration progress"
    >
      <div className="mb-10 lg:mb-12 flex items-center justify-center lg:justify-start">
        <Image
          src={ICON_ONLY_LOGO_SRC}
          alt="Bidooze"
          height={40}
          width={40}
          className="h-10 w-10 lg:hidden"
          priority
        />
        <div className="hidden lg:flex max-w-4xl items-center gap-1 text-white">
          <Image
            src={FULL_LOGO_SRC}
            alt="Bidooze Logo"
            height={255}
            width={255}
            className="h-10 w-auto"
            priority
          />
        </div>
      </div>

      <div className="flex-1 space-y-6 lg:space-y-8">
        {steps.map((step, index) => {
          const stepState = getStepState(currentStep, step.id);
          const isCompleted = stepState === "completed";
          const isActive = stepState === "active";
          const isClickable = isCompleted && Boolean(onStepClick);
          const Icon = step.icon;

          return (
            <div key={step.id} className="relative">
              <div className="flex items-start gap-0 lg:gap-4 md:justify-center lg:justify-start">
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick?.(step.id)}
                  disabled={!isClickable}
                  className={cn(
                    "relative z-10 w-11 h-11 lg:w-12 lg:h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                    isCompleted &&
                      "bg-[#2F3A1B] border-[#8FAE5B] text-[#CEF17B]",
                    isActive &&
                      "bg-[#CEF17B] border-[#CEF17B] text-[#445E72]",
                    stepState === "upcoming" &&
                      "bg-transparent border-white/35 text-white/70",
                    isClickable
                      ? "cursor-pointer hover:border-[#CEF17B] hover:ring-2 hover:ring-[#CEF17B]/30"
                      : "cursor-default"
                  )}
                  aria-current={isActive ? "step" : undefined}
                  aria-label={isClickable ? `Go to ${step.title}` : step.title}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </button>
                <div className="hidden lg:block pt-2 transition-[opacity,max-width] duration-300 lg:max-w-xs lg:opacity-100">
                  <h3
                    className={cn(
                      "font-semibold text-base mb-1 transition-colors duration-300",
                      isCompleted && "text-[#CEEDB2]",
                      isActive && "text-[#CEF17B]",
                      stepState === "upcoming" && "text-white"
                    )}
                  >
                    {step.title}
                  </h3>
                  <p
                    className={cn(
                      "text-sm transition-colors duration-300",
                      isCompleted && "text-white/70",
                      isActive && "text-[#CEEDB2]",
                      stepState === "upcoming" && "text-white/50"
                    )}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "absolute z-0 w-0.5 transition-colors duration-300 md:left-1/2 md:-translate-x-1/2 md:top-11 md:h-6 lg:left-6 lg:translate-x-0 lg:top-14 lg:h-8",
                    currentStep > step.id ? "bg-[#CEF17B]" : "bg-white/25"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-auto pt-8 hidden lg:block">
        <p className="text-white text-sm">All rights reserved Bidooze</p>
      </div>
    </aside>
  );
};
