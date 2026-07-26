# Deploy frontend to Vercel

1. Push ResearchHub to GitHub.
2. Import the repo in Vercel.
3. Set **Root Directory** to `frontend`.
4. Framework preset: Next.js.
5. Deploy.

Optional env (not required for static `contracts.json`):

```
NEXT_PUBLIC_NETWORK=TESTNET
```

After contract redeploys, commit updated `frontend/public/contracts.json` so production reads live IDs.

CLI:

```bash
cd frontend
npx vercel --prod
```
