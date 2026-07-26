#!/usr/bin/env node
/**
 * ResearchHub testnet deployment script.
 * Requires: stellar CLI, funded `deployer` identity, network=testnet.
 *
 * Usage: node scripts/deploy.mjs
 */
import { execSync } from "node:child_process";
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function run(cmd) {
  console.log(`\n> ${cmd}`);
  return execSync(cmd, { cwd: root, encoding: "utf8", stdio: ["inherit", "pipe", "inherit"] }).trim();
}

function deployWasm(name) {
  const wasm = join(
    root,
    "target",
    "wasm32-unknown-unknown",
    "release",
    `${name}.wasm`,
  );
  if (!existsSync(wasm)) {
    throw new Error(`Missing WASM for ${name}. Run: cargo build --release --target wasm32-unknown-unknown`);
  }
  const out = run(
    `stellar contract deploy --wasm "${wasm}" --source deployer --network testnet`,
  );
  const match = out.match(/C[A-Z0-9]{55}/);
  if (!match) {
    throw new Error(`Could not parse contract id for ${name}:\n${out}`);
  }
  return match[0];
}

function invoke(contractId, fn, ...args) {
  const argFlags = args.map((a) => `--${a[0]} ${a[1]}`).join(" ");
  return run(
    `stellar contract invoke --id ${contractId} --source deployer --network testnet -- ${fn} ${argFlags}`,
  );
}

console.log("Building contracts…");
run("cargo build --release --target wasm32-unknown-unknown -p university_registry -p research_project -p research_factory -p grant_treasury -p peer_review -p publication_registry");

const deployer = run("stellar keys address deployer");
console.log(`Deployer: ${deployer}`);

const universityRegistry = deployWasm("university_registry");
const researchProject = deployWasm("research_project");
const researchFactory = deployWasm("research_factory");
const grantTreasury = deployWasm("grant_treasury");
const peerReview = deployWasm("peer_review");
const publicationRegistry = deployWasm("publication_registry");

console.log("Initializing contracts…");
invoke(universityRegistry, "initialize", ["admin", deployer]);

// Wire research project with factory + treasury addresses
invoke(
  researchProject,
  "initialize",
  ["admin", deployer],
  ["factory", researchFactory],
  ["treasury", grantTreasury],
);

invoke(
  researchFactory,
  "initialize",
  ["admin", deployer],
  ["university_registry", universityRegistry],
  ["research_project", researchProject],
);

invoke(
  grantTreasury,
  "initialize",
  ["admin", deployer],
  ["research_project", researchProject],
);

invoke(
  peerReview,
  "initialize",
  ["admin", deployer],
  ["research_project", researchProject],
);

invoke(
  publicationRegistry,
  "initialize",
  ["admin", deployer],
  ["research_project", researchProject],
);

// Sample lifecycle interaction for a transaction hash
const uniOut = invoke(
  universityRegistry,
  "register_university",
  ["admin", deployer],
  ["name", '"ResearchHub Demo University"'],
  ["country", '"US"'],
);
console.log("register_university output:", uniOut);

const sampleTxHash = "TX_HASH_PLACEHOLDER";
// Prefer capturing from stellar CLI logs when available; placeholder kept for docs until live deploy.

const deployment = {
  network: "TESTNET",
  rpcUrl: "https://soroban-testnet.stellar.org",
  deployer,
  universityRegistry,
  researchFactory,
  researchProject,
  grantTreasury,
  peerReview,
  publicationRegistry,
  sampleTxHash,
  deployedAt: new Date().toISOString(),
};

writeFileSync(join(root, "deployment.json"), JSON.stringify(deployment, null, 2));
mkdirSync(join(root, "frontend", "public"), { recursive: true });
writeFileSync(
  join(root, "frontend", "public", "contracts.json"),
  JSON.stringify(deployment, null, 2),
);

console.log("\nDeployment complete.");
console.log(JSON.stringify(deployment, null, 2));
