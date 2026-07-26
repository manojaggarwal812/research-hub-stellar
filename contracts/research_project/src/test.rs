#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

fn setup() -> (Env, Address, Address, Address, ResearchProjectContractClient<'static>) {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let factory = Address::generate(&env);
    let treasury = Address::generate(&env);
    let id = env.register(ResearchProjectContract, ());
    let client = ResearchProjectContractClient::new(&env, &id);
    client.initialize(&admin, &factory, &treasury);
    (env, admin, factory, treasury, client)
}

#[test]
fn create_project_and_milestones() {
    let (env, admin, factory, treasury, client) = setup();
    let lead = Address::generate(&env);
    let pid = client.create_project(
        &factory,
        &lead,
        &1u64,
        &String::from_str(&env, "Quantum Sensors"),
        &String::from_str(&env, "Novel sensing arrays"),
        &10_000i128,
    );
    assert_eq!(pid, 1);
    let idx = client.add_milestone(
        &lead,
        &pid,
        &String::from_str(&env, "Prototype"),
        &4_000i128,
    );
    assert_eq!(idx, 0);
    client.submit_milestone(&lead, &pid, &idx);
    client.complete_milestone(&admin, &pid, &idx);
    client.mark_milestone_funded(&treasury, &pid, &idx, &4_000i128);
    let project = client.get_project(&pid);
    assert_eq!(project.released_amount, 4_000);
    client.complete_research(&lead, &pid);
    assert_eq!(client.get_project(&pid).status, ProjectStatus::Completed);
}

#[test]
fn unauthorized_factory_rejected() {
    let (env, _admin, _factory, _treasury, client) = setup();
    let fake = Address::generate(&env);
    let lead = Address::generate(&env);
    let result = client.try_create_project(
        &fake,
        &lead,
        &1u64,
        &String::from_str(&env, "Bad"),
        &String::from_str(&env, "Nope"),
        &100i128,
    );
    assert!(result.is_err());
}

#[test]
fn invalid_grant_amount() {
    let (env, _admin, factory, _treasury, client) = setup();
    let lead = Address::generate(&env);
    let result = client.try_create_project(
        &factory,
        &lead,
        &1u64,
        &String::from_str(&env, "Zero"),
        &String::from_str(&env, "Bad"),
        &0i128,
    );
    assert!(result.is_err());
}
