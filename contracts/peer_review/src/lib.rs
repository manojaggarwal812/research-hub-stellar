#![no_std]

use interfaces::{HubError, PeerReview, ReviewDecision};
use soroban_sdk::{
    contract, contractclient, contractimpl, contracttype, symbol_short, Address, Env,
};

#[contractclient(name = "ReviewProjectClient")]
pub trait ReviewProjectTrait {
    fn get_project(env: Env, project_id: u64) -> Result<interfaces::ResearchProject, HubError>;
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    ResearchProject,
    Count,
    Review(u64),
    ProjectReviewCount(u64),
}

#[contract]
pub struct PeerReviewContract;

#[contractimpl]
impl PeerReviewContract {
    pub fn initialize(
        env: Env,
        admin: Address,
        research_project: Address,
    ) -> Result<(), HubError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(HubError::AlreadyInitialized);
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&DataKey::ResearchProject, &research_project);
        env.storage().instance().set(&DataKey::Count, &0u64);
        Ok(())
    }

    pub fn submit_review(
        env: Env,
        reviewer: Address,
        project_id: u64,
        score: u32,
        decision: u32,
    ) -> Result<u64, HubError> {
        reviewer.require_auth();
        if score > 100 {
            return Err(HubError::InvalidScore);
        }
        if decision > 3 {
            return Err(HubError::InvalidState);
        }
        let decision_enum = match decision {
            1 => ReviewDecision::Approve,
            2 => ReviewDecision::Revise,
            3 => ReviewDecision::Reject,
            _ => ReviewDecision::Pending,
        };

        let project_addr: Address = env
            .storage()
            .instance()
            .get(&DataKey::ResearchProject)
            .ok_or(HubError::NotInitialized)?;
        let project_client = ReviewProjectClient::new(&env, &project_addr);
        // Cross-contract read ensures the project exists on-chain.
        let _project = project_client.get_project(&project_id);

        let mut count: u64 = env
            .storage()
            .instance()
            .get(&DataKey::Count)
            .unwrap_or(0);
        count += 1;

        let review = PeerReview {
            id: count,
            project_id,
            reviewer: reviewer.clone(),
            score,
            decision: decision_enum,
            approved: false,
        };

        env.storage()
            .persistent()
            .set(&DataKey::Review(count), &review);
        env.storage().instance().set(&DataKey::Count, &count);

        let mut prc: u32 = env
            .storage()
            .persistent()
            .get(&DataKey::ProjectReviewCount(project_id))
            .unwrap_or(0);
        prc += 1;
        env.storage()
            .persistent()
            .set(&DataKey::ProjectReviewCount(project_id), &prc);

        env.events().publish(
            (symbol_short!("rev"), symbol_short!("sub")),
            (count, project_id, reviewer, score),
        );

        Ok(count)
    }

    pub fn approve_review(
        env: Env,
        admin: Address,
        review_id: u64,
    ) -> Result<(), HubError> {
        admin.require_auth();
        let expected: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(HubError::NotInitialized)?;
        if admin != expected {
            return Err(HubError::Unauthorized);
        }

        let mut review = Self::get_review(env.clone(), review_id)?;
        if review.approved {
            return Err(HubError::InvalidState);
        }
        review.approved = true;
        env.storage()
            .persistent()
            .set(&DataKey::Review(review_id), &review);

        env.events().publish(
            (symbol_short!("rev"), symbol_short!("ok")),
            (review_id, review.project_id),
        );
        Ok(())
    }

    pub fn get_review(env: Env, review_id: u64) -> Result<PeerReview, HubError> {
        env.storage()
            .persistent()
            .get(&DataKey::Review(review_id))
            .ok_or(HubError::NotFound)
    }

    pub fn review_count(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::Count)
            .unwrap_or(0)
    }

    pub fn project_review_count(env: Env, project_id: u64) -> u32 {
        env.storage()
            .persistent()
            .get(&DataKey::ProjectReviewCount(project_id))
            .unwrap_or(0)
    }
}

mod test;
