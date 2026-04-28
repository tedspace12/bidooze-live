import { LoginForm } from "@/components/auth/login/login-form"
import { SiteLegalLinks } from "@/components/legal/site-legal-links"
import Image from "next/image"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10 order-2">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <Image
              src={"/logo/Bidooze.svg"}
              alt="Bidooze logo"
              width={225}
              height={225}
              className="w-auto h-16"
            />
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs space-y-6">
            <LoginForm />
            <div className="border-t border-border pt-4">
              <SiteLegalLinks className="justify-center md:justify-start" linkClassName="text-xs" />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block order-1">
        <Image
          src="/login-banner5.png"
          alt="Login banner"
          fill
          sizes="50vw"
          className="object-cover dark:brightness-[0.2] dark:grayscale"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>
    </div>
  )
}
