#![no_std]

use interfaces::HubError;
use soroban_sdk::{
    contract, contractclient, contractimpl, contracttype, symbol_short, Address, Env, String,
};

/// Client for University Registry (cross-contract).
#[contractclient(name = "UnivRegistryClient")]
pub trait UniversityRegistryTrait {
    fn is_verified(env: Env, university_id: u64) -> Result<bool, HubError>;
}

/// Client for Research Project store (cross-contract).
#[contractclient(name = "ProjectStoreClient")]
pub trait ResearchProjectTrait {
    fn create_project(
        env: Env,
        factory: Address,
        lead: Address,
        university_id: u64,
        title: String,
        abstract_text: String,
        grant_amount: i128,
    ) -> Result<u64, HubError>;
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    UniversityRegistry,
    ResearchProject,
    CreatedCount,
}

#[contract]
pub struct ResearchFactory;

#[contractimpl]
impl ResearchFactory {
    pub fn initialize(
        env: Env,
        admin: Address,
        university_registry: Address,
        research_project: Address,
    ) -> Result<(), HubError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(HubError::AlreadyInitialized);
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&DataKey::UniversityRegistry, &university_registry);
        env.storage()
            .instance()
            .set(&DataKey::ResearchProject, &research_project);
        env.storage().instance().set(&DataKey::CreatedCount, &0u64);
        Ok(())
    }

    /// Verifies university via University Registry, then creates project via Research Project.
    pub fn launch_research(
        env: Env,
        lead: Address,
        university_id: u64,
        title: String,
        abstract_text: String,
        grant_amount: i128,
    ) -> Result<u64, HubError> {
        lead.require_auth();
        if grant_amount <= 0 {
            return Err(HubError::InvalidAmount);
        }

        let uni_addr: Address = env
            .storage()
            .instance()
            .get(&DataKey::UniversityRegistry)
            .ok_or(HubError::NotInitialized)?;
        let project_addr: Address = env
            .storage()
            .instance()
            .get(&DataKey::ResearchProject)
            .ok_or(HubError::NotInitialized)?;

        let uni_client = UnivRegistryClient::new(&env, &uni_addr);
        let verified = uni_client.is_verified(&university_id);
        if !verified {
            return Err(HubError::UniversityNotVerified);
        }

        let project_client = ProjectStoreClient::new(&env, &project_addr);
        let factory_addr = env.current_contract_address();
        let project_id = project_client.create_project(
            &factory_addr,
            &lead,
            &university_id,
            &title,
            &abstract_text,
            &grant_amount,
        );

        let mut created: u64 = env
            .storage()
            .instance()
            .get(&DataKey::CreatedCount)
            .unwrap_or(0);
        created += 1;
        env.storage()
            .instance()
            .set(&DataKey::CreatedCount, &created);

        env.events().publish(
            (symbol_short!("res"), symbol_short!("launch")),
            (project_id, lead, university_id, grant_amount),
        );

        Ok(project_id)
    }

    pub fn created_count(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::CreatedCount)
            .unwrap_or(0)
    }

    pub fn get_university_registry(env: Env) -> Result<Address, HubError> {
        env.storage()
            .instance()
            .get(&DataKey::UniversityRegistry)
            .ok_or(HubError::NotInitialized)
    }

    pub fn get_research_project(env: Env) -> Result<Address, HubError> {
        env.storage()
            .instance()
            .get(&DataKey::ResearchProject)
            .ok_or(HubError::NotInitialized)
    }
}

mod test;
mod regression;
