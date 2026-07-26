# ResearchHub

**Orange Belt** — Production-ready decentralized Research Grant & Collaboration Platform on Stellar (Soroban).

ResearchHub lets universities, funders, professors, students, and reviewers manage the **full research grant lifecycle** on-chain: institution verification, project launch, milestone approvals, peer review, publications, and transparent treasury releases.

This is **not** a document manager, crowdfunding app, or education portal.

![Stellar Testnet](https://img.shields.io/badge/network-testnet-blue)
![Rust](https://img.shields.io/badge/contracts-Rust%2FSoroban-orange)
![Next.js](https://img.shields.io/badge/frontend-Next.js%20%2B%20TypeScript-black)

## Live Demo

| Resource | Link |
|----------|------|
| **Live App** | _Deploy to Vercel — see [Deployment](#deployment)_ |
| **Demo Video** | _Add 1–2 min walkthrough after recording_ |
| **University Registry** | [`CA3W4JP7PKEZSLXUCQK6B6HH4CB5LJFEODYG5BTG6FOWTZ5FWS5Y22ER`](https://stellar.expert/explorer/testnet/contract/CA3W4JP7PKEZSLXUCQK6B6HH4CB5LJFEODYG5BTG6FOWTZ5FWS5Y22ER) |
| **Research Factory** | [`CAKITIFTFG6WSQXCEL5RABFFRO46BKEIC73GFOEHMS4SQDHY24EOWBDD`](https://stellar.expert/explorer/testnet/contract/CAKITIFTFG6WSQXCEL5RABFFRO46BKEIC73GFOEHMS4SQDHY24EOWBDD) |
| **Research Project** | [`CDEP2M6WTYHTDB74UPJL7VNFZYONJDGSLGGDJNTOFSLBF2MNPUP6WQ5T`](https://stellar.expert/explorer/testnet/contract/CDEP2M6WTYHTDB74UPJL7VNFZYONJDGSLGGDJNTOFSLBF2MNPUP6WQ5T) |
| **Grant Treasury** | [`CB2FYQ5L63CRQE5HQ5RMD2AEEOSIZN674LQAG2NLMBY34GHEKCCTPW7T`](https://stellar.expert/explorer/testnet/contract/CB2FYQ5L63CRQE5HQ5RMD2AEEOSIZN674LQAG2NLMBY34GHEKCCTPW7T) |
| **Peer Review** | [`CD4HGQ6OIH3FKF43KQEKOWORWCK3LR6JYK236ZWDVH26AYGZW6OQVLJY`](https://stellar.expert/explorer/testnet/contract/CD4HGQ6OIH3FKF43KQEKOWORWCK3LR6JYK236ZWDVH26AYGZW6OQVLJY) |
| **Publication Registry** | [`CCQCQF5TPUBMT73XI7AFXRTSIRBJKNE35GIVOFUYELJL5KTXU6ISQG4S`](https://stellar.expert/explorer/testnet/contract/CCQCQF5TPUBMT73XI7AFXRTSIRBJKNE35GIVOFUYELJL5KTXU6ISQG4S) |
| **Sample Tx Hash** | [`9dbe2b44…`](https://stellar.expert/explorer/testnet/tx/9dbe2b44e715b75d2e5cb9d342b199287433cffcdf032a25958fde676a6c70f9) |

> Addresses written by `npm run deploy` into `deployment.json` and `frontend/public/contracts.json`.

## Architecture

```
┌────────────────────┐   is_verified    ┌─────────────────────┐
│ University Registry│◀─────────────────│  Research Factory   │
└────────────────────┘                  └──────────┬──────────┘
                                                   │ create_project
                                                   ▼
┌────────────────────┐  complete/fund   ┌─────────────────────┐
│   Grant Treasury   │─────────────────▶│  Research Project   │
└────────────────────┘                  └──────────┬──────────┘
                                                   │ get_project
                          ┌────────────────────────┼────────────────────────┐
                          ▼                        ▼                        ▼
                 ┌────────────────┐     ┌──────────────────┐     ┌────────────────────┐
                 │  Peer Review   │     │ Publication Reg. │     │   Event Stream     │
                 └────────────────┘     └──────────────────┘     └─────────┬──────────┘
                                                                           │
                                                                 ┌─────────▼─────────┐
                                                                 │ Next.js Frontend  │
                                                                 │ Freighter + RPC   │
                                                                 └───────────────────┘
```

### Smart Contracts

| Contract | Responsibility |
|----------|----------------|
| `university_registry` | Register & verify institutions |
| `research_factory` | Gate launches on verified universities; create projects |
| `research_project` | Project + milestone lifecycle |
| `grant_treasury` | Approve grants; release milestone funding |
| `peer_review` | Submit & approve scored reviews |
| `publication_registry` | Register DOI-linked publications |
| `interfaces` | Shared types & errors |

### Frontend

- Next.js 15 + TypeScript + Tailwind CSS
- Freighter wallet integration
- Dark mode, skeletons, toasts, error boundary
- Search, filters, pagination, Recharts analytics
- Responsive: desktop, tablet, mobile

## Orange Belt Requirements

| Requirement | Status |
|-------------|--------|
| Advanced Soroban smart contracts | ✅ Six domain contracts + shared interfaces |
| Multiple smart contracts | ✅ 6 deployable contracts |
| Contract-to-contract communication | ✅ Factory→Registry/Project, Treasury→Project, Review/Pub→Project |
| Event streaming | ✅ Lifecycle events + Activity timeline UI |
| Production-ready architecture | ✅ Workspace, scripts, typed frontend, CI |
| Mobile responsive frontend | ✅ Header drawer + responsive grids |
| Proper loading states | ✅ Skeleton loaders |
| Proper error handling | ✅ Error boundary + toasts + banners |
| Smart contract testing | ✅ 17 tests (auth, edge, integration) |
| Frontend testing | ✅ Vitest unit + component tests |
| CI/CD pipeline | ✅ GitHub Actions lint/typecheck/test/build |
| Deployment scripts | ✅ `scripts/deploy.mjs` |
| Professional documentation | ✅ This README + `docs/` |
| Stellar Testnet deployment | ✅ Deployed via `npm run deploy` |
| Contract addresses | ✅ See Live Demo table |
| Transaction hash | ✅ `9dbe2b44e715b75d2e5cb9d342b199287433cffcdf032a25958fde676a6c70f9` |
| Live demo ready | ✅ `npm run dev` / Vercel |
| Minimum 20 meaningful commits | ✅ Git history |

## Quick Start

### Prerequisites

- [Rust](https://rustup.rs/) 1.84+ with `wasm32-unknown-unknown`
- [Stellar CLI](https://developers.stellar.org/docs/tools/cli)
- [Node.js](https://nodejs.org/) 20+
- [Freighter](https://www.freighter.app/)

### Install

```bash
git clone https://github.com/YOUR_USERNAME/ResearchHub.git
cd ResearchHub
cd frontend && npm install && cd ..
```

### Test

```bash
# All (17 contract + frontend)
npm test

# Contracts only
cargo test --workspace

# Frontend only
npm run test:frontend
```

### Develop

```bash
npm run dev
# http://localhost:3000
```

### Build

```bash
npm run build
```

### Deploy Contracts (Testnet)

```bash
stellar keys generate deployer --network testnet --fund
stellar network use testnet
npm run deploy
```

### Deploy Frontend

```bash
cd frontend
npx vercel --prod
```

Set Vercel root directory to `frontend`.

## Project Structure

```
ResearchHub/
├── contracts/
│   ├── interfaces/
│   ├── university_registry/
│   ├── research_factory/
│   ├── research_project/
│   ├── grant_treasury/
│   ├── peer_review/
│   └── publication_registry/
├── frontend/                 # Next.js app
├── scripts/deploy.mjs
├── .github/workflows/ci.yml
├── docs/
├── deployment.json
└── README.md
```

## Events

| Event | When |
|-------|------|
| UniversityRegistered | Institution registered |
| ResearchCreated / launch | Factory creates project |
| GrantApproved | Treasury approves allocation |
| MilestoneCompleted | Milestone approved |
| PeerReviewSubmitted | Review submitted |
| PeerReviewApproved | Review attested |
| PublicationRegistered | DOI registered |
| FundingReleased | Treasury payout |
| ResearchCompleted | Project closed |
| ActivityUpdated | Status / stream sync |

## License

MIT
