# Contributing to ResearchHub

Thanks for helping raise the bar for Stellar research tooling.

## Principles

1. **Honesty over demo theater** — never invent grant balances or seed charts as live data.
2. **Single responsibility contracts** — keep cross-contract calls explicit and tested.
3. **Auth first** — every mutating path needs `require_auth` + role checks + a failing unauthorized test.
4. **Commits** — prefer small, meaningful commits with clear why-focused messages.

## Setup

```bash
# Contracts
cargo test --workspace

# Frontend
cd frontend && npm install && npm run dev
```

Use author identity for this repo:

```bash
git -c user.name="Manoj Aggarwal" -c user.email="manojaggarwal812@gmail.com" commit -m "..."
```

## Pull requests

- Include contract tests for new auth/state paths
- Include frontend tests for pure helpers
- Update `docs/ORANGE_BELT_CHECKLIST.md` if a requirement mapping changes
- Do not commit secrets or funded key seeds

## Code style

- Rust: `#![no_std]` contracts, shared types in `interfaces`
- Frontend: TypeScript strict, Tailwind tokens from `tailwind.config.js`
