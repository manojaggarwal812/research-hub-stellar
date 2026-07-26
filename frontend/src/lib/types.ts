export type ProjectStatus =
  | "Draft"
  | "Active"
  | "UnderReview"
  | "Completed"
  | "Cancelled";

export type MilestoneStatus =
  | "Pending"
  | "Submitted"
  | "Approved"
  | "Funded"
  | "Rejected";

export type ReviewDecision = "Pending" | "Approve" | "Revise" | "Reject";

export type University = {
  id: number;
  name: string;
  admin: string;
  verified: boolean;
  country: string;
};

export type Milestone = {
  index: number;
  title: string;
  amount: number;
  status: MilestoneStatus;
};

export type ResearchProject = {
  id: number;
  title: string;
  abstractText: string;
  lead: string;
  universityId: number;
  status: ProjectStatus;
  grantAmount: number;
  releasedAmount: number;
  milestones: Milestone[];
  field: string;
};

export type PeerReview = {
  id: number;
  projectId: number;
  reviewer: string;
  score: number;
  decision: ReviewDecision;
  approved: boolean;
  createdAt: string;
};

export type Publication = {
  id: number;
  projectId: number;
  title: string;
  doi: string;
  authors: string;
};

export type ActivityEvent = {
  id: string;
  type:
    | "UniversityRegistered"
    | "ResearchCreated"
    | "GrantApproved"
    | "MilestoneCompleted"
    | "PeerReviewSubmitted"
    | "PeerReviewApproved"
    | "PublicationRegistered"
    | "FundingReleased"
    | "ResearchCompleted"
    | "ActivityUpdated";
  title: string;
  detail: string;
  timestamp: string;
  projectId?: number;
};

export type ContractsConfig = {
  network: string;
  rpcUrl: string;
  universityRegistry: string;
  researchFactory: string;
  researchProject: string;
  grantTreasury: string;
  peerReview: string;
  publicationRegistry: string;
  sampleTxHash: string;
  deployedAt?: string;
  deployer?: string;
};
