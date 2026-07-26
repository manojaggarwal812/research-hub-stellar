#![cfg(test)]

use research_project::ResearchProjectContract;
use soroban_sdk::{testutils::Address as _, Address, Env, String};
use university_registry::UniversityRegistry;

use crate::{ResearchFactory, ResearchFactoryClient};

#[test]
fn regression_full_launch_allocates_and_releases() {
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
    let treasury_id = env.register(grant_treasury::GrantTreasury, ());

    let project = research_project::ResearchProjectContractClient::new(&env, &project_id);
    project.initialize(&admin, &factory_id, &treasury_id);

    let treasury = grant_treasury::GrantTreasuryClient::new(&env, &treasury_id);
    treasury.initialize(&admin, &project_id, &factory_id, &200u32, &admin);

    let factory = ResearchFactoryClient::new(&env, &factory_id);
    factory.initialize(&admin, &uni_id, &project_id, &treasury_id);

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
        &String::from_str(&env, "Ensure launch+allocate+release stays green"),
        &10_000i128,
    );
    assert_eq!(pid, 1);
    assert_eq!(treasury.get_project_balance(&pid), 10_000);

    project.add_milestone(
        &lead,
        &pid,
        &String::from_str(&env, "Phase 1"),
        &2_000i128,
    );
    project.submit_milestone(&lead, &pid, &0u32);
    let (net, fee) = treasury.release_funding(&admin, &pid, &0u32);
    assert_eq!(fee, 40); // 2% of 2000
    assert_eq!(net, 1_960);
}
