# Orange Belt checklist — ResearchHub

| Requirement | Implementation | Evidence |
|---|---|---|
| Advanced Soroban contracts | 6 domain contracts + shared interfaces | `contracts/*` |
| Multiple smart contracts | university, factory, project, treasury, review, publication | workspace members |
| Contract-to-contract communication | Factory→Uni/Project/Treasury; Treasury→Project; Review/Pub→Project | `research_factory`, `grant_treasury` |
| Event streaming | Lifecycle symbols + Activity RPC poll + Transparency | `events` in contracts; `stellar.pollHubEvents` |
| Production-ready architecture | Workspace, Makefile, deployments, typed console | repo root |
| Mobile responsive frontend | Sticky header drawer + responsive grids | `SiteHeader`, pages |
| Loading states | Skeletons on all data pages | `Skeleton.tsx` |
| Error handling | Error boundary + toasts + banners | `ErrorBoundary`, `sonner`, `NetworkBanner` |
| Smart contract testing | 21+ tests incl. fees, allocate, auth, regression | `cargo test --workspace` |
| Frontend testing | Vitest helpers + components + events | `frontend/src/**/*.test.*` |
| CI/CD pipeline | Contracts + frontend quality gates + deploy validation | `.github/workflows/ci.yml` |
| Deployment scripts | `scripts/deploy.mjs` | `npm run deploy` |
| Professional documentation | README mermaid + docs suite | `docs/*`, `CONTRIBUTING.md` |
| Stellar Testnet deployment | Live IDs in `deployments/testnet.json` | after `npm run deploy` |
| Contract addresses | Written to JSON + README | `frontend/public/contracts.json` |
| Transaction hash | Sample register/verify hash recorded | `sampleTxHash` |
| Live demo ready | `npm run dev` / Vercel guide | `docs/VERCEL_DEPLOY.md` |
| 20+ meaningful commits | Git history as Manoj Aggarwal | `git log` |

## Differentiators beyond baseline Orange Belt

- Protocol fee collection on release
- Factory multi-hop allocate
- Empty-by-default console (no fake seed balances)
- Real multi-wallet connectors + confirm dialogs + transparency page
- End-to-end signed lifecycle actions (not connect-only demos)
