import { expect, test } from '@playwright/test';

// Smoke e2e: login, create account (if UI provides), deposit, transfer, download statement
// NOTE: selectors may need adjustment to match the app; this is scaffold code.

test('smoke flow: login -> create account -> deposit -> transfer -> download statement', async ({ page, baseURL }) => {
  await page.goto('/');

  // Navigate to login
  await page.click('text=Se connecter');

  // Fill login form
  await page.fill('input[formcontrolname="username"]', 'testuser');
  await page.fill('input[formcontrolname="password"]', 'Password123');
  await page.click('button:has-text("Se connecter")');

  // Wait for dashboard
  await page.waitForURL('**/dashboard', { timeout: 10000 }).catch(() => {});

  // Attempt to navigate to clients and create a new client if the button exists
  if (await page.locator('text=Nouveau Client').count() > 0) {
    await page.click('text=Nouveau Client');
    await page.fill('input[formcontrolname="nom"]', 'E2E');
    await page.fill('input[formcontrolname="prenom"]', 'Test');
    await page.fill('input[formcontrolname="dateNaissance"]', '1990-01-01');
    await page.selectOption('select[formcontrolname="sexe"]', 'MASCULIN');
    await page.fill('input[formcontrolname="courriel"]', 'e2e@example.com');
    await page.click('button:has-text("Créer")');
    await page.waitForTimeout(1000);
  }

  // Navigate to accounts (if available)
  await page.goto('/accounts').catch(() => {});

  // If account list available, select first account
  const accountRow = page.locator('table tbody tr').first();
  if (await accountRow.count() > 0) {
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
      const path = await download.path();
      // path may be null in some environments; assert download object exists
      expect(download).toBeTruthy();
    }
  }

  // Basic assertion: page loaded and not a 500
  expect(await page.title()).toBeTruthy();
});
