#![no_std]

use interfaces::{HubError, MilestoneStatus};
use soroban_sdk::{
    contract, contractclient, contractimpl, contracttype, symbol_short, Address, Env,
};

#[contractclient(name = "ProjectMilestonesClient")]
pub trait ProjectMilestonesTrait {
    fn get_milestone(
        env: Env,
        project_id: u64,
        index: u32,
    ) -> Result<interfaces::Milestone, HubError>;
    fn complete_milestone(
        env: Env,
        caller: Address,
        project_id: u64,
        index: u32,
    ) -> Result<(), HubError>;
    fn mark_milestone_funded(
        env: Env,
        treasury: Address,
        project_id: u64,
        index: u32,
        amount: i128,
    ) -> Result<(), HubError>;
    fn get_project(env: Env, project_id: u64) -> Result<interfaces::ResearchProject, HubError>;
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    ResearchProject,
    TotalDeposited,
    TotalReleased,
    ProjectBalance(u64),
    GrantApproved(u64),
}

#[contract]
pub struct GrantTreasury;

#[contractimpl]
impl GrantTreasury {
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
        env.storage()
            .instance()
            .set(&DataKey::TotalDeposited, &0i128);
        env.storage()
            .instance()
            .set(&DataKey::TotalReleased, &0i128);
        Ok(())
    }

    pub fn approve_grant(
        env: Env,
        admin: Address,
        project_id: u64,
        amount: i128,
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
        if amount <= 0 {
            return Err(HubError::InvalidAmount);
        }

        let project_addr: Address = env
            .storage()
            .instance()
            .get(&DataKey::ResearchProject)
            .ok_or(HubError::NotInitialized)?;
        let project_client = ProjectMilestonesClient::new(&env, &project_addr);
        let project = project_client.get_project(&project_id);
        if project.grant_amount != amount && amount > project.grant_amount {
            return Err(HubError::InvalidAmount);
        }

        let mut deposited: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalDeposited)
            .unwrap_or(0);
        deposited += amount;
        env.storage()
            .instance()
            .set(&DataKey::TotalDeposited, &deposited);

        let balance: i128 = env
            .storage()
            .persistent()
            .get(&DataKey::ProjectBalance(project_id))
            .unwrap_or(0);
        env.storage()
            .persistent()
            .set(&DataKey::ProjectBalance(project_id), &(balance + amount));
        env.storage()
            .persistent()
            .set(&DataKey::GrantApproved(project_id), &true);

        env.events().publish(
            (symbol_short!("grant"), symbol_short!("ok")),
            (project_id, amount),
        );
        Ok(())
    }

    /// Approve milestone on research project, then release funds (inter-contract).
    pub fn release_funding(
        env: Env,
        admin: Address,
        project_id: u64,
        milestone_index: u32,
    ) -> Result<i128, HubError> {
        admin.require_auth();
        let expected: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(HubError::NotInitialized)?;
        if admin != expected {
            return Err(HubError::Unauthorized);
        }

        let approved: bool = env
            .storage()
            .persistent()
            .get(&DataKey::GrantApproved(project_id))
            .unwrap_or(false);
        if !approved {
            return Err(HubError::InvalidState);
        }

        let project_addr: Address = env
            .storage()
            .instance()
            .get(&DataKey::ResearchProject)
            .ok_or(HubError::NotInitialized)?;
        let project_client = ProjectMilestonesClient::new(&env, &project_addr);

        let milestone = project_client.get_milestone(&project_id, &milestone_index);
        if milestone.status != MilestoneStatus::Submitted
            && milestone.status != MilestoneStatus::Approved
        {
            return Err(HubError::MilestoneNotReady);
        }

        let amount = milestone.amount;
        let balance: i128 = env
            .storage()
            .persistent()
            .get(&DataKey::ProjectBalance(project_id))
            .unwrap_or(0);
        if balance < amount {
            return Err(HubError::InsufficientFunds);
        }

        let treasury_addr = env.current_contract_address();
        if milestone.status == MilestoneStatus::Submitted {
            project_client.complete_milestone(&treasury_addr, &project_id, &milestone_index);
        }
        project_client.mark_milestone_funded(
            &treasury_addr,
            &project_id,
            &milestone_index,
            &amount,
        );

        env.storage()
            .persistent()
            .set(&DataKey::ProjectBalance(project_id), &(balance - amount));

        let mut released: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalReleased)
            .unwrap_or(0);
        released += amount;
        env.storage()
            .instance()
            .set(&DataKey::TotalReleased, &released);

        env.events().publish(
            (symbol_short!("fund"), symbol_short!("rel")),
            (project_id, milestone_index, amount),
        );

        Ok(amount)
    }

    pub fn get_project_balance(env: Env, project_id: u64) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::ProjectBalance(project_id))
            .unwrap_or(0)
    }

    pub fn get_totals(env: Env) -> (i128, i128) {
        let deposited = env
            .storage()
            .instance()
            .get(&DataKey::TotalDeposited)
            .unwrap_or(0);
        let released = env
            .storage()
            .instance()
            .get(&DataKey::TotalReleased)
            .unwrap_or(0);
        (deposited, released)
    }

    pub fn is_grant_approved(env: Env, project_id: u64) -> bool {
        env.storage()
            .persistent()
            .get(&DataKey::GrantApproved(project_id))
            .unwrap_or(false)
    }
}

mod test;
