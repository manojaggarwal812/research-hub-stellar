#!/usr/bin/env node
/**
 * Deploy ResearchHub contracts to Stellar Testnet and update frontend config.
 */
import { execSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function run(cmd) {
  console.log(`> ${cmd}`);
  return execSync(cmd, {
    cwd: root,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "inherit"],
  }).trim();
}

function extractContractId(output) {
  const match = output.match(/C[A-Z0-9]{55}/);
  if (!match) throw new Error(`Could not parse contract ID from:\n${output}`);
  return match[0];
}

function extractTxHash(output) {
  const match = output.match(/Signing transaction: ([a-f0-9]{64})/i);
  return match ? match[1] : null;
}

console.log("Building contracts...");
run(
  "cargo build --release --target wasm32v1-none -p university_registry -p research_project -p research_factory -p grant_treasury -p peer_review -p publication_registry",
);

const wasm = (name) => `target/wasm32v1-none/release/${name}.wasm`;
let sampleTxHash = null;

function deploy(name) {
  const out = run(
    `stellar contract deploy --wasm ${wasm(name)} --source deployer --network testnet`,
  );
  sampleTxHash = extractTxHash(out) || sampleTxHash;
  return extractContractId(out);
}

const universityRegistry = deploy("university_registry");
const researchProject = deploy("research_project");
const researchFactory = deploy("research_factory");
const grantTreasury = deploy("grant_treasury");
const peerReview = deploy("peer_review");
const publicationRegistry = deploy("publication_registry");

console.log("Initializing contracts...");
run(
  `stellar contract invoke --id ${universityRegistry} --source deployer --network testnet -- initialize --admin deployer`,
);
run(
  `stellar contract invoke --id ${researchProject} --source deployer --network testnet -- initialize --admin deployer --factory ${researchFactory} --treasury ${grantTreasury}`,
);
run(
  `stellar contract invoke --id ${grantTreasury} --source deployer --network testnet -- initialize --admin deployer --research_project ${researchProject} --factory ${researchFactory} --fee_bps 250 --fee_recipient deployer`,
);
run(
  `stellar contract invoke --id ${researchFactory} --source deployer --network testnet -- initialize --admin deployer --university_registry ${universityRegistry} --research_project ${researchProject} --grant_treasury ${grantTreasury}`,
);
run(
  `stellar contract invoke --id ${peerReview} --source deployer --network testnet -- initialize --admin deployer --research_project ${researchProject}`,
);
run(
  `stellar contract invoke --id ${publicationRegistry} --source deployer --network testnet -- initialize --admin deployer --research_project ${researchProject}`,
);

console.log("Sample university registration...");
const sampleOut = run(
  `stellar contract invoke --id ${universityRegistry} --source deployer --network testnet -- register_university --admin deployer --name "ResearchHub Demo University" --country "US"`,
);
sampleTxHash = extractTxHash(sampleOut) || sampleTxHash;
console.log(sampleOut);

const verifyOut = run(
  `stellar contract invoke --id ${universityRegistry} --source deployer --network testnet -- verify_university --caller deployer --university_id 1`,
);
sampleTxHash = extractTxHash(verifyOut) || sampleTxHash;

const deployer = run("stellar keys address deployer");
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
  sampleTxHash: sampleTxHash || "TX_HASH_PLACEHOLDER",
  feeBps: 250,
  deployedAt: new Date().toISOString(),
};

mkdirSync(join(root, "deployments"), { recursive: true });
writeFileSync(join(root, "deployments", "testnet.json"), JSON.stringify(deployment, null, 2));
writeFileSync(join(root, "deployment.json"), JSON.stringify(deployment, null, 2));
mkdirSync(join(root, "frontend", "public"), { recursive: true });
writeFileSync(
  join(root, "frontend", "public", "contracts.json"),
  JSON.stringify(deployment, null, 2),
);

console.log("\nDeployment complete!");
console.log(JSON.stringify(deployment, null, 2));
