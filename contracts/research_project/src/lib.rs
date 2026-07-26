#![no_std]

use interfaces::{HubError, Milestone, MilestoneStatus, ProjectStatus, ResearchProject};
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Env, String,
};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    Factory,
    Treasury,
    Count,
    Project(u64),
    Milestone(u64, u32),
}

#[contract]
pub struct ResearchProjectContract;

#[contractimpl]
impl ResearchProjectContract {
    pub fn initialize(
        env: Env,
        admin: Address,
        factory: Address,
        treasury: Address,
    ) -> Result<(), HubError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(HubError::AlreadyInitialized);
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Factory, &factory);
        env.storage().instance().set(&DataKey::Treasury, &treasury);
        env.storage().instance().set(&DataKey::Count, &0u64);
        Ok(())
    }

    /// Called by Research Factory after university verification.
    pub fn create_project(
        env: Env,
        factory: Address,
        lead: Address,
        university_id: u64,
        title: String,
        abstract_text: String,
        grant_amount: i128,
    ) -> Result<u64, HubError> {
        factory.require_auth();
        let expected: Address = env
            .storage()
            .instance()
            .get(&DataKey::Factory)
            .ok_or(HubError::NotInitialized)?;
        if factory != expected {
            return Err(HubError::Unauthorized);
        }
        if grant_amount <= 0 {
            return Err(HubError::InvalidAmount);
        }

        let mut count: u64 = env
            .storage()
            .instance()
            .get(&DataKey::Count)
            .unwrap_or(0);
        count += 1;

        let project = ResearchProject {
            id: count,
            title: title.clone(),
            abstract_text,
            lead: lead.clone(),
            university_id,
            status: ProjectStatus::Active,
            grant_amount,
            released_amount: 0,
            milestone_count: 0,
        };

        env.storage()
            .persistent()
            .set(&DataKey::Project(count), &project);
        env.storage().instance().set(&DataKey::Count, &count);

        env.events().publish(
            (symbol_short!("res"), symbol_short!("create")),
            (count, lead, university_id, grant_amount),
        );

        Ok(count)
    }

    pub fn add_milestone(
        env: Env,
        caller: Address,
        project_id: u64,
        title: String,
        amount: i128,
    ) -> Result<u32, HubError> {
        caller.require_auth();
        if amount <= 0 {
            return Err(HubError::InvalidAmount);
        }

        let mut project = Self::get_project(env.clone(), project_id)?;
        if caller != project.lead {
            return Err(HubError::Unauthorized);
        }
        if project.status != ProjectStatus::Active {
            return Err(HubError::InvalidState);
        }

        let index = project.milestone_count;
        let milestone = Milestone {
            project_id,
            index,
            title: title.clone(),
            amount,
            status: MilestoneStatus::Pending,
        };

        env.storage()
            .persistent()
            .set(&DataKey::Milestone(project_id, index), &milestone);
        project.milestone_count += 1;
        env.storage()
            .persistent()
            .set(&DataKey::Project(project_id), &project);

        env.events().publish(
            (symbol_short!("ms"), symbol_short!("add")),
            (project_id, index, amount),
        );

        Ok(index)
    }

    pub fn submit_milestone(
        env: Env,
        caller: Address,
        project_id: u64,
        index: u32,
    ) -> Result<(), HubError> {
        caller.require_auth();
        let project = Self::get_project(env.clone(), project_id)?;
        if caller != project.lead {
            return Err(HubError::Unauthorized);
        }

        let mut milestone = Self::get_milestone(env.clone(), project_id, index)?;
        if milestone.status != MilestoneStatus::Pending {
            return Err(HubError::InvalidState);
        }
        milestone.status = MilestoneStatus::Submitted;
        env.storage()
            .persistent()
            .set(&DataKey::Milestone(project_id, index), &milestone);

        env.events().publish(
            (symbol_short!("ms"), symbol_short!("submit")),
            (project_id, index),
        );
        Ok(())
    }

    /// Called by platform admin or treasury after review approval.
    pub fn complete_milestone(
        env: Env,
        caller: Address,
        project_id: u64,
        index: u32,
    ) -> Result<(), HubError> {
        caller.require_auth();
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(HubError::NotInitialized)?;
        let treasury: Address = env
            .storage()
            .instance()
            .get(&DataKey::Treasury)
            .ok_or(HubError::NotInitialized)?;
        if caller != admin && caller != treasury {
            return Err(HubError::Unauthorized);
        }

        let mut milestone = Self::get_milestone(env.clone(), project_id, index)?;
        if milestone.status != MilestoneStatus::Submitted
            && milestone.status != MilestoneStatus::Approved
        {
            return Err(HubError::MilestoneNotReady);
        }
        milestone.status = MilestoneStatus::Approved;
        env.storage()
            .persistent()
            .set(&DataKey::Milestone(project_id, index), &milestone);

        env.events().publish(
            (symbol_short!("ms"), symbol_short!("done")),
            (project_id, index),
        );
        Ok(())
    }

    /// Treasury marks milestone funded after release.
    pub fn mark_milestone_funded(
        env: Env,
        treasury: Address,
        project_id: u64,
        index: u32,
        amount: i128,
    ) -> Result<(), HubError> {
        treasury.require_auth();
        let expected: Address = env
            .storage()
            .instance()
            .get(&DataKey::Treasury)
            .ok_or(HubError::NotInitialized)?;
        if treasury != expected {
            return Err(HubError::Unauthorized);
        }

        let mut milestone = Self::get_milestone(env.clone(), project_id, index)?;
        if milestone.status != MilestoneStatus::Approved {
            return Err(HubError::MilestoneNotReady);
        }
        milestone.status = MilestoneStatus::Funded;
        env.storage()
            .persistent()
            .set(&DataKey::Milestone(project_id, index), &milestone);

        let mut project = Self::get_project(env.clone(), project_id)?;
        project.released_amount += amount;
        env.storage()
            .persistent()
            .set(&DataKey::Project(project_id), &project);

        env.events().publish(
            (symbol_short!("fund"), symbol_short!("mark")),
            (project_id, index, amount),
        );
        Ok(())
    }

    pub fn complete_research(
        env: Env,
        caller: Address,
        project_id: u64,
    ) -> Result<(), HubError> {
        caller.require_auth();
        let mut project = Self::get_project(env.clone(), project_id)?;
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(HubError::NotInitialized)?;
        if caller != project.lead && caller != admin {
            return Err(HubError::Unauthorized);
        }
        if project.status != ProjectStatus::Active && project.status != ProjectStatus::UnderReview {
            return Err(HubError::InvalidState);
        }
        project.status = ProjectStatus::Completed;
        env.storage()
            .persistent()
            .set(&DataKey::Project(project_id), &project);

        env.events().publish(
            (symbol_short!("res"), symbol_short!("done")),
            project_id,
        );
        Ok(())
    }

    pub fn set_under_review(
        env: Env,
        caller: Address,
        project_id: u64,
    ) -> Result<(), HubError> {
        caller.require_auth();
        let mut project = Self::get_project(env.clone(), project_id)?;
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(HubError::NotInitialized)?;
        if caller != project.lead && caller != admin {
            return Err(HubError::Unauthorized);
        }
        project.status = ProjectStatus::UnderReview;
        env.storage()
            .persistent()
            .set(&DataKey::Project(project_id), &project);

        env.events().publish(
            (symbol_short!("act"), symbol_short!("upd")),
            (project_id, symbol_short!("review")),
        );
        Ok(())
    }

    pub fn get_project(env: Env, project_id: u64) -> Result<ResearchProject, HubError> {
        env.storage()
            .persistent()
            .get(&DataKey::Project(project_id))
            .ok_or(HubError::NotFound)
    }

    pub fn get_milestone(
        env: Env,
        project_id: u64,
        index: u32,
    ) -> Result<Milestone, HubError> {
        env.storage()
            .persistent()
            .get(&DataKey::Milestone(project_id, index))
            .ok_or(HubError::NotFound)
    }

    pub fn project_count(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::Count)
            .unwrap_or(0)
    }

    pub fn get_treasury(env: Env) -> Result<Address, HubError> {
        env.storage()
            .instance()
            .get(&DataKey::Treasury)
            .ok_or(HubError::NotInitialized)
    }
}

mod test;
