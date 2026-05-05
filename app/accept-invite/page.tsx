import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { AcceptInvitePageContent } from "./AcceptInvitePageContent";

export default function AcceptInvitePage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Form side */}
      <div className="flex flex-col gap-4 p-6 md:p-10 order-2">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <Image
              src="/logo/Bidooze.svg"
              alt="Bidooze"
              width={225}
              height={225}
              className="w-auto h-16"
            />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <Suspense fallback={<div className="h-48 animate-pulse rounded-xl bg-muted" />}>
              <AcceptInvitePageContent />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Banner side */}
      <div className="bg-muted relative hidden lg:block order-1">
        <Image
          src="/login-banner5.png"
          alt="Banner"
          fill
          sizes="50vw"
          className="object-cover dark:brightness-[0.2] dark:grayscale"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex flex-col items-start justify-end p-10 text-white">
          <p className="text-lg font-semibold leading-snug">
            You&apos;ve been invited to join a team on Bidooze Live.
          </p>
          <p className="mt-1 text-sm text-white/70">
            Activate your account to start collaborating.
          </p>
        </div>
      </div>
    </div>
  );
}
