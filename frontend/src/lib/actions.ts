import { nativeToScVal } from "@/lib/stellar-client";
import type { NetworkConfig } from "@/lib/network";
import { invokeContract, type SignFn } from "@/lib/invoke";

type Ctx = {
  config: NetworkConfig;
  publicKey: string;
  signXdr: SignFn;
};

export async function registerUniversity(
  ctx: Ctx,
  name: string,
  country: string,
): Promise<string> {
  return invokeContract({
    ...ctx,
    contractId: ctx.config.universityRegistry,
    method: "register_university",
    args: [
      nativeToScVal(ctx.publicKey, { type: "address" }),
      nativeToScVal(name, { type: "string" }),
      nativeToScVal(country, { type: "string" }),
    ],
  });
}

export async function verifyUniversity(ctx: Ctx, universityId: number): Promise<string> {
  return invokeContract({
    ...ctx,
    contractId: ctx.config.universityRegistry,
    method: "verify_university",
    args: [
      nativeToScVal(ctx.publicKey, { type: "address" }),
      nativeToScVal(universityId, { type: "u64" }),
    ],
  });
}

export async function launchResearch(
  ctx: Ctx,
  opts: {
    universityId: number;
    title: string;
    abstractText: string;
    grantAmount: number;
  },
): Promise<string> {
  return invokeContract({
    ...ctx,
    contractId: ctx.config.researchFactory,
    method: "launch_research",
    args: [
      nativeToScVal(ctx.publicKey, { type: "address" }),
      nativeToScVal(opts.universityId, { type: "u64" }),
      nativeToScVal(opts.title, { type: "string" }),
      nativeToScVal(opts.abstractText, { type: "string" }),
      nativeToScVal(opts.grantAmount, { type: "i128" }),
    ],
  });
}

export async function addMilestone(
  ctx: Ctx,
  projectId: number,
  title: string,
  amount: number,
): Promise<string> {
  return invokeContract({
    ...ctx,
    contractId: ctx.config.researchProject,
    method: "add_milestone",
    args: [
      nativeToScVal(ctx.publicKey, { type: "address" }),
      nativeToScVal(projectId, { type: "u64" }),
      nativeToScVal(title, { type: "string" }),
      nativeToScVal(amount, { type: "i128" }),
    ],
  });
}

export async function submitMilestone(
  ctx: Ctx,
  projectId: number,
  index: number,
): Promise<string> {
  return invokeContract({
    ...ctx,
    contractId: ctx.config.researchProject,
    method: "submit_milestone",
    args: [
      nativeToScVal(ctx.publicKey, { type: "address" }),
      nativeToScVal(projectId, { type: "u64" }),
      nativeToScVal(index, { type: "u32" }),
    ],
  });
}

export async function releaseFunding(
  ctx: Ctx,
  projectId: number,
  milestoneIndex: number,
): Promise<string> {
  return invokeContract({
    ...ctx,
    contractId: ctx.config.grantTreasury,
    method: "release_funding",
    args: [
      nativeToScVal(ctx.publicKey, { type: "address" }),
      nativeToScVal(projectId, { type: "u64" }),
      nativeToScVal(milestoneIndex, { type: "u32" }),
    ],
  });
}

export async function submitPeerReview(
  ctx: Ctx,
  projectId: number,
  score: number,
  decision: number,
): Promise<string> {
  return invokeContract({
    ...ctx,
    contractId: ctx.config.peerReview,
    method: "submit_review",
    args: [
      nativeToScVal(ctx.publicKey, { type: "address" }),
      nativeToScVal(projectId, { type: "u64" }),
      nativeToScVal(score, { type: "u32" }),
      nativeToScVal(decision, { type: "u32" }),
    ],
  });
}

export async function registerPublication(
  ctx: Ctx,
  opts: { projectId: number; title: string; doi: string; authors: string },
): Promise<string> {
  return invokeContract({
    ...ctx,
    contractId: ctx.config.publicationRegistry,
    method: "register_publication",
    args: [
      nativeToScVal(ctx.publicKey, { type: "address" }),
      nativeToScVal(opts.projectId, { type: "u64" }),
      nativeToScVal(opts.title, { type: "string" }),
      nativeToScVal(opts.doi, { type: "string" }),
      nativeToScVal(opts.authors, { type: "string" }),
    ],
  });
}
