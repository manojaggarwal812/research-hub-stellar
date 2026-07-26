#![no_std]

use interfaces::{HubError, Publication};
use soroban_sdk::{
    contract, contractclient, contractimpl, contracttype, symbol_short, Address, Env, String,
};

#[contractclient(name = "PubProjectClient")]
pub trait PubProjectTrait {
    fn get_project(env: Env, project_id: u64) -> Result<interfaces::ResearchProject, HubError>;
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    ResearchProject,
    Count,
    Publication(u64),
    ByDoi(String),
    ProjectPubs(u64),
}

#[contract]
pub struct PublicationRegistry;

#[contractimpl]
impl PublicationRegistry {
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

    pub fn register_publication(
        env: Env,
        caller: Address,
        project_id: u64,
        title: String,
        doi: String,
        authors: String,
    ) -> Result<u64, HubError> {
        caller.require_auth();

        if env.storage().persistent().has(&DataKey::ByDoi(doi.clone())) {
            return Err(HubError::Duplicate);
        }

        let project_addr: Address = env
            .storage()
            .instance()
            .get(&DataKey::ResearchProject)
            .ok_or(HubError::NotInitialized)?;
        let project_client = PubProjectClient::new(&env, &project_addr);
        let project = project_client.get_project(&project_id);

        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(HubError::NotInitialized)?;
        if caller != project.lead && caller != admin {
            return Err(HubError::Unauthorized);
        }

        let mut count: u64 = env
            .storage()
            .instance()
            .get(&DataKey::Count)
            .unwrap_or(0);
        count += 1;

        let publication = Publication {
            id: count,
            project_id,
            title: title.clone(),
            doi: doi.clone(),
            authors,
            registered_by: caller.clone(),
        };

        env.storage()
            .persistent()
            .set(&DataKey::Publication(count), &publication);
        env.storage()
            .persistent()
            .set(&DataKey::ByDoi(doi.clone()), &count);
        env.storage().instance().set(&DataKey::Count, &count);

        let mut pubs: u32 = env
            .storage()
            .persistent()
            .get(&DataKey::ProjectPubs(project_id))
            .unwrap_or(0);
        pubs += 1;
        env.storage()
            .persistent()
            .set(&DataKey::ProjectPubs(project_id), &pubs);

        env.events().publish(
            (symbol_short!("pub"), symbol_short!("reg")),
            (count, project_id, doi, title),
        );

        Ok(count)
    }

    pub fn get_publication(env: Env, publication_id: u64) -> Result<Publication, HubError> {
        env.storage()
            .persistent()
            .get(&DataKey::Publication(publication_id))
            .ok_or(HubError::NotFound)
    }

    pub fn publication_count(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::Count)
            .unwrap_or(0)
    }

    pub fn project_publication_count(env: Env, project_id: u64) -> u32 {
        env.storage()
            .persistent()
            .get(&DataKey::ProjectPubs(project_id))
            .unwrap_or(0)
    }
}

mod test;
