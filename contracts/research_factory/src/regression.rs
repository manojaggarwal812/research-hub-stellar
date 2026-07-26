#![cfg(test)]

//! End-to-end style authorization & regression checks living beside the factory.

use research_project::ResearchProjectContract;
use soroban_sdk::{testutils::Address as _, Address, Env, String};
use university_registry::UniversityRegistry;

use crate::{ResearchFactory, ResearchFactoryClient};

#[test]
fn regression_full_launch_path() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let lead = Address::generate(&env);
    let uni_admin = Address::generate(&env);

    let uni_id = env.register(UniversityRegistry, ());
    let uni = university_registry::UniversityRegistryClient::new(&env, &uni_id);
    uni.initialize(&admin);

    let project_id = env.register(ResearchProjectContract, ());
    let factory_id = env.register(ResearchFactory, ());
    let project = research_project::ResearchProjectContractClient::new(&env, &project_id);
    let treasury = Address::generate(&env);
    project.initialize(&admin, &factory_id, &treasury);

    let factory = ResearchFactoryClient::new(&env, &factory_id);
    factory.initialize(&admin, &uni_id, &project_id);

    let uid = uni.register_university(
        &uni_admin,
        &String::from_str(&env, "Regression U"),
        &String::from_str(&env, "IN"),
    );
    uni.verify_university(&admin, &uid);

    let pid = factory.launch_research(
        &lead,
        &uid,
        &String::from_str(&env, "Regression Study"),
        &String::from_str(&env, "Ensure launch path stays green"),
        &42_000i128,
    );
    assert_eq!(pid, 1);
    assert_eq!(project.project_count(), 1);
    assert_eq!(factory.created_count(), 1);
}
