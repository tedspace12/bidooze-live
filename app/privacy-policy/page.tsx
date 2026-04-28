import Link from "next/link";
import {
  LegalPageShell,
  buildLegalMetadata,
  type LegalSection,
} from "@/components/legal/legal-page-shell";
import { LEGAL_LAST_UPDATED, SUPPORT_EMAIL } from "@/lib/legal";

export const metadata = buildLegalMetadata(
  "Privacy Policy",
  "Platform-wide privacy policy for Bidooze accounts, auctions, normal authentication, Google sign-in, and Meta/Facebook sign-in."
);

const sections: LegalSection[] = [
  {
    id: "overview",
    title: "Overview",
    content: (
      <>
        <p>
          This Privacy Policy explains how Bidooze collects, uses, stores, and shares
          personal information when people access the Bidooze website, create accounts,
          participate in auctions, contact support, or authenticate with email and
          password, Google, or Meta/Facebook.
        </p>
        <p>
          This policy applies to the full platform, including seller registration,
          bidder access, account administration, support requests, auction activity, and
          any connected authentication flow made available through the platform.
        </p>
      </>
    ),
  },
  {
    id: "information-we-collect",
    title: "Information We Collect",
    content: (
      <>
        <p>Bidooze may collect the following categories of information:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            Account and contact details such as name, email address, phone number,
            business address, company name, website, and profile image.
          </li>
          <li>
            Registration and verification details such as business registration
            numbers, tax identifiers, licensing information, certifications, bank or
            payout information, and identity or compliance documents submitted during
            onboarding.
          </li>
          <li>
            Auction and transaction data such as listings, lots, bids, bidder
            approvals, payment status, settlement activity, reporting data, and support
            history.
          </li>
          <li>
            Device and usage data such as IP address, browser type, operating system,
            log events, session activity, and approximate location derived from
            technical signals.
          </li>
          <li>
            Cookies and similar technologies used to maintain sessions, protect
            accounts, remember preferences, and understand platform usage.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "authentication-methods",
    title: "Authentication Methods and Social Login Data",
    content: (
      <>
        <p>
          When you create or access a Bidooze account with normal authentication, we
          collect the credentials and account details required to identify you and
          secure your account.
        </p>
        <p>
          When you use Google or Meta/Facebook login, Bidooze may receive basic
          profile data made available by that provider, such as your name, email
          address, profile photo, provider account identifier, and authentication token
          needed to verify sign-in.
        </p>
        <p>
          Social sign-in does not limit this policy to a single provider. The same
          privacy rules apply across email/password authentication, Google sign-in,
          Meta/Facebook sign-in, and any future authentication method offered through
          the platform.
        </p>
      </>
    ),
  },
  {
    id: "how-we-use-data",
    title: "How We Use Data",
    content: (
      <>
        <p>Bidooze uses personal information to:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Create, authenticate, administer, and secure platform accounts.</li>
          <li>
            Operate auctions, manage listings, approve bidders, process settlements,
            and provide platform features.
          </li>
          <li>
            Review auctioneer registrations, compliance submissions, risk checks, and
            support tickets.
          </li>
          <li>
            Send service communications such as login notices, platform alerts, auction
            updates, and security messages.
          </li>
          <li>
            Investigate misuse, fraud, policy violations, disputes, and legal claims.
          </li>
          <li>
            Monitor performance, debug issues, improve reliability, and develop new
            features.
          </li>
          <li>
            Comply with applicable legal, accounting, tax, regulatory, and
            recordkeeping obligations.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "sharing-and-disclosure",
    title: "Sharing and Disclosure",
    content: (
      <>
        <p>Bidooze does not sell personal information.</p>
        <p>We may share information with:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            Service providers that help host, secure, support, or operate the
            platform.
          </li>
          <li>
            Payment, compliance, identity verification, storage, communication, or
            analytics providers as needed to deliver the service.
          </li>
          <li>
            Other users when necessary for auction participation, such as bidder
            approvals, winning transactions, or seller-facing workflows.
          </li>
          <li>
            Regulators, courts, law enforcement, or other parties when required by law
            or necessary to protect rights, safety, or the platform.
          </li>
          <li>
            Successors or counterparties involved in a merger, financing, acquisition,
            or business transfer.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "retention-security-rights",
    title: "Retention, Security, and Your Rights",
    content: (
      <>
        <p>
          Bidooze keeps information for as long as reasonably necessary to provide
          services, manage auctions, maintain security, resolve disputes, and satisfy
          legal, tax, accounting, and compliance obligations.
        </p>
        <p>
          We apply administrative, technical, and organizational safeguards designed to
          protect account data and reduce unauthorized access, disclosure, or misuse.
        </p>
        <p>
          Depending on your jurisdiction, you may have rights to access, correct,
          update, export, or request deletion of certain personal information. Deletion
          requests are handled through the public instructions on the{" "}
          <Link
            href="/data-deletion"
            className="font-medium text-foreground underline underline-offset-4"
          >
            Data Deletion
          </Link>{" "}
          page.
        </p>
      </>
    ),
  },
  {
    id: "contact-and-updates",
    title: "Contact and Policy Updates",
    content: (
      <>
        <p>
          If you have a privacy question, want to update your information, or need help
          with a privacy-related request, contact{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="font-medium text-foreground underline underline-offset-4"
          >
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
        <p>
          Bidooze may update this Privacy Policy from time to time. Material updates
          will be posted on this page with a revised effective date.
        </p>
      </>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPageShell
      eyebrow="Platform Privacy"
      title="Privacy Policy"
      description="This policy covers the full Bidooze platform, including standard accounts, Google sign-in, Meta/Facebook sign-in, auction workflows, onboarding, and support operations."
      lastUpdated={LEGAL_LAST_UPDATED}
      highlights={[
        {
          label: "Applies To",
          value: "All Bidooze accounts",
          detail: "Covers auctioneers, bidders, admins, visitors, and support interactions.",
        },
        {
          label: "Auth Methods",
          value: "Email, Google, Meta",
          detail: "The same platform-wide privacy rules apply across each supported sign-in method.",
        },
        {
          label: "Privacy Contact",
          value: SUPPORT_EMAIL,
          detail: "Use this contact for privacy questions, updates, and personal data requests.",
        },
      ]}
      sections={sections}
    />
  );
}
