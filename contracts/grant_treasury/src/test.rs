#![cfg(test)]

use super::*;
use research_project::ResearchProjectContract;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

fn setup_linked() -> (
    Env,
    Address,
    Address,
    research_project::ResearchProjectContractClient<'static>,
    GrantTreasuryClient<'static>,
) {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let factory = Address::generate(&env);

    let project_id = env.register(ResearchProjectContract, ());
    let treasury_id = env.register(GrantTreasury, ());

    let project = research_project::ResearchProjectContractClient::new(&env, &project_id);
    project.initialize(&admin, &factory, &treasury_id);

    let treasury = GrantTreasuryClient::new(&env, &treasury_id);
    treasury.initialize(&admin, &project_id);

    (env, admin, factory, project, treasury)
}

#[test]
fn approve_and_release_funding() {
    let (env, admin, factory, project, treasury) = setup_linked();
    let lead = Address::generate(&env);
    let pid = project.create_project(
        &factory,
        &lead,
        &1u64,
        &String::from_str(&env, "Climate Models"),
        &String::from_str(&env, "Regional forecasts"),
        &8_000i128,
    );
    project.add_milestone(
        &lead,
        &pid,
        &String::from_str(&env, "Dataset"),
        &3_000i128,
    );
    project.submit_milestone(&lead, &pid, &0u32);

    treasury.approve_grant(&admin, &pid, &8_000i128);
    assert!(treasury.is_grant_approved(&pid));
    assert_eq!(treasury.get_project_balance(&pid), 8_000);

    let released = treasury.release_funding(&admin, &pid, &0u32);
    assert_eq!(released, 3_000);
    assert_eq!(treasury.get_project_balance(&pid), 5_000);
    let (dep, rel) = treasury.get_totals();
    assert_eq!(dep, 8_000);
    assert_eq!(rel, 3_000);
}

#[test]
fn release_without_approval_fails() {
    let (env, admin, factory, project, treasury) = setup_linked();
    let lead = Address::generate(&env);
    let pid = project.create_project(
        &factory,
        &lead,
        &1u64,
        &String::from_str(&env, "Bio"),
        &String::from_str(&env, "Cells"),
        &1_000i128,
    );
    project.add_milestone(&lead, &pid, &String::from_str(&env, "M1"), &500i128);
    project.submit_milestone(&lead, &pid, &0u32);
    let result = treasury.try_release_funding(&admin, &pid, &0u32);
    assert!(result.is_err());
}

#[test]
fn unauthorized_approve_fails() {
    let (env, _admin, _factory, _project, treasury) = setup_linked();
    let attacker = Address::generate(&env);
    let result = treasury.try_approve_grant(&attacker, &1u64, &100i128);
    assert!(result.is_err());
}
