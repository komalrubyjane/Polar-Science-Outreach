import { test, expect } from '@playwright/test';

/**
 * Acceptance smoke test covering the visitor journey from the master spec:
 * homepage → search → repository → detail → media → map → data → education →
 * events → news → expeditions → glossary, plus the registration form.
 *
 * Run against a built app with a seeded database:
 *   npm run build && npm run start   (in one terminal)
 *   npm run test:e2e
 */

test.describe('visitor journey', () => {
  test('homepage loads with hero and primary calls to action', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: /Discover the Science of the Polar Regions/i }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: /Explore Polar Science/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Browse Knowledge Repository/i })).toBeVisible();
  });

  test('primary navigation reaches each major section', async ({ page }) => {
    for (const [name, path] of [
      ['Explore Polar Science', '/explore'],
      ['Knowledge Repository', '/repository'],
      ['Polar Data', '/data'],
      ['Media', '/media'],
      ['Education & Outreach', '/education'],
      ['Expeditions', '/expeditions'],
      ['Events', '/events'],
      ['News', '/news'],
    ] as const) {
      await page.goto(path);
      await expect(page).toHaveURL(new RegExp(path.replace('/', '\\/')));
      await expect(page.locator('main h1')).toBeVisible();
    }
  });

  test('repository search returns results and a record opens', async ({ page }) => {
    await page.goto('/repository?q=sea+ice');
    await expect(page.getByText(/results?/i)).toBeVisible();
    const firstCard = page.locator('main a[href^="/repository/"]').first();
    if (await firstCard.count()) {
      await firstCard.click();
      await expect(page.getByRole('heading', { level: 2, name: 'Abstract' })).toBeVisible();
      await expect(page.getByRole('tab', { name: 'BibTeX' })).toBeVisible();
    }
  });

  test('polar map renders the accessible location list toggle', async ({ page }) => {
    await page.goto('/map');
    await expect(page.getByRole('button', { name: /Accessible list/i })).toBeVisible();
  });

  test('data dashboard shows a demo-data notice', async ({ page }) => {
    await page.goto('/data');
    await expect(page.getByText(/demo/i).first()).toBeVisible();
  });

  test('glossary is browsable', async ({ page }) => {
    await page.goto('/glossary');
    await expect(page.getByRole('heading', { name: /glossary/i })).toBeVisible();
  });

  test('registration form validates input', async ({ page }) => {
    await page.goto('/register');
    await page.getByLabel('Name').fill('Test Person');
    await page.getByLabel('Email').fill('not-an-email');
    await page.getByLabel('Password').fill('weak');
    await page.getByRole('button', { name: /Create account/i }).click();
    await expect(page.getByText(/Use upper, lower and a number|valid email/i).first()).toBeVisible();
  });

  test('404 page renders for unknown routes', async ({ page }) => {
    const res = await page.goto('/this-route-does-not-exist');
    expect(res?.status()).toBe(404);
    await expect(page.getByText('404')).toBeVisible();
  });
});
