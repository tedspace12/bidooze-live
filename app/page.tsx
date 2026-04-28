'use client';
import { motion } from "framer-motion";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SiteLegalLinks } from "@/components/legal/site-legal-links";
import { SUPPORT_EMAIL } from "@/lib/legal";

const auctionRows = [
  { name: "TechFleet Q4", lots: 12, status: "Live", high: "$284,000" },
  { name: "Industrial #3341", lots: 8, status: "Live", high: "$1.1M" },
  { name: "Estate Lot 0088", lots: 24, status: "Scheduled", high: "—" },
  { name: "Fine Art Series", lots: 6, status: "Closed", high: "$870K" },
];

const statusStyle: Record<string, string> = {
  Live: "bg-green-50 text-green-700",
  Scheduled: "bg-purple-200 text-purple-700",
  Closed: "bg-grey-200 text-grey-700",
};

import { FileText, Users, TrendingUp, BarChart3 } from "lucide-react";

const cards = [
  {
    icon: FileText,
    title: "Auction Governance",
    description: "Define bidding rules, reserve structures, lot sequencing, and close conditions before your auction opens. Every parameter is locked and audited.",
  },
  {
    icon: Users,
    title: "Bidder Approval Control",
    description: "Approve or reject bidders individually. Set deposit requirements, verification thresholds, and access tiers before a single bid is submitted.",
  },
  {
    icon: TrendingUp,
    title: "Smart Pricing Mechanics",
    description: "Configure reserve prices, starting bids, increments, and anti-sniping extensions. Price mechanics enforce market discipline throughout the auction lifecycle.",
  },
  {
    icon: BarChart3,
    title: "Performance Intelligence",
    description: "Real-time analytics on bidder engagement, lot performance, reserve proximity, and settlement outcomes — available during and after every auction.",
  },
];

const steps = [
  { num: "01", title: "Create Auction", description: "Define auction type, schedule, jurisdiction parameters, and visibility settings. Set bidder eligibility criteria." },
  { num: "02", title: "Configure Lots", description: "Upload assets, assign reserves, configure increment tables, and structure lot sequencing and grouping logic.", active: true },
  { num: "03", title: "Approve Participants", description: "Review bidder documentation, accept deposits, and grant or restrict access on a per-bidder basis before go-live." },
  { num: "04", title: "Monitor & Close", description: "Track live activity with real-time bid data, trigger extensions if needed, and initiate settlement on confirmed winners." },
];

const features = [
  { title: "Bidder Credentialing", desc: "Require KYC documentation, deposit confirmation, or custom qualification criteria before granting access to any auction." },
  { title: "Reserve Management", desc: "Set hard and soft reserves per lot. Receive automated alerts when bids approach thresholds. Override at any point during the active window." },
  { title: "Audit Log & Traceability", desc: "Every bid event, bidder action, and seller decision is logged with cryptographic timestamps for post-auction reporting and dispute resolution." },
];

const bidders = [
  { name: "Hartwell Capital", verified: "KYC + Deposit", score: 94, scoreClass: "text-primary", status: "Approved", statusClass: "bg-green-50 text-green-700" },
  { name: "Meridian Asset Group", verified: "KYC + Deposit", score: 89, scoreClass: "text-primary", status: "Approved", statusClass: "bg-green-50 text-green-700" },
  { name: "Vertex Holdings", verified: "KYC + Deposit", score: 72, scoreClass: "text-purple-600", status: "Approved", statusClass: "bg-green-50 text-green-700" },
  { name: "Cascade Ventures LLC", verified: "Pending Docs", score: 61, scoreClass: "text-purple-600", status: "Pending", statusClass: "bg-grey-200 text-grey-700" },
  { name: "NovaBridge Partners", verified: "KYC Failed", score: 28, scoreClass: "text-red-800", status: "Rejected", statusClass: "bg-red-100 text-red-800" },
  { name: "Dunmore & Assoc.", verified: "Risk Flag", score: 19, scoreClass: "text-red-800", status: "Rejected", statusClass: "bg-red-100 text-red-800" },
];

import { Shield, CheckSquare, Clock, Lock, BookOpen } from "lucide-react";

const items = [
  { icon: Shield, title: "Secure Transaction Infrastructure", description: "All auction activity is processed over encrypted channels with end-to-end data integrity validation at every bid event." },
  { icon: FileText, title: "Full Audit Logging", description: "Every seller action, bidder event, and system decision is recorded with immutable timestamps — available on demand for reporting and dispute resolution." },
  { icon: CheckSquare, title: "Verified Bidder System", description: "Bidders undergo identity verification and financial qualification screening. You approve or reject access — no anonymous participants enter your auction." },
  { icon: Clock, title: "Bid Traceability", description: "Each bid is logged with bidder identity, timestamp, device fingerprint, and IP record — creating a complete, unalterable history of the auction." },
  { icon: Lock, title: "Settlement Governance", description: "Winning bids trigger structured settlement workflows with configurable timelines, payment verification gates, and transfer confirmation steps." },
  { icon: BookOpen, title: "Compliance Transparency", description: "Export auction records in standardized formats for regulatory compliance, institutional reporting, and legal documentation requirements." },
];

export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="min-h-screen overflow-x-hidden">
      <nav className="sticky top-0 z-50 border-b border-border bg-grey-50/95 backdrop-blur-xl">
        <div className="max-w-[1200px] mx-auto flex h-14 items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold text-foreground tracking-tight">
            <Image src="/logo/Bidooze.svg" alt="Bidooze Logo" width={150} height={24} className="rounded-sm" />
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            <a href="#identity" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200">
              Platform
            </a>
            <a href="#process" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200">
              How It Works
            </a>
            <a href="#tools" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200">
              Seller Tools
            </a>
            <a href="#trust" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200">
              Infrastructure
            </a>
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <a
              href="/login"
              className="rounded-lg border border-input px-4 py-2 text-sm font-semibold text-foreground transition-all duration-200 hover:border-grey-500 hover:bg-grey-100"
            >
              Sign In
            </a>
            <a
              href="/register"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:bg-green-700 hover:-translate-y-px"
            >
              Apply as Seller
            </a>
          </div>

          <button
            className="lg:hidden text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="lg:hidden border-t border-border bg-grey-50 px-4 sm:px-6 py-4 space-y-3">
            <a href="#identity" className="block text-sm font-medium text-muted-foreground">Platform</a>
            <a href="#process" className="block text-sm font-medium text-muted-foreground">How It Works</a>
            <a href="#tools" className="block text-sm font-medium text-muted-foreground">Seller Tools</a>
            <a href="#trust" className="block text-sm font-medium text-muted-foreground">Infrastructure</a>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a href="/login" className="flex-1 rounded-lg border border-input px-4 py-2 text-sm font-semibold text-foreground text-center">Sign In</a>
              <a href="/register" className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground text-center">Apply as Seller</a>
            </div>
          </div>
        )}
      </nav>
      <section className="bg-grey-50 pt-20 pb-24 overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-foreground leading-[1.1] mb-5 tracking-[-0.02em]">
                Host Structured Auctions.<br />Operate With Full Control.
              </h1>

              <p className="text-lg text-muted-foreground max-w-[460px] mb-9 leading-[1.7]">
                Bidooze is auction infrastructure for serious operators. Configure lot parameters, govern bidder access, and maintain complete visibility from listing to close.
              </p>

              <div className="flex flex-wrap items-center gap-4 mb-12">
                <a
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-[0.9375rem] font-semibold text-primary-foreground transition-all duration-200 hover:bg-green-700 hover:-translate-y-px"
                >
                  Apply as Seller →
                </a>
                <a
                  href="#tools"
                  className="inline-flex items-center gap-2 rounded-lg border-[1.5px] border-input px-6 py-3 text-[0.9375rem] font-semibold text-foreground transition-all duration-200 hover:border-grey-500 hover:bg-grey-100 hover:-translate-y-px"
                >
                  Explore the Platform
                </a>
              </div>

            </motion.div>

            {/* Right — Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="hidden lg:block"
            >
              <div className="rounded-lg border border-border bg-card overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.04)]">
                {/* Dark header bar */}
                <div className="px-4 py-3.5 bg-grey-900 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <div className="w-2 h-2 rounded-full bg-yellow-400" />
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="ml-2 text-xs font-semibold text-grey-400 uppercase tracking-widest">Seller Command Center</span>
                </div>

                <div className="p-4">
                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="rounded-lg bg-grey-50 border border-border p-3">
                      <span className="text-lg font-bold text-green-500 block">$2.4M</span>
                      <span className="text-[0.625rem] font-semibold text-muted-foreground uppercase tracking-widest">Active Volume</span>
                    </div>
                    <div className="rounded-lg bg-grey-50 border border-border p-3">
                      <span className="text-lg font-bold text-purple-600 block">47</span>
                      <span className="text-[0.625rem] font-semibold text-muted-foreground uppercase tracking-widest">Approved Bidders</span>
                    </div>
                    <div className="rounded-lg bg-grey-50 border border-border p-3">
                      <span className="text-lg font-bold text-foreground block">3</span>
                      <span className="text-[0.625rem] font-semibold text-muted-foreground uppercase tracking-widest">Live Auctions</span>
                    </div>
                  </div>

                  {/* Table */}
                  <table className="w-full text-xs">
                    <thead>
                      <tr>
                        <th className="text-left px-2 py-1.5 text-[0.625rem] font-semibold text-muted-foreground uppercase tracking-widest border-b border-border">Auction</th>
                        <th className="text-left px-2 py-1.5 text-[0.625rem] font-semibold text-muted-foreground uppercase tracking-widest border-b border-border">Lots</th>
                        <th className="text-left px-2 py-1.5 text-[0.625rem] font-semibold text-muted-foreground uppercase tracking-widest border-b border-border">Status</th>
                        <th className="text-left px-2 py-1.5 text-[0.625rem] font-semibold text-muted-foreground uppercase tracking-widest border-b border-border">Current High</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auctionRows.map((row) => (
                        <tr key={row.name} className="border-b border-grey-100 last:border-0">
                          <td className="px-2 py-2 font-medium text-foreground">{row.name}</td>
                          <td className="px-2 py-2 text-muted-foreground">{row.lots}</td>
                          <td className="px-2 py-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.625rem] font-semibold uppercase tracking-wide ${statusStyle[row.status]}`}>
                              {row.status === "Live" && <span className="w-[5px] h-[5px] rounded-full bg-primary animate-pulse-dot" />}
                              {row.status === "Scheduled" && <span className="w-[5px] h-[5px] rounded-full bg-purple-600 animate-pulse-dot" />}
                              {row.status}
                            </span>
                          </td>
                          <td className="px-2 py-2 text-muted-foreground">{row.high}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <section id="identity" className="py-24 bg-muted">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3"
            >
              Operating as a Seller on Bidooze Means
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-3xl md:text-4xl font-semibold text-foreground tracking-[-0.015em]"
            >
              Precision Tools for Professional Auction Management
            </motion.h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="group relative overflow-hidden rounded-lg border border-border bg-card p-7 transition-all duration-250 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:-translate-y-[3px]"
              >
                {/* Top green line on hover */}
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-250" />

                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center mb-5">
                  <card.icon size={20} className="text-primary" />
                </div>
                <h4 className="text-base font-semibold text-foreground mb-2.5">{card.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{card.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <section id="process" className="py-24 bg-card">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3"
            >
              Auction Lifecycle
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-3xl md:text-4xl font-semibold text-foreground tracking-[-0.015em]"
            >
              From Listing to Settlement — Every Step Structured
            </motion.h2>
          </div>

          <div className="relative grid md:grid-cols-4 gap-0 mt-12">
            {/* Connector line */}
            <div className="hidden md:block absolute top-6 left-[12.5%] right-[12.5%] h-px bg-border" />

            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="relative text-center px-4"
              >
                <div
                  className={`mx-auto mb-5  inline-flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold relative z-10 border-2 transition-all duration-300 ${step.active
                    ? "bg-purple-600 border-purple-600 text-white"
                    : "bg-card border-border text-muted-foreground"
                    }`}
                >
                  {step.num}
                </div>
                <h4 className={`text-[0.9375rem] font-semibold mb-2 ${step.active ? "text-purple-600" : "text-foreground"}`}>
                  {step.title}
                </h4>
                <p className="text-[0.8125rem] text-muted-foreground leading-relaxed mb-10 md:mb-0">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <section id="tools" className="py-24 bg-grey-50">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-20 items-start">
            {/* Left */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="pt-2"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Seller Tooling</p>
              <h2 className="text-3xl md:text-4xl font-semibold text-foreground tracking-[-0.015em] mb-5">
                Enterprise-Grade Controls at Every Stage
              </h2>
              <p className="text-[0.9375rem] text-muted-foreground leading-relaxed mb-4">
                Bidooze is not a listing platform. It is auction management infrastructure designed for operators who need governance, compliance traceability, and performance intelligence — not just a bidding window.
              </p>

              <div className="flex flex-col gap-4 mt-8">
                {features.map((f) => (
                  <div key={f.title} className="flex gap-3 items-start p-4 rounded-lg border border-border bg-card">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-1">{f.title}</h4>
                      <p className="text-[0.8125rem] text-muted-foreground">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right — Bidder Table */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="min-w-0"
            >
              <div className="rounded-lg border border-border bg-card overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                <div className="px-4 sm:px-5 py-3.5 border-b border-border flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-[0.75rem] sm:text-[0.8125rem] font-semibold text-muted-foreground uppercase tracking-wide leading-snug wrap-break-word">Bidder Access Control — Lot 4820</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.625rem] font-semibold uppercase tracking-wide bg-green-50 text-green-700">
                    <span className="w-[5px] h-[5px] rounded-full bg-primary animate-pulse-dot" />
                    Live
                  </span>
                </div>
                <div className="overflow-hidden">
                  <table className="w-full table-fixed">
                    <thead>
                      <tr>
                        <th className="w-[34%] text-left px-2 sm:px-4 py-2 sm:py-2.5 text-[0.625rem] sm:text-[0.6875rem] font-semibold text-muted-foreground uppercase tracking-wide sm:tracking-widest bg-grey-50 border-b border-border">Bidder</th>
                        <th className="w-[30%] text-left px-2 sm:px-4 py-2 sm:py-2.5 text-[0.625rem] sm:text-[0.6875rem] font-semibold text-muted-foreground uppercase tracking-wide sm:tracking-widest bg-grey-50 border-b border-border">Verified</th>
                        <th className="w-[14%] text-left px-2 sm:px-4 py-2 sm:py-2.5 text-[0.625rem] sm:text-[0.6875rem] font-semibold text-muted-foreground uppercase tracking-wide sm:tracking-widest bg-grey-50 border-b border-border">Score</th>
                        <th className="w-[22%] text-left px-2 sm:px-4 py-2 sm:py-2.5 text-[0.625rem] sm:text-[0.6875rem] font-semibold text-muted-foreground uppercase tracking-wide sm:tracking-widest bg-grey-50 border-b border-border">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bidders.map((b) => (
                        <tr key={b.name} className="border-b border-grey-100 last:border-0">
                          <td className="px-2 sm:px-4 py-2.5 sm:py-3 text-[0.75rem] sm:text-[0.8125rem] font-medium text-foreground leading-snug wrap-break-word">{b.name}</td>
                          <td className="px-2 sm:px-4 py-2.5 sm:py-3 text-[0.75rem] sm:text-[0.8125rem] text-muted-foreground leading-snug wrap-break-word">{b.verified}</td>
                          <td className="px-2 sm:px-4 py-2.5 sm:py-3 align-top">
                            <span className={`text-[0.6875rem] sm:text-xs font-semibold ${b.scoreClass}`}>{b.score}</span>
                          </td>
                          <td className="px-2 sm:px-4 py-2.5 sm:py-3 align-top">
                            <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[0.5625rem] sm:text-[0.625rem] font-semibold uppercase tracking-normal sm:tracking-wide ${b.statusClass}`}>
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mt-3 leading-relaxed">
                Seller-controlled access. Every bidder is reviewed before auction opens.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      <section id="trust" className="py-24 bg-grey-900">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="text-xs font-semibold uppercase tracking-widest text-grey-400 mb-3"
            >
              Infrastructure & Compliance
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-3xl md:text-4xl font-semibold text-grey-50 tracking-[-0.015em]"
            >
              Built on Secure, Auditable Foundations
            </motion.h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/6 rounded-lg overflow-hidden mt-12">
            {items.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="relative bg-grey-900 p-9 overflow-hidden hover:bg-[#1A2332] transition-colors duration-250"
              >
                {/* Top green line */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-green-700 opacity-60" />
                <item.icon size={24} className="text-primary mb-5" strokeWidth={1.75} />
                <h4 className="text-base font-semibold text-grey-50 mb-2.5">{item.title}</h4>
                <p className="text-sm text-grey-400 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <section id="cta" className="py-[120px] bg-grey-50">
        <div className="max-w-[560px] mx-auto px-4 sm:px-6 text-center">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4"
          >
            Ready to Operate
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-3xl md:text-[2.5rem] font-semibold text-foreground tracking-[-0.015em] mb-5"
          >
            Ready to Host Your Next Auction?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-[0.9375rem] text-muted-foreground leading-relaxed mb-10"
          >
            Seller accounts on Bidooze are reviewed and approved individually. We work with auctioneers, financial institutions, asset managers, and estate operators.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <a
              href="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-[0.9375rem] font-semibold text-primary-foreground transition-all duration-200 hover:bg-green-700 hover:-translate-y-px"
            >
              Apply as Seller →
            </a>
            <a
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg border-[1.5px] border-input px-6 py-3 text-[0.9375rem] font-semibold text-foreground transition-all duration-200 hover:border-grey-500 hover:bg-grey-100 hover:-translate-y-px"
            >
              Explore Seller Dashboard
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="text-[0.8125rem] text-muted-foreground mt-5"
          >
            Applications are reviewed within 2 business days. Institutional accounts reviewed within 1.
          </motion.p>
        </div>
      </section>
      <footer className="border-t border-border bg-card py-10">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-4">
          <span className="flex items-center gap-2 text-[0.9375rem] font-bold text-foreground">
            <Image src="/logo/Bidooze.svg" alt="Bidooze Logo" width={120} height={20} className="rounded-sm" />
          </span>
          <div className="flex flex-col items-start gap-2 sm:items-center">
            <SiteLegalLinks linkClassName="text-[0.8125rem]" />
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="text-[0.8125rem] text-muted-foreground transition-colors hover:text-foreground"
            >
              {SUPPORT_EMAIL}
            </a>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Bidooze. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
