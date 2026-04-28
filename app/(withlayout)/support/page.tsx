"use client";

import { useEffect, useState } from "react";
import { useNavigation } from "@/context/nav-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  BookOpen,
  HelpCircle,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";
import { withAuth } from "@/services/api";

// ─── FAQ data ─────────────────────────────────────────────────────────────────

const FAQ = [
  {
    q: "How do I publish my auction?",
    a: "Go to your auction detail page, complete all required sections (lots, settings, dates), then click 'Publish'.",
  },
  {
    q: "Why are bids above the maximum bid requiring approval?",
    a: "When a bidder places a bid that exceeds the maximum bid limit set for an auction or lot, it is held as 'pending' and requires your approval. You'll receive a notification and can approve or reject it from the live console or the bids panel.",
  },
  {
    q: "How do floor bidders work?",
    a: "Floor bidders are in-room participants who are not registered online. You can add them from the live console, assign them a bidder number, and place bids on their behalf using that number.",
  },
  {
    q: "What is the feature slot system?",
    a: "Feature slots are homepage placements you can bid on to promote your auctions. Once you win a slot, you can assign one of your auctions to it for the duration of your win.",
  },
  {
    q: "How does settlement work?",
    a: "After an auction ends, Bidooze generates invoices for buyers and payout summaries for consignors. You can review, send invoices, and initiate payouts from the Settlement tab inside your auction.",
  },
  {
    q: "How do I set bid increment schedules?",
    a: "In your auction settings, navigate to the 'Bid Increments' section. You can define ranges — e.g. increment by $25 up to $1,000, then $50 up to $5,000 — and the system applies them automatically.",
  },
  {
    q: "Can I block a bidder from my auctions?",
    a: "Yes. From the Customers section, find the bidder and use the 'Block' action. This prevents them from bidding across all your auctions globally.",
  },
  {
    q: "How do I start a live auction session?",
    a: "Open your auction, go to the Live Console tab, and click 'Start Session'. You can then advance lots, place floor bids, and manage the live flow from that panel.",
  },
];

// ─── Contact form ─────────────────────────────────────────────────────────────

type Category = "auction_management" | "billing_payouts" | "technical_issue" | "account_profile" | "others";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "auction_management", label: "Auction Management" },
  { value: "billing_payouts", label: "Billing & Payouts" },
  { value: "technical_issue", label: "Technical Issue" },
  { value: "account_profile", label: "Account & Profile" },
  { value: "others", label: "Other" },
];

function SupportForm() {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !category || !message.trim()) return;
    setSubmitting(true);
    try {
      await withAuth.post("/auctioneer/support", { category, subject, message });
      toast.success("Support request submitted", {
        description: "Our team will get back to you within 1–2 business days.",
      });
      setSubject("");
      setCategory("");
      setMessage("");
    } catch {
      toast.error("Failed to submit request", {
        description: "Please try again or email us directly at support@bidooze.com.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="support-category" className="font-body font-medium">Category</Label>
        <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
          <SelectTrigger id="support-category" className="font-body">
            <SelectValue placeholder="Select a category..." />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value} className="font-body">
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="support-subject" className="font-body font-medium">Subject</Label>
        <Input
          id="support-subject"
          placeholder="Brief description of your issue"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="font-body"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="support-message" className="font-body font-medium">Message</Label>
        <Textarea
          id="support-message"
          placeholder="Describe your issue in detail. Include auction IDs or lot numbers if relevant."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="font-body"
          rows={6}
          required
        />
      </div>

      <Button
        type="submit"
        className="w-full gap-2 font-body gradient-gold border-0 text-accent-foreground hover:opacity-90"
        disabled={submitting || !subject.trim() || !category || !message.trim()}
      >
        {submitting ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
        ) : (
          <><Send className="h-4 w-4" /> Submit Request</>
        )}
      </Button>
    </form>
  );
}

// ─── Contact card ─────────────────────────────────────────────────────────────

function ContactCard({
  icon: Icon,
  title,
  detail,
  badge,
  badgeClassName,
}: {
  icon: React.ElementType;
  title: string;
  detail: string;
  badge: string;
  badgeClassName?: string;
}) {
  return (
    <Card className="border border-border shadow-soft">
      <CardContent className="flex flex-col items-center text-center p-6 gap-3">
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
          <Icon className="w-5 h-5 text-muted-foreground" />
        </div>
        <div>
          <p className="font-body font-semibold text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground font-body mt-0.5">{detail}</p>
        </div>
        <Badge variant="outline" className={`text-xs font-body ${badgeClassName ?? ""}`}>{badge}</Badge>
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SupportPage() {
  const { setTitle } = useNavigation();
  useEffect(() => { setTitle("Support"); }, [setTitle]);

  return (
    <div className="space-y-8 pb-10">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-display font-semibold text-foreground">Support</h1>
        <p className="text-sm text-muted-foreground font-body mt-1">
          Get help, browse FAQs, or reach our team directly.
        </p>
      </div>

      {/* Contact channels */}
      <div className="grid gap-4 sm:grid-cols-3">
        <ContactCard
          icon={Mail}
          title="Email Support"
          detail="support@bidooze.com"
          badge="1-2 business days"
        />
        <ContactCard
          icon={MessageCircle}
          title="Live Chat"
          detail="Mon - Fri, 9 AM - 6 PM EST"
          badge="Online now"
          badgeClassName="bg-green-50 text-green-700 border-green-200"
        />
        <ContactCard
          icon={Phone}
          title="Phone"
          detail="+1 (800) 000-0000"
          badge="Business hours only"
        />
      </div>

      {/* FAQ + Form two-column layout */}
      <div className="grid gap-10 lg:grid-cols-[1fr_400px] lg:items-start">
        {/* FAQ */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center">
              <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <h2 className="font-display font-semibold text-foreground">Frequently Asked Questions</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-2">
            {FAQ.map((item, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border border-border rounded-lg px-4 shadow-soft"
              >
                <AccordionTrigger className="text-sm font-body font-medium text-left hover:no-underline py-4">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground font-body pb-4 leading-relaxed">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Contact form — sticky on desktop */}
        <section className="space-y-4 lg:sticky lg:top-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center">
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <h2 className="font-display font-semibold text-foreground">Submit a Request</h2>
          </div>
          <Card className="border border-border shadow-soft">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground font-body mb-5">
                Can&apos;t find what you&apos;re looking for? Send us a message and we&apos;ll get back to you.
              </p>
              <SupportForm />
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
