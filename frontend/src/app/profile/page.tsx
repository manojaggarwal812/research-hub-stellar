"use client";

import { PageSkeleton } from "@/components/Skeleton";
import { useHubData } from "@/lib/hub-data";
import { useWallet } from "@/lib/wallet";
import { shortAddress } from "@/lib/format";

export default function ProfilePage() {
  const { loading, contracts, projects, reviews } = useHubData();
  const { address, network, connect, disconnect, connecting } = useWallet();

  if (loading) return <PageSkeleton />;

  return (
    <div className="rh-container space-y-6">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl">Profile</h1>
        <p className="mt-1 text-[var(--muted)]">
          Wallet identity and deployed ResearchHub contract addresses.
        </p>
      </div>

      <section className="rh-panel p-5">
        <h2 className="font-display text-xl">Wallet</h2>
        {address ? (
          <div className="mt-3 space-y-2 text-sm">
            <p>
              Address: <span className="font-mono">{address}</span>
            </p>
            <p>
              Network: <span className="font-medium">{network}</span>
            </p>
            <button type="button" className="rh-btn-secondary mt-2" onClick={disconnect}>
              Disconnect
            </button>
          </div>
        ) : (
          <div className="mt-3">
            <p className="text-sm text-[var(--muted)]">No wallet connected.</p>
            <button
              type="button"
              className="rh-btn-primary mt-3"
              disabled={connecting}
              onClick={() => void connect()}
            >
              {connecting ? "Connecting…" : "Connect Freighter"}
            </button>
          </div>
        )}
      </section>

      <section className="rh-panel p-5">
        <h2 className="font-display text-xl">Participation snapshot</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {projects.length} projects indexed · {reviews.length} reviews on record
          {address ? ` · signed in as ${shortAddress(address)}` : ""}.
        </p>
      </section>

      <section className="rh-panel p-5">
        <h2 className="font-display text-xl">Contract addresses</h2>
        <dl className="mt-4 space-y-3 text-sm">
          {[
            ["University Registry", contracts?.universityRegistry],
            ["Research Factory", contracts?.researchFactory],
            ["Research Project", contracts?.researchProject],
            ["Grant Treasury", contracts?.grantTreasury],
            ["Peer Review", contracts?.peerReview],
            ["Publication Registry", contracts?.publicationRegistry],
            ["Sample Tx Hash", contracts?.sampleTxHash],
          ].map(([label, value]) => (
            <div key={label as string}>
              <dt className="text-xs uppercase text-[var(--muted)]">{label}</dt>
              <dd className="break-all font-mono text-xs">{value ?? "—"}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
