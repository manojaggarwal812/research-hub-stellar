/**
 * Test-only fixture data. Not imported by runtime UI — live data comes from Soroban RPC.
 */
import type {
  ActivityEvent,
  PeerReview,
  Publication,
  ResearchProject,
  University,
} from "@/lib/types";

const leads = [
  "GABCD...LEAD1",
  "GABCD...LEAD2",
  "GABCD...LEAD3",
  "GABCD...LEAD4",
];

export const seedUniversities: University[] = [
  {
    id: 1,
    name: "Stellar Institute of Technology",
    admin: "GUNI...SIT01",
    verified: true,
    country: "US",
  },
  {
    id: 2,
    name: "Horizon Research University",
    admin: "GUNI...HRU02",
    verified: true,
    country: "DE",
  },
  {
    id: 3,
    name: "Pacific Open Science College",
    admin: "GUNI...POSC3",
    verified: false,
    country: "JP",
  },
  {
    id: 4,
    name: "Nordic Grant Academy",
    admin: "GUNI...NGA04",
    verified: true,
    country: "SE",
  },
];

export const seedProjects: ResearchProject[] = [
  {
    id: 1,
    title: "On-chain Grant Escrow for Open Science",
    abstractText:
      "Design milestone-gated treasury flows for multi-institution research consortia.",
    lead: leads[0],
    universityId: 1,
    status: "Active",
    grantAmount: 120000,
    releasedAmount: 35000,
    field: "Distributed Systems",
    milestones: [
      { index: 0, title: "Protocol Spec", amount: 20000, status: "Funded" },
      { index: 1, title: "Prototype", amount: 35000, status: "Submitted" },
      { index: 2, title: "Pilot Cohort", amount: 65000, status: "Pending" },
    ],
  },
  {
    id: 2,
    title: "Peer Review Attestation Networks",
    abstractText: "Cryptographic attestations for double-blind review workflows.",
    lead: leads[1],
    universityId: 2,
    status: "UnderReview",
    grantAmount: 80000,
    releasedAmount: 20000,
    field: "Cryptography",
    milestones: [
      { index: 0, title: "Threat Model", amount: 20000, status: "Funded" },
      { index: 1, title: "Circuit Design", amount: 30000, status: "Approved" },
      { index: 2, title: "Benchmarks", amount: 30000, status: "Pending" },
    ],
  },
  {
    id: 3,
    title: "Climate Sensor Mesh Funding Rails",
    abstractText: "Coordinate field-station milestones with transparent payouts.",
    lead: leads[2],
    universityId: 4,
    status: "Completed",
    grantAmount: 95000,
    releasedAmount: 95000,
    field: "Climate Science",
    milestones: [
      { index: 0, title: "Hardware Kit", amount: 30000, status: "Funded" },
      { index: 1, title: "Deployment", amount: 40000, status: "Funded" },
      { index: 2, title: "Open Dataset", amount: 25000, status: "Funded" },
    ],
  },
  {
    id: 4,
    title: "Genomic Annotation DAOs",
    abstractText: "Shared governance for annotation bounties and publication credit.",
    lead: leads[3],
    universityId: 1,
    status: "Active",
    grantAmount: 64000,
    releasedAmount: 10000,
    field: "Bioinformatics",
    milestones: [
      { index: 0, title: "Schema v1", amount: 10000, status: "Funded" },
      { index: 1, title: "Annotation Sprint", amount: 24000, status: "Pending" },
      { index: 2, title: "Journal Bundle", amount: 30000, status: "Pending" },
    ],
  },
  {
    id: 5,
    title: "Materials Discovery Ledger",
    abstractText: "Track lab experiment provenance tied to grant milestones.",
    lead: leads[0],
    universityId: 2,
    status: "Draft",
    grantAmount: 45000,
    releasedAmount: 0,
    field: "Materials",
    milestones: [
      { index: 0, title: "Ingestion Pipeline", amount: 15000, status: "Pending" },
      { index: 1, title: "Lab Pilot", amount: 30000, status: "Pending" },
    ],
  },
  {
    id: 6,
    title: "Open Optics Collaboration Fabric",
    abstractText: "Cross-lab instrument booking with grant-linked access rights.",
    lead: leads[2],
    universityId: 4,
    status: "Active",
    grantAmount: 72000,
    releasedAmount: 18000,
    field: "Optics",
    milestones: [
      { index: 0, title: "Access Policy", amount: 18000, status: "Funded" },
      { index: 1, title: "Scheduler MVP", amount: 27000, status: "Submitted" },
      { index: 2, title: "Federation", amount: 27000, status: "Pending" },
    ],
  },
];

export const seedReviews: PeerReview[] = [
  {
    id: 1,
    projectId: 2,
    reviewer: "GREV...ALPHA",
    score: 91,
    decision: "Approve",
    approved: true,
    createdAt: "2026-07-12T10:00:00Z",
  },
  {
    id: 2,
    projectId: 2,
    reviewer: "GREV...BETA1",
    score: 74,
    decision: "Revise",
    approved: false,
    createdAt: "2026-07-14T15:20:00Z",
  },
  {
    id: 3,
    projectId: 1,
    reviewer: "GREV...GAMMA",
    score: 86,
    decision: "Approve",
    approved: true,
    createdAt: "2026-07-18T09:05:00Z",
  },
  {
    id: 4,
    projectId: 6,
    reviewer: "GREV...DELTA",
    score: 68,
    decision: "Revise",
    approved: false,
    createdAt: "2026-07-20T18:40:00Z",
  },
];

export const seedPublications: Publication[] = [
  {
    id: 1,
    projectId: 3,
    title: "Transparent Climate Grants via Soroban Milestones",
    doi: "10.1000/rh.climate.001",
    authors: "Nordic Grant Academy Consortium",
  },
  {
    id: 2,
    projectId: 1,
    title: "Inter-contract Treasury Patterns for Research Funding",
    doi: "10.1000/rh.systems.014",
    authors: "SIT Distributed Systems Lab",
  },
];

export const seedActivity: ActivityEvent[] = [
  {
    id: "a1",
    type: "UniversityRegistered",
    title: "University registered",
    detail: "Nordic Grant Academy joined ResearchHub",
    timestamp: "2026-07-01T08:00:00Z",
  },
  {
    id: "a2",
    type: "ResearchCreated",
    title: "Research created",
    detail: "On-chain Grant Escrow for Open Science",
    timestamp: "2026-07-03T11:15:00Z",
    projectId: 1,
  },
  {
    id: "a3",
    type: "GrantApproved",
    title: "Grant approved",
    detail: "120,000 XLM allocated to project #1",
    timestamp: "2026-07-04T09:30:00Z",
    projectId: 1,
  },
  {
    id: "a4",
    type: "MilestoneCompleted",
    title: "Milestone completed",
    detail: "Protocol Spec approved for project #1",
    timestamp: "2026-07-10T16:00:00Z",
    projectId: 1,
  },
  {
    id: "a5",
    type: "FundingReleased",
    title: "Funding released",
    detail: "20,000 XLM released after milestone approval",
    timestamp: "2026-07-10T16:05:00Z",
    projectId: 1,
  },
  {
    id: "a6",
    type: "PeerReviewSubmitted",
    title: "Peer review submitted",
    detail: "Score 91 for Peer Review Attestation Networks",
    timestamp: "2026-07-12T10:00:00Z",
    projectId: 2,
  },
  {
    id: "a7",
    type: "PeerReviewApproved",
    title: "Peer review approved",
    detail: "Review #1 attested on-chain",
    timestamp: "2026-07-13T12:00:00Z",
    projectId: 2,
  },
  {
    id: "a8",
    type: "PublicationRegistered",
    title: "Publication registered",
    detail: "DOI 10.1000/rh.climate.001",
    timestamp: "2026-07-19T14:22:00Z",
    projectId: 3,
  },
  {
    id: "a9",
    type: "ResearchCompleted",
    title: "Research completed",
    detail: "Climate Sensor Mesh Funding Rails closed",
    timestamp: "2026-07-21T17:45:00Z",
    projectId: 3,
  },
  {
    id: "a10",
    type: "ActivityUpdated",
    title: "Activity updated",
    detail: "Event stream synchronized from Soroban RPC",
    timestamp: "2026-07-26T07:00:00Z",
  },
];
