.PHONY: test test-contracts test-frontend build deploy frontend-dev

test: test-contracts test-frontend

test-contracts:
	cargo test --workspace

test-frontend:
	npm --prefix frontend test

build:
	cargo build --release --target wasm32v1-none -p university_registry -p research_project -p research_factory -p grant_treasury -p peer_review -p publication_registry
	npm --prefix frontend run build

deploy:
	node scripts/deploy.mjs

frontend-dev:
	npm --prefix frontend run dev
