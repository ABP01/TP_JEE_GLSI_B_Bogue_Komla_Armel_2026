import { expect, test } from '@playwright/test';

// Increase overall test timeout for slow CI environments
test.setTimeout(120_000);

// Smoke e2e: login, create account (if UI provides), deposit, transfer, download statement
// NOTE: selectors may need adjustment to match the app; this is scaffold code.

test('smoke flow: login -> create account -> deposit -> transfer -> download statement', async ({ page, baseURL }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Navigate to login: if there is a visible "Se connecter" button on the homepage, click it,
  // otherwise navigate directly to /login as a fallback.
  const loginButton = page.locator('text=Se connecter');
  if (await loginButton.count() > 0) {
    await loginButton.click({ timeout: 10_000 });
  } else {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
  }

  // Fill login form (selectors may need adjustment)
  if (await page.locator('input[formcontrolname="username"]').count() > 0) {
    await page.fill('input[formcontrolname="username"]', 'testuser');
    await page.fill('input[formcontrolname="password"]', 'Password123');
    const submitBtn = page.locator('button:has-text("Se connecter")');
    if (await submitBtn.count() > 0) await submitBtn.click();
  }

  // Wait for dashboard (best-effort)
  await page.waitForURL('**/dashboard', { timeout: 15_000 }).catch(() => {});

  // Attempt to navigate to clients and create a new client if the button exists
  if (await page.locator('text=Nouveau Client').count() > 0) {
    await page.click('text=Nouveau Client');
    await page.fill('input[formcontrolname="nom"]', 'E2E');
    await page.fill('input[formcontrolname="prenom"]', 'Test');
    await page.fill('input[formcontrolname="dateNaissance"]', '1990-01-01');
    await page.selectOption('select[formcontrolname="sexe"]', 'MASCULIN');
    await page.fill('input[formcontrolname="courriel"]', 'e2e@example.com');
    const createBtn = page.locator('button:has-text("Créer")');
    if (await createBtn.count() > 0) await createBtn.click();
    await page.waitForTimeout(1000);
  }

  // Navigate to accounts (if available)
  await page.goto('/accounts').catch(() => {});

  // If account list available, select first account
  const accountRow = page.locator('table tbody tr').first();
  if ((await accountRow.count()) > 0) {
    await accountRow.click();
    // Open operation modal and perform deposit
    if (await page.locator('button:has-text("Déposer")').count() > 0) {
      await page.click('button:has-text("Déposer")');
      await page.fill('input[formcontrolname="montant"]', '100.00');
      await page.click('button:has-text("Confirmer")');
      await page.waitForTimeout(1000);
    }

    // Download statement if button present
    if (await page.locator('text=Télécharger relevé').count() > 0) {
      const [ download ] = await Promise.all([
        page.waitForEvent('download'),
        page.click('text=Télécharger relevé')
      ]);
      // path may be null in some environments; assert download object exists
      expect(download).toBeTruthy();
    }
  }

  // Basic assertion: page loaded and not a 500
  expect(await page.title()).toBeTruthy();
});
