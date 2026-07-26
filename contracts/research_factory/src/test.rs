#![cfg(test)]

use super::*;
use research_project::ResearchProjectContract;
use soroban_sdk::{testutils::Address as _, Address, Env, String};
use university_registry::UniversityRegistry;

fn wire_hub(
    env: &Env,
) -> (
    Address,
    university_registry::UniversityRegistryClient<'_>,
    ResearchFactoryClient<'_>,
    grant_treasury::GrantTreasuryClient<'_>,
) {
    env.mock_all_auths();
    let admin = Address::generate(env);

    let uni_id = env.register(UniversityRegistry, ());
    let uni = university_registry::UniversityRegistryClient::new(env, &uni_id);
    uni.initialize(&admin);

    let project_id = env.register(ResearchProjectContract, ());
    let factory_id = env.register(ResearchFactory, ());
    let treasury_id = env.register(grant_treasury::GrantTreasury, ());

    let project = research_project::ResearchProjectContractClient::new(env, &project_id);
    project.initialize(&admin, &factory_id, &treasury_id);

    let treasury = grant_treasury::GrantTreasuryClient::new(env, &treasury_id);
    treasury.initialize(&admin, &project_id, &factory_id, &100u32, &admin);

    let factory = ResearchFactoryClient::new(env, &factory_id);
    factory.initialize(&admin, &uni_id, &project_id, &treasury_id);

    (admin, uni, factory, treasury)
}

#[test]
fn launch_requires_verified_university() {
    let env = Env::default();
    let (admin, uni, factory, _treasury) = wire_hub(&env);
    let lead = Address::generate(&env);
    let uni_admin = Address::generate(&env);

    let uid = uni.register_university(
        &uni_admin,
        &String::from_str(&env, "Caltech"),
        &String::from_str(&env, "US"),
    );

    assert!(factory
        .try_launch_research(
            &lead,
            &uid,
            &String::from_str(&env, "Fusion Materials"),
            &String::from_str(&env, "High-temp alloys"),
            &50_000i128,
        )
        .is_err());

    uni.verify_university(&admin, &uid);
    let pid = factory.launch_research(
        &lead,
        &uid,
        &String::from_str(&env, "Fusion Materials"),
        &String::from_str(&env, "High-temp alloys"),
        &50_000i128,
    );
    assert_eq!(pid, 1);
    assert_eq!(factory.created_count(), 1);
}

#[test]
fn launch_allocates_treasury_balance() {
    let env = Env::default();
    let (admin, uni, factory, treasury) = wire_hub(&env);
    let lead = Address::generate(&env);
    let uni_admin = Address::generate(&env);
    let uid = uni.register_university(
        &uni_admin,
        &String::from_str(&env, "ETH"),
        &String::from_str(&env, "CH"),
    );
    uni.verify_university(&admin, &uid);
    let pid = factory.launch_research(
        &lead,
        &uid,
        &String::from_str(&env, "Optics"),
        &String::from_str(&env, "Lab federation"),
        &12_000i128,
    );
    assert!(treasury.is_grant_approved(&pid));
    assert_eq!(treasury.get_project_balance(&pid), 12_000);
    let (dep, _, _) = treasury.get_totals();
    assert_eq!(dep, 12_000);
}

#[test]
fn launch_rejects_zero_grant() {
    let env = Env::default();
    let (admin, uni, factory, _treasury) = wire_hub(&env);
    let lead = Address::generate(&env);
    let uni_admin = Address::generate(&env);
    let uid = uni.register_university(
        &uni_admin,
        &String::from_str(&env, "ETH"),
        &String::from_str(&env, "CH"),
    );
    uni.verify_university(&admin, &uid);
    assert!(factory
        .try_launch_research(
            &lead,
            &uid,
            &String::from_str(&env, "X"),
            &String::from_str(&env, "Y"),
            &0i128,
        )
        .is_err());
}
