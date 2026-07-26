# Architecture

ResearchHub separates research lifecycle concerns across six Soroban contracts and a Next.js console.

## Contracts

1. **University Registry** — institution identity & verification
2. **Research Factory** — orchestration entrypoint
3. **Research Project** — project/milestone state machine
4. **Grant Treasury** — allocation, release, fees
5. **Peer Review** — scored review attestations
6. **Publication Registry** — DOI anchoring

## Frontend data policy

The console hydrates from Soroban RPC (`contracts.json`). If the ledger is empty, UI tables/charts stay empty. This avoids demo-inflated metrics.

## Signing path

1. Build transaction with `@stellar/stellar-sdk`
2. Confirm dialog in UI
3. Freighter `signTransaction`
4. RPC `sendTransaction` + poll status
