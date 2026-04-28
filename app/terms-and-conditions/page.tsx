import {
  LegalPageShell,
  buildLegalMetadata,
  type LegalSection,
} from "@/components/legal/legal-page-shell";
import {
  LEGAL_LAST_UPDATED,
  PLATFORM_NAME,
  SUPPORT_EMAIL,
} from "@/lib/legal";

export const metadata = buildLegalMetadata(
  "Terms and Conditions",
  "Platform-wide terms and conditions for Bidooze users, including normal authentication, Google sign-in, and Meta/Facebook sign-in."
);

const sections: LegalSection[] = [
  {
    id: "acceptance",
    title: "Acceptance of These Terms",
    content: (
      <>
        <p>
          These Terms and Conditions govern access to and use of the Bidooze platform,
          including public pages, registration flows, dashboards, auction management
          tools, bidder access, reporting features, and support channels.
        </p>
        <p>
          By accessing or using Bidooze, creating an account, authenticating with email
          and password, Google, or Meta/Facebook, or participating in an auction
          through the platform, you agree to these Terms and to the related platform
          policies.
        </p>
      </>
    ),
  },
  {
    id: "eligibility-and-accounts",
    title: "Eligibility and Accounts",
    content: (
      <>
        <p>
          You must provide accurate, current, and complete information when registering
          for a Bidooze account or submitting verification materials.
        </p>
        <p>
          You are responsible for maintaining the confidentiality of your account
          credentials, controlling access to your account, and ensuring that any
          activity performed through your account is authorized.
        </p>
        <p>
          Bidooze may suspend or reject registration, onboarding, bidder approval, or
          account access where information is incomplete, inaccurate, fraudulent, or
          inconsistent with platform policies.
        </p>
      </>
    ),
  },
  {
    id: "authentication-and-security",
    title: "Authentication and Security",
    content: (
      <>
        <p>
          Bidooze may allow access through standard credentials, Google sign-in, or
          Meta/Facebook sign-in. Each sign-in method is subject to these same Terms.
        </p>
        <p>
          You agree not to bypass authentication controls, misuse another person&apos;s
          account, interfere with login flows, or use social sign-in data in any
          unauthorized manner.
        </p>
        <p>
          If you believe your account has been compromised, you must notify{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="font-medium text-foreground underline underline-offset-4"
          >
            {SUPPORT_EMAIL}
          </a>{" "}
          promptly.
        </p>
      </>
    ),
  },
  {
    id: "platform-use",
    title: "Use of the Platform",
    content: (
      <>
        <p>
          You may use {PLATFORM_NAME} only for lawful business or personal purposes
          connected to auction participation and related account management.
        </p>
        <p>You agree not to:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Post false, misleading, infringing, or unlawful content.</li>
          <li>Manipulate bids, impersonate another user, or interfere with auction fairness.</li>
          <li>Upload malicious code, scrape restricted platform data, or attempt unauthorized access.</li>
          <li>Use the service in violation of applicable law, contract, or regulatory requirements.</li>
          <li>Reverse engineer, disrupt, or overload the platform infrastructure.</li>
        </ul>
      </>
    ),
  },
  {
    id: "auctions-payments-and-records",
    title: "Auctions, Payments, and Records",
    content: (
      <>
        <p>
          Auction terms, bidder approval rules, reserve settings, payment requirements,
          and settlement steps may vary by auction, seller, jurisdiction, or
          transaction type.
        </p>
        <p>
          You are responsible for reviewing the specific rules shown in each auction
          flow, including listing information, bidder obligations, payment deadlines,
          and any applicable fees or charges.
        </p>
        <p>
          Bidooze may maintain platform records, logs, and audit trails relating to
          auctions, bids, payouts, communications, and disputes for operational,
          compliance, and legal purposes.
        </p>
      </>
    ),
  },
  {
    id: "intellectual-property",
    title: "Intellectual Property and Content",
    content: (
      <>
        <p>
          The Bidooze website, software, design, branding, and platform materials are
          owned by Bidooze or its licensors and are protected by applicable
          intellectual property laws.
        </p>
        <p>
          You retain rights in content you submit, but you grant Bidooze the rights
          reasonably necessary to host, display, process, moderate, transmit, and
          archive that content in connection with operation of the platform.
        </p>
      </>
    ),
  },
  {
    id: "termination-and-disclaimers",
    title: "Termination, Disclaimers, and Liability Limits",
    content: (
      <>
        <p>
          Bidooze may suspend, restrict, or terminate access at any time where needed
          for security, fraud prevention, legal compliance, non-payment, misuse, or
          violation of these Terms.
        </p>
        <p>
          The platform is provided on an as-available and as-is basis to the maximum
          extent permitted by law. Bidooze does not guarantee uninterrupted
          availability, specific auction outcomes, bidder behavior, or error-free
          operation.
        </p>
        <p>
          To the maximum extent permitted by law, Bidooze is not liable for indirect,
          incidental, special, consequential, or punitive damages arising from platform
          use, auction activity, third-party services, or account access issues.
        </p>
      </>
    ),
  },
  {
    id: "policy-updates-and-contact",
    title: "Policy Updates and Contact",
    content: (
      <>
        <p>
          Bidooze may update these Terms from time to time. Continued use of the
          platform after an updated version becomes effective means you accept the
          revised Terms.
        </p>
        <p>
          Questions about these Terms can be sent to{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="font-medium text-foreground underline underline-offset-4"
          >
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </>
    ),
  },
];

export default function TermsAndConditionsPage() {
  return (
    <LegalPageShell
      eyebrow="Platform Terms"
      title="Terms and Conditions"
      description="These terms apply to the entire Bidooze platform, including standard sign-in, Google sign-in, Meta/Facebook sign-in, account onboarding, auction operations, and support workflows."
      lastUpdated={LEGAL_LAST_UPDATED}
      highlights={[
        {
          label: "Platform Scope",
          value: "All Bidooze services",
          detail: "Includes public pages, dashboards, auction tools, and connected authentication flows.",
        },
        {
          label: "Authentication",
          value: "Email, Google, Meta",
          detail: "Every supported sign-in path is governed by the same platform terms.",
        },
        {
          label: "Legal Contact",
          value: SUPPORT_EMAIL,
          detail: "Use this contact for questions about terms, enforcement, or policy interpretation.",
        },
      ]}
      sections={sections}
    />
  );
}
