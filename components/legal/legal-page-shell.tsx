import type { ReactNode } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import { SiteLegalLinks } from "@/components/legal/site-legal-links";
import { PLATFORM_NAME, SUPPORT_EMAIL } from "@/lib/legal";

export type LegalSection = {
  id: string;
  title: string;
  content: ReactNode;
};

export type LegalHighlight = {
  label: string;
  value: string;
  detail?: string;
};

type LegalPageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  lastUpdated: string;
  highlights: LegalHighlight[];
  sections: LegalSection[];
};

export function buildLegalMetadata(title: string, description: string): Metadata {
  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${PLATFORM_NAME}`,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${PLATFORM_NAME}`,
      description,
    },
  };
}

export function LegalPageShell({
  eyebrow,
  title,
  description,
  lastUpdated,
  highlights,
  sections,
}: LegalPageShellProps) {
  return (
    <div className="min-h-screen bg-grey-50">
      <header className="border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo/Bidooze.svg"
              alt={`${PLATFORM_NAME} logo`}
              width={150}
              height={32}
              className="h-8 w-auto"
              priority
            />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg border border-input px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-grey-100"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-green-700"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      <main className="bg-[radial-gradient(circle_at_top,_rgba(206,241,123,0.24),_transparent_45%),linear-gradient(180deg,_rgba(255,255,255,0.92)_0%,_rgba(246,247,246,1)_100%)]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <section className="rounded-[28px] border border-border bg-card/95 p-6 shadow-soft sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              {eyebrow}
            </p>
            <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <h1 className="text-4xl font-semibold tracking-[-0.03em] text-foreground sm:text-5xl">
                  {title}
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                  {description}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-grey-50 px-5 py-4 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">Last updated</p>
                <p className="mt-1">{lastUpdated}</p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {highlights.map((highlight) => (
                <div
                  key={highlight.label}
                  className="rounded-2xl border border-border bg-grey-50 px-5 py-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {highlight.label}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-foreground">{highlight.value}</p>
                  {highlight.detail ? (
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {highlight.detail}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </section>

          <div className="mt-8 grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="lg:sticky lg:top-6 lg:self-start">
              <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  On this page
                </p>
                <nav className="mt-4 space-y-3">
                  {sections.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="flex items-start justify-between gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-grey-50 hover:text-foreground"
                    >
                      <span>{section.title}</span>
                      <ArrowRight className="mt-0.5 h-4 w-4 shrink-0" />
                    </a>
                  ))}
                </nav>

                <div className="mt-6 rounded-2xl bg-grey-50 p-4">
                  <p className="text-sm font-semibold text-foreground">Need help?</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Contact the Bidooze support team for privacy, account, or legal requests.
                  </p>
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-foreground underline underline-offset-4"
                  >
                    <Mail className="h-4 w-4" />
                    {SUPPORT_EMAIL}
                  </a>
                </div>
              </div>
            </aside>

            <article className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-10">
              <div className="space-y-10">
                {sections.map((section) => (
                  <section key={section.id} id={section.id} className="scroll-mt-24">
                    <h2 className="text-2xl font-semibold tracking-[-0.02em] text-foreground">
                      {section.title}
                    </h2>
                    <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground sm:text-[0.95rem]">
                      {section.content}
                    </div>
                  </section>
                ))}
              </div>
            </article>
          </div>
        </div>
      </main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">{PLATFORM_NAME}</p>
            <p className="text-sm text-muted-foreground">
              Public legal documents for platform accounts, auctions, and authentication services.
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 md:items-end">
            <SiteLegalLinks />
            <p className="text-xs text-muted-foreground">
              Contact:{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="underline underline-offset-4"
              >
                {SUPPORT_EMAIL}
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
