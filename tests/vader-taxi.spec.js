const { test, expect, bild, lage } = require('./hjalp');

const repo = (namn, ci) => ({ namn, sprak: 'JavaScript', commits: 60, rader: 1000, veckans: 1, ci, ciAndel: 1, prOppna: 0, issues: 0, senast: new Date().toISOString() });

test.describe('Väder', () => {
  test('vädret visar hur byggena mår', { annotation: { type: 'testfall', description: 'TC-VAD-01' } }, async ({ staden: page }) => {
    // Demon har ett rött bygge: mulet
    expect((await lage(page)).vader).toBe('mulet');
    await expect(page.locator('#hud-datum')).toContainText('Mulet');

    // Inga bränder: klart
    await page.evaluate((r) => window.CsStad.sattRepon(r), [repo('a', 'ok'), repo('b', 'ok')]);
    expect((await lage(page)).vader).toBe('klart');
    expect((await lage(page)).brandbilar).toEqual([]);
    await bild(page, 'Klart väder');

    // Två eller fler bränder: åska, och en brandbil per brand
    await page.evaluate((r) => window.CsStad.sattRepon(r), [repo('a', 'fel'), repo('b', 'fel'), repo('c', 'ok')]);
    const l = await lage(page);
    expect(l.vader).toBe('aska');
    expect(l.brandbilar.sort()).toEqual(['a', 'b']);
    await bild(page, 'Åska');
  });
});

test.describe('Taxi', () => {
  test('sök och åk taxi till ett distrikt', { annotation: { type: 'testfall', description: 'TC-TAX-01' } }, async ({ staden: page }) => {
    await page.locator('#btn-sok').click();
    await expect(page.getByRole('dialog', { name: 'Sök i staden' })).toBeVisible();
    const antal = await page.evaluate(() => window.CsDemo.repon.length);
    await expect(page.locator('#sok-lista button')).toHaveCount(Math.min(8, antal));
    await page.locator('#sok').fill('ELK');
    await expect(page.locator('#sok-lista button')).toHaveCount(1);
    await expect(page.locator('#sok-lista button')).toContainText('elkoll');
    await expect(page.locator('#sok-lista button')).toContainText('brinner');
    await bild(page, 'Sök');

    await page.locator('#sok-lista button').click();
    await expect(page.locator('#sok-kort')).toBeHidden();
    expect((await lage(page)).taxi).toEqual({ namn: 'elkoll', framme: false });
    await page.waitForTimeout(600);
    await bild(page, 'Taxi på väg');

    // Framme: distriktskortet öppnas
    await expect(page.locator('#kort-titel')).toHaveText('elkoll', { timeout: 8000 });
    expect((await lage(page)).taxi.framme).toBe(true);
    await page.locator('#btn-stang').click();
    expect((await lage(page)).taxi).toBeNull();
  });

  test('sök utan träff säger det, och Enter åker till första träffen', { annotation: { type: 'testfall', description: 'TC-TAX-02' } }, async ({ staden: page }) => {
    await page.locator('#btn-sok').click();
    await page.locator('#sok').fill('zzz');
    await expect(page.locator('#sok-tom')).toBeVisible();
    await expect(page.locator('#sok-lista button')).toHaveCount(0);
    await page.locator('#sok').fill('jakt');
    await page.locator('#sok').press('Enter');
    await expect(page.locator('#kort-titel')).toHaveText('jaktvind', { timeout: 8000 });
  });
});
