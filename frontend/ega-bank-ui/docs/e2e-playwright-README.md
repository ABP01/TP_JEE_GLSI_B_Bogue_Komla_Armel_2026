# Playwright E2E Tests

How to run the Playwright e2e tests locally:

1. Start the frontend app locally (default `http://localhost:4200`):

```bash
cd frontend/ega-bank-ui
npm run start
```

2. In another terminal, install Playwright browsers (first time):

```bash
cd frontend/ega-bank-ui
npm run e2e:install
```

3. Run the e2e tests:

```bash
cd frontend/ega-bank-ui
npm run e2e
# or: npx playwright test --project=chromium
```

Notes:
- The smoke test `e2e/smoke.spec.ts` is a scaffold and may require selector adjustments to match the actual UI elements.
- Set environment variable `E2E_BASE_URL` to change the base URL used by tests.
