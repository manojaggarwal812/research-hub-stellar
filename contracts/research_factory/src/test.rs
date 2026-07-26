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
) {
    env.mock_all_auths();
    let admin = Address::generate(env);

    let uni_id = env.register(UniversityRegistry, ());
    let uni = university_registry::UniversityRegistryClient::new(env, &uni_id);
    uni.initialize(&admin);

    let project_id = env.register(ResearchProjectContract, ());
    let factory_id = env.register(ResearchFactory, ());

    let project = research_project::ResearchProjectContractClient::new(env, &project_id);
    let treasury = Address::generate(env);
    project.initialize(&admin, &factory_id, &treasury);

    let factory = ResearchFactoryClient::new(env, &factory_id);
    factory.initialize(&admin, &uni_id, &project_id);

    (admin, uni, factory)
}

#[test]
fn launch_requires_verified_university() {
    let env = Env::default();
    let (admin, uni, factory) = wire_hub(&env);
    let lead = Address::generate(&env);
    let uni_admin = Address::generate(&env);

    let uid = uni.register_university(
        &uni_admin,
        &String::from_str(&env, "Caltech"),
        &String::from_str(&env, "US"),
    );

    let denied = factory.try_launch_research(
        &lead,
        &uid,
        &String::from_str(&env, "Fusion Materials"),
        &String::from_str(&env, "High-temp alloys"),
        &50_000i128,
    );
    assert!(denied.is_err());

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
fn launch_rejects_zero_grant() {
    let env = Env::default();
    let (admin, uni, factory) = wire_hub(&env);
    let lead = Address::generate(&env);
    let uni_admin = Address::generate(&env);
    let uid = uni.register_university(
        &uni_admin,
        &String::from_str(&env, "ETH"),
        &String::from_str(&env, "CH"),
    );
    uni.verify_university(&admin, &uid);
    let result = factory.try_launch_research(
        &lead,
        &uid,
        &String::from_str(&env, "X"),
        &String::from_str(&env, "Y"),
        &0i128,
    );
    assert!(result.is_err());
}
