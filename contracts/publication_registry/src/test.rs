#![cfg(test)]

use super::*;
use research_project::ResearchProjectContract;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

fn setup() -> (
    Env,
    Address,
    Address,
    research_project::ResearchProjectContractClient<'static>,
    PublicationRegistryClient<'static>,
) {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let factory = Address::generate(&env);
    let treasury = Address::generate(&env);

    let project_id = env.register(ResearchProjectContract, ());
    let pub_id = env.register(PublicationRegistry, ());

    let project = research_project::ResearchProjectContractClient::new(&env, &project_id);
    project.initialize(&admin, &factory, &treasury);

    let pubs = PublicationRegistryClient::new(&env, &pub_id);
    pubs.initialize(&admin, &project_id);

    (env, admin, factory, project, pubs)
}

#[test]
fn register_publication_for_project() {
    let (env, _admin, factory, project, pubs) = setup();
    let lead = Address::generate(&env);
    let pid = project.create_project(
        &factory,
        &lead,
        &1u64,
        &String::from_str(&env, "Genomics"),
        &String::from_str(&env, "CRISPR delivery"),
        &5_000i128,
    );
    let id = pubs.register_publication(
        &lead,
        &pid,
        &String::from_str(&env, "Efficient Base Editing"),
        &String::from_str(&env, "10.1000/rh.001"),
        &String::from_str(&env, "Lead et al."),
    );
    assert_eq!(id, 1);
    assert_eq!(pubs.project_publication_count(&pid), 1);
}

#[test]
fn duplicate_doi_rejected() {
    let (env, _admin, factory, project, pubs) = setup();
    let lead = Address::generate(&env);
    let pid = project.create_project(
        &factory,
        &lead,
        &1u64,
        &String::from_str(&env, "A"),
        &String::from_str(&env, "B"),
        &100i128,
    );
    let doi = String::from_str(&env, "10.1000/dup");
    pubs.register_publication(
        &lead,
        &pid,
        &String::from_str(&env, "One"),
        &doi,
        &String::from_str(&env, "A"),
    );
    let result = pubs.try_register_publication(
        &lead,
        &pid,
        &String::from_str(&env, "Two"),
        &doi,
        &String::from_str(&env, "B"),
    );
    assert!(result.is_err());
}

#[test]
fn unauthorized_registration_fails() {
    let (env, _admin, factory, project, pubs) = setup();
    let lead = Address::generate(&env);
    let stranger = Address::generate(&env);
    let pid = project.create_project(
        &factory,
        &lead,
        &1u64,
        &String::from_str(&env, "A"),
        &String::from_str(&env, "B"),
        &100i128,
    );
    let result = pubs.try_register_publication(
        &stranger,
        &pid,
        &String::from_str(&env, "Stolen"),
        &String::from_str(&env, "10.1000/x"),
        &String::from_str(&env, "X"),
    );
    assert!(result.is_err());
}
