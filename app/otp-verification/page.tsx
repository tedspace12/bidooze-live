import { GalleryVerticalEnd } from "lucide-react"

import { OTPForm } from "@/components/otp-form"
import Image from "next/image"

export default function OTPPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-xs flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <Image src={'/logo/Bidooze.svg'} alt="Bidooze logo" height={255} width={255} />
        </a>
        <OTPForm />
      </div>
    </div>
  )
}
