import Link from "next/link";
import {
  LegalPageShell,
  buildLegalMetadata,
  type LegalSection,
} from "@/components/legal/legal-page-shell";
import { LEGAL_LAST_UPDATED, SUPPORT_EMAIL } from "@/lib/legal";

export const metadata = buildLegalMetadata(
  "User Data Deletion Instructions",
  "Public data deletion instructions for Bidooze users, including accounts created with normal authentication, Google, or Meta/Facebook."
);

const sections: LegalSection[] = [
  {
    id: "overview",
    title: "Overview",
    content: (
      <>
        <p>
          This page explains how a Bidooze user can request deletion of an account and
          related personal data. These instructions apply to accounts created with email
          and password, Google, or Meta/Facebook, and to data collected through the
          broader Bidooze platform.
        </p>
        <p>
          Removing Bidooze from your Google or Meta/Facebook connected apps stops
          future access from that provider, but it does not automatically delete data
          already stored by Bidooze. A deletion request must still be submitted
          directly to Bidooze.
        </p>
      </>
    ),
  },
  {
    id: "request-deletion",
    title: "How To Request Deletion",
    content: (
      <>
        <p>To request deletion of your Bidooze account and associated personal data:</p>
        <ol className="list-decimal space-y-2 pl-6">
          <li>
            Send an email to{" "}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="font-medium text-foreground underline underline-offset-4"
            >
              {SUPPORT_EMAIL}
            </a>{" "}
            from the email address connected to your Bidooze account whenever possible.
          </li>
          <li>
            Use a subject line such as{" "}
            <span className="font-medium text-foreground">
              Account Deletion Request
            </span>
            .
          </li>
          <li>
            Include your full name, account email address, business or profile name,
            and the sign-in method used on the account, such as email/password,
            Google, or Meta/Facebook.
          </li>
          <li>
            If you no longer control the registered email address, explain that in the
            request so the support team can ask for alternative verification before
            processing deletion.
          </li>
        </ol>
      </>
    ),
  },
  {
    id: "what-happens-next",
    title: "What Happens After You Submit a Request",
    content: (
      <>
        <p>
          Bidooze may ask for additional information to verify identity and confirm
          that the request is authorized before deleting data.
        </p>
        <p>After verification, Bidooze will generally:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Disable or close the account.</li>
          <li>Delete or anonymize personal information that is no longer required.</li>
          <li>
            Remove stored access relationships tied to Google or Meta/Facebook login
            where applicable.
          </li>
          <li>
            Retain only the limited records that must be preserved for legal, tax,
            accounting, fraud prevention, dispute handling, or security reasons.
          </li>
        </ul>
        <p>
          Bidooze aims to acknowledge deletion requests within 3 business days and
          complete review and processing within a reasonable period, subject to
          verification and any legal retention requirements.
        </p>
      </>
    ),
  },
  {
    id: "data-that-may-be-retained",
    title: "Data That May Be Retained",
    content: (
      <>
        <p>
          Some data may need to be retained even after an account is deleted. Examples
          can include:
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Transaction, payout, tax, and accounting records.</li>
          <li>Bid history, dispute records, fraud review records, and abuse prevention logs.</li>
          <li>Compliance, audit, and security records needed to meet legal obligations.</li>
          <li>Backups that are automatically overwritten on a delayed cycle.</li>
        </ul>
      </>
    ),
  },
  {
    id: "manage-connected-apps",
    title: "Google and Meta/Facebook Connected Apps",
    content: (
      <>
        <p>
          If you signed in through Google or Meta/Facebook, you may also remove
          Bidooze from the connected apps list inside your provider account settings.
          That action can revoke provider access tokens or future sign-in permissions.
        </p>
        <p>
          Provider-side removal does not replace a direct deletion request to Bidooze
          because the platform may still retain account or auction records already
          created under your profile.
        </p>
      </>
    ),
  },
  {
    id: "related-policies",
    title: "Related Policies and Contact",
    content: (
      <>
        <p>
          For more detail about how Bidooze handles data before deletion, review the{" "}
          <Link
            href="/privacy-policy"
            className="font-medium text-foreground underline underline-offset-4"
          >
            Privacy Policy
          </Link>
          . Platform use is also governed by the{" "}
          <Link
            href="/terms-and-conditions"
            className="font-medium text-foreground underline underline-offset-4"
          >
            Terms and Conditions
          </Link>
          .
        </p>
        <p>
          For help with a deletion request, email{" "}
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

export default function DataDeletionPage() {
  return (
    <LegalPageShell
      eyebrow="Account Removal"
      title="User Data Deletion Instructions"
      description="These instructions apply to the full Bidooze platform and cover accounts created with standard authentication, Google sign-in, and Meta/Facebook sign-in."
      lastUpdated={LEGAL_LAST_UPDATED}
      highlights={[
        {
          label: "Request Channel",
          value: SUPPORT_EMAIL,
          detail: "Submit deletion requests directly to support so identity can be verified first.",
        },
        {
          label: "Auth Methods Covered",
          value: "Email, Google, Meta",
          detail: "The deletion process applies regardless of how the account was created or accessed.",
        },
        {
          label: "Important Note",
          value: "Provider disconnect is not enough",
          detail: "Removing Bidooze from Google or Meta/Facebook does not automatically erase Bidooze data.",
        },
      ]}
      sections={sections}
    />
  );
}
