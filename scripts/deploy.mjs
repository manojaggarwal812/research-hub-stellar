#!/usr/bin/env node
/**
 * Deploy ResearchHub contracts to Stellar Testnet and update frontend config.
 *
 * Prerequisites:
 *   - stellar CLI installed
 *   - Funded identity: stellar keys generate deployer --network testnet --fund
 *
 * Usage: npm run deploy
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
  const match = output.match(/\b([a-f0-9]{64})\b/i);
  return match ? match[1] : null;
}

console.log("Building contracts...");
run(
  "cargo build --release --target wasm32v1-none -p university_registry -p research_project -p research_factory -p grant_treasury -p peer_review -p publication_registry",
);

const wasm = (name) => `target/wasm32v1-none/release/${name}.wasm`;

console.log("Deploying University Registry...");
const universityRegistry = extractContractId(
  run(
    `stellar contract deploy --wasm ${wasm("university_registry")} --source deployer --network testnet`,
  ),
);

console.log("Deploying Research Project...");
const researchProject = extractContractId(
  run(
    `stellar contract deploy --wasm ${wasm("research_project")} --source deployer --network testnet`,
  ),
);

console.log("Deploying Research Factory...");
const researchFactory = extractContractId(
  run(
    `stellar contract deploy --wasm ${wasm("research_factory")} --source deployer --network testnet`,
  ),
);

console.log("Deploying Grant Treasury...");
const grantTreasury = extractContractId(
  run(
    `stellar contract deploy --wasm ${wasm("grant_treasury")} --source deployer --network testnet`,
  ),
);

console.log("Deploying Peer Review...");
const peerReview = extractContractId(
  run(
    `stellar contract deploy --wasm ${wasm("peer_review")} --source deployer --network testnet`,
  ),
);

console.log("Deploying Publication Registry...");
const publicationRegistry = extractContractId(
  run(
    `stellar contract deploy --wasm ${wasm("publication_registry")} --source deployer --network testnet`,
  ),
);

console.log("Initializing contracts...");
run(
  `stellar contract invoke --id ${universityRegistry} --source deployer --network testnet -- initialize --admin deployer`,
);
run(
  `stellar contract invoke --id ${researchProject} --source deployer --network testnet -- initialize --admin deployer --factory ${researchFactory} --treasury ${grantTreasury}`,
);
run(
  `stellar contract invoke --id ${researchFactory} --source deployer --network testnet -- initialize --admin deployer --university_registry ${universityRegistry} --research_project ${researchProject}`,
);
run(
  `stellar contract invoke --id ${grantTreasury} --source deployer --network testnet -- initialize --admin deployer --research_project ${researchProject}`,
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
console.log(sampleOut);

const sampleTxHash =
  extractTxHash(sampleOut) ||
  "Check stellar.expert for the latest register_university transaction";

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
  sampleTxHash,
  deployedAt: new Date().toISOString(),
  explorers: {
    universityRegistry: `https://stellar.expert/explorer/testnet/contract/${universityRegistry}`,
    researchFactory: `https://stellar.expert/explorer/testnet/contract/${researchFactory}`,
    researchProject: `https://stellar.expert/explorer/testnet/contract/${researchProject}`,
    grantTreasury: `https://stellar.expert/explorer/testnet/contract/${grantTreasury}`,
    peerReview: `https://stellar.expert/explorer/testnet/contract/${peerReview}`,
    publicationRegistry: `https://stellar.expert/explorer/testnet/contract/${publicationRegistry}`,
  },
};

writeFileSync(join(root, "deployment.json"), JSON.stringify(deployment, null, 2));
mkdirSync(join(root, "frontend", "public"), { recursive: true });
writeFileSync(
  join(root, "frontend", "public", "contracts.json"),
  JSON.stringify(deployment, null, 2),
);

console.log("\nDeployment complete!");
console.log(JSON.stringify(deployment, null, 2));
