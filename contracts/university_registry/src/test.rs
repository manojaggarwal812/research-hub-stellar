#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

fn setup() -> (Env, Address, UniversityRegistryClient<'static>) {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let id = env.register(UniversityRegistry, ());
    let client = UniversityRegistryClient::new(&env, &id);
    client.initialize(&admin);
    (env, admin, client)
}

#[test]
fn register_and_verify_university() {
    let (env, _platform, client) = setup();
    let uni_admin = Address::generate(&env);
    let id = client.register_university(
        &uni_admin,
        &String::from_str(&env, "MIT"),
        &String::from_str(&env, "US"),
    );
    assert_eq!(id, 1);
    assert!(!client.is_verified(&id));
    client.verify_university(&_platform, &id);
    assert!(client.is_verified(&id));
    assert_eq!(client.university_count(), 1);
}

#[test]
fn reject_duplicate_admin() {
    let (env, _platform, client) = setup();
    let uni_admin = Address::generate(&env);
    client.register_university(
        &uni_admin,
        &String::from_str(&env, "Stanford"),
        &String::from_str(&env, "US"),
    );
    let result = client.try_register_university(
        &uni_admin,
        &String::from_str(&env, "Duplicate"),
        &String::from_str(&env, "US"),
    );
    assert!(result.is_err());
}

#[test]
fn unauthorized_verify_fails() {
    let (env, _platform, client) = setup();
    let uni_admin = Address::generate(&env);
    let attacker = Address::generate(&env);
    let id = client.register_university(
        &uni_admin,
        &String::from_str(&env, "Oxford"),
        &String::from_str(&env, "UK"),
    );
    let result = client.try_verify_university(&attacker, &id);
    assert!(result.is_err());
}

#[test]
fn verify_nonexistent_university_fails() {
    let (_env, platform, client) = setup();
    assert!(client.try_verify_university(&platform, &999u64).is_err());
}

#[test]
fn get_university_returns_correct_data() {
    let (env, _platform, client) = setup();
    let uni_admin = Address::generate(&env);
    client.register_university(
        &uni_admin,
        &String::from_str(&env, "Harvard"),
        &String::from_str(&env, "US"),
    );
    let uni = client.get_university(&1u64);
    assert_eq!(uni.name, String::from_str(&env, "Harvard"));
    assert_eq!(uni.country, String::from_str(&env, "US"));
    assert_eq!(uni.admin, uni_admin);
}

#[test]
fn multiple_universities_increment_count() {
    let (env, _platform, client) = setup();
    for i in 0..5 {
        let a = Address::generate(&env);
        client.register_university(
            &a,
            &String::from_str(&env, "Uni"),
            &String::from_str(&env, "X"),
        );
    }
    assert_eq!(client.university_count(), 5);
}

#[test]
fn double_verify_is_idempotent() {
    let (env, platform, client) = setup();
    let uni_admin = Address::generate(&env);
    let id = client.register_university(
        &uni_admin,
        &String::from_str(&env, "Yale"),
        &String::from_str(&env, "US"),
    );
    client.verify_university(&platform, &id);
    client.verify_university(&platform, &id);
    assert!(client.is_verified(&id));
}

#[test]
fn get_admin_returns_initializer() {
    let (_env, platform, client) = setup();
    assert_eq!(client.get_admin(), platform);
}
