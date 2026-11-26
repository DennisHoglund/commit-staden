const { test, expect, bild, lage } = require('./hjalp');
const { ansluten } = require('./mock');

test.describe('Tema', () => {
  test('temaknappen växlar Auto → Ljust → Mörkt och sparar valet', { annotation: { type: 'testfall', description: 'TC-TEM-01' } }, async ({ staden: page }) => {
    const knapp = page.locator('#btn-theme');
    await expect(page.locator('#theme-label')).toHaveText('Auto');
    await knapp.click();
    await expect(page.locator('#theme-label')).toHaveText('Ljust');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    expect((await lage(page)).tema).toBe('light');
    await knapp.click();
    await expect(page.locator('#theme-label')).toHaveText('Mörkt');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    expect((await lage(page)).tema).toBe('dark');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('#theme-label')).toHaveText('Mörkt');
  });

  test('mörkt nattläge följer telefonen', { annotation: { type: 'testfall', description: 'TC-TEM-02' } }, async ({ page, api }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await ansluten(page);
    await page.goto('./');
    await page.waitForFunction(() => window.CsStad && window.CsStad.klar && window.CsStad.lage().distrikt.length === 3);
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg).toBe('rgb(0, 0, 0)');
    expect((await lage(page)).tema).toBe('dark');
    await bild(page, 'Staden på natten');
  });

  test('ljust läge ger dagstaden', { annotation: { type: 'testfall', description: 'TC-TEM-03' } }, async ({ page, api }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await ansluten(page);
    await page.goto('./');
    await page.waitForFunction(() => window.CsStad && window.CsStad.klar && window.CsStad.lage().distrikt.length === 3);
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg).toBe('rgb(220, 235, 224)');
    expect((await lage(page)).tema).toBe('light');
    await bild(page, 'Staden på dagen');
  });
});
