# Testing

## Contracts

```bash
cargo test --workspace
```

Coverage includes:

- Happy paths (register, launch, allocate, release with fees)
- Authorization failures
- Edge cases (zero grant, fee cap, duplicate DOI, missing project)
- Regression: factory launch → allocate → milestone → release

## Frontend

```bash
cd frontend
npm run lint
npm run typecheck
npm test
npm run build
```

## CI

GitHub Actions runs contract tests + WASM build, then frontend lint/typecheck/test/build, and validates `deployments/testnet.json` shape.
