#![no_std]

use interfaces::{HubError, University};
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, String};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    Count,
    University(u64),
    ByAdmin(Address),
}

#[contract]
pub struct UniversityRegistry;

#[contractimpl]
impl UniversityRegistry {
    pub fn initialize(env: Env, admin: Address) -> Result<(), HubError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(HubError::AlreadyInitialized);
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Count, &0u64);
        Ok(())
    }

    pub fn register_university(
        env: Env,
        admin: Address,
        name: String,
        country: String,
    ) -> Result<u64, HubError> {
        admin.require_auth();
        let _: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(HubError::NotInitialized)?;

        if env.storage().persistent().has(&DataKey::ByAdmin(admin.clone())) {
            return Err(HubError::Duplicate);
        }

        let mut count: u64 = env
            .storage()
            .instance()
            .get(&DataKey::Count)
            .unwrap_or(0);
        count += 1;

        let university = University {
            id: count,
            name: name.clone(),
            admin: admin.clone(),
            verified: false,
            country: country.clone(),
        };

        env.storage()
            .persistent()
            .set(&DataKey::University(count), &university);
        env.storage()
            .persistent()
            .set(&DataKey::ByAdmin(admin.clone()), &count);
        env.storage().instance().set(&DataKey::Count, &count);

        env.events().publish(
            (symbol_short!("univ"), symbol_short!("reg")),
            (count, admin, name),
        );

        Ok(count)
    }

    pub fn verify_university(env: Env, caller: Address, university_id: u64) -> Result<(), HubError> {
        caller.require_auth();
        let platform_admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(HubError::NotInitialized)?;
        if caller != platform_admin {
            return Err(HubError::Unauthorized);
        }

        let mut university = Self::get_university(env.clone(), university_id)?;
        university.verified = true;
        env.storage()
            .persistent()
            .set(&DataKey::University(university_id), &university);

        env.events().publish(
            (symbol_short!("univ"), symbol_short!("verify")),
            university_id,
        );
        Ok(())
    }

    pub fn get_university(env: Env, university_id: u64) -> Result<University, HubError> {
        env.storage()
            .persistent()
            .get(&DataKey::University(university_id))
            .ok_or(HubError::NotFound)
    }

    pub fn is_verified(env: Env, university_id: u64) -> Result<bool, HubError> {
        Ok(Self::get_university(env, university_id)?.verified)
    }

    pub fn university_count(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::Count)
            .unwrap_or(0)
    }

    pub fn get_admin(env: Env) -> Result<Address, HubError> {
        env.storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(HubError::NotInitialized)
    }
}

mod test;
