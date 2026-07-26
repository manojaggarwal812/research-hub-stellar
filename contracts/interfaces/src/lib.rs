#![no_std]

use soroban_sdk::{contracterror, contracttype, Address, String};

/// Shared lifecycle status for research projects.
#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum ProjectStatus {
    Draft = 0,
    Active = 1,
    UnderReview = 2,
    Completed = 3,
    Cancelled = 4,
}

/// Milestone state within a research project.
#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum MilestoneStatus {
    Pending = 0,
    Submitted = 1,
    Approved = 2,
    Funded = 3,
    Rejected = 4,
}

/// Peer review decision.
#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum ReviewDecision {
    Pending = 0,
    Approve = 1,
    Revise = 2,
    Reject = 3,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct University {
    pub id: u64,
    pub name: String,
    pub admin: Address,
    pub verified: bool,
    pub country: String,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ResearchProject {
    pub id: u64,
    pub title: String,
    pub abstract_text: String,
    pub lead: Address,
    pub university_id: u64,
    pub status: ProjectStatus,
    pub grant_amount: i128,
    pub released_amount: i128,
    pub milestone_count: u32,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Milestone {
    pub project_id: u64,
    pub index: u32,
    pub title: String,
    pub amount: i128,
    pub status: MilestoneStatus,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PeerReview {
    pub id: u64,
    pub project_id: u64,
    pub reviewer: Address,
    pub score: u32,
    pub decision: ReviewDecision,
    pub approved: bool,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Publication {
    pub id: u64,
    pub project_id: u64,
    pub title: String,
    pub doi: String,
    pub authors: String,
    pub registered_by: Address,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum HubError {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    Unauthorized = 3,
    NotFound = 4,
    InvalidAmount = 5,
    InvalidState = 6,
    UniversityNotVerified = 7,
    MilestoneNotReady = 8,
    InsufficientFunds = 9,
    InvalidScore = 10,
    Duplicate = 11,
}
