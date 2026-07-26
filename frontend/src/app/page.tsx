"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      <section className="relative min-h-[calc(100vh-4rem)] bg-hero-glow">
        <div className="pointer-events-none absolute inset-0 bg-grid-fade bg-grid opacity-60 dark:opacity-20" />
        <div className="rh-container relative flex min-h-[calc(100vh-4rem)] flex-col justify-center py-16">
          <p className="animate-rise font-display text-5xl leading-none tracking-tight text-ink-950 dark:text-ink-50 sm:text-7xl md:text-8xl">
            ResearchHub
          </p>
          <h1 className="animate-rise-delayed mt-6 max-w-2xl font-display text-2xl leading-snug text-ink-800 dark:text-ink-100 sm:text-3xl">
            Decentralized research grants, milestones, and peer review on Stellar.
          </h1>
          <p className="mt-4 max-w-xl animate-rise text-base text-[var(--muted)] [animation-delay:250ms]">
            Universities, funders, and researchers coordinate the full grant lifecycle
            with Soroban contracts — not crowdfunding, not document storage.
          </p>
          <div className="mt-8 flex animate-rise flex-wrap gap-3 [animation-delay:350ms]">
            <Link href="/dashboard" className="rh-btn-primary">
              Open dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/projects" className="rh-btn-secondary">
              Browse projects
            </Link>
          </div>
          <div className="mt-16 h-px w-full max-w-3xl bg-gradient-to-r from-ember-500/80 via-tide-500/50 to-transparent" />
          <p className="mt-4 max-w-md text-sm text-[var(--muted)]">
            Built for Orange Belt: multi-contract Soroban architecture, event streaming,
            and production-ready frontend workflows.
          </p>
        </div>
      </section>

      <section className="rh-container py-20">
        <h2 className="font-display text-3xl">One lifecycle. Six contracts.</h2>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          University verification, research factory launches, milestone tracking, treasury
          releases, peer review, and publication registry — each with a single
          responsibility and inter-contract calls.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["University Registry", "Verify institutions before grants launch."],
            ["Research Factory", "Gate project creation on verified universities."],
            ["Research Project", "Track milestones and completion state."],
            ["Grant Treasury", "Approve grants and release milestone funds."],
            ["Peer Review", "Submit scored reviews tied to projects."],
            ["Publication Registry", "Anchor DOI records to funded research."],
          ].map(([title, body]) => (
            <div key={title} className="border-l-2 border-ember-500/70 pl-4">
              <h3 className="font-display text-xl">{title}</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
