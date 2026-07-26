#![cfg(test)]

use super::*;
use research_project::ResearchProjectContract;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

fn setup() -> (
    Env,
    Address,
    Address,
    research_project::ResearchProjectContractClient<'static>,
    PeerReviewContractClient<'static>,
) {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let factory = Address::generate(&env);
    let treasury = Address::generate(&env);

    let project_id = env.register(ResearchProjectContract, ());
    let review_id = env.register(PeerReviewContract, ());

    let project = research_project::ResearchProjectContractClient::new(&env, &project_id);
    project.initialize(&admin, &factory, &treasury);

    let reviews = PeerReviewContractClient::new(&env, &review_id);
    reviews.initialize(&admin, &project_id);

    (env, admin, factory, project, reviews)
}

#[test]
fn submit_and_approve_review() {
    let (env, admin, factory, project, reviews) = setup();
    let lead = Address::generate(&env);
    let reviewer = Address::generate(&env);
    let pid = project.create_project(
        &factory,
        &lead,
        &1u64,
        &String::from_str(&env, "Neuro"),
        &String::from_str(&env, "Imaging"),
        &2_000i128,
    );
    let rid = reviews.submit_review(&reviewer, &pid, &88u32, &1u32);
    assert_eq!(rid, 1);
    assert_eq!(reviews.project_review_count(&pid), 1);
    reviews.approve_review(&admin, &rid);
    assert!(reviews.get_review(&rid).approved);
}

#[test]
fn invalid_score_rejected() {
    let (env, _admin, factory, project, reviews) = setup();
    let lead = Address::generate(&env);
    let reviewer = Address::generate(&env);
    let pid = project.create_project(
        &factory,
        &lead,
        &1u64,
        &String::from_str(&env, "A"),
        &String::from_str(&env, "B"),
        &100i128,
    );
    let result = reviews.try_submit_review(&reviewer, &pid, &150u32, &3u32);
    assert!(result.is_err());
}

#[test]
fn review_missing_project_fails() {
    let (env, _admin, _factory, _project, reviews) = setup();
    let reviewer = Address::generate(&env);
    let result = reviews.try_submit_review(&reviewer, &99u64, &50u32, &2u32);
    assert!(result.is_err());
}
