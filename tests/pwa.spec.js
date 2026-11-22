const { test, expect } = require('./hjalp');

test.describe('Installation', () => {
  test('manifest, ikoner och service worker finns', { annotation: { type: 'testfall', description: 'TC-PWA-03' } }, async ({ page, request, api }) => {
    await page.goto('./');
    await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', 'manifest.webmanifest');
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', 'icons/apple-touch-icon.png');
    const m = await (await request.get('manifest.webmanifest')).json();
    expect(m.name).toBe('Commit-staden');
    expect(m.display).toBe('standalone');
    for (const ikon of [...m.icons.map((i) => i.src), 'icons/apple-touch-icon.png', 'icons/icon.svg', 'sw.js']) {
      expect((await request.get(ikon)).status(), ikon).toBe(200);
    }
    // Alla filer i SHELL ska finnas
    const sw = await (await request.get('sw.js')).text();
    const filer = [...sw.matchAll(/'\.\/([^']*)'/g)].map((x) => x[1]).filter(Boolean);
    for (const f of filer) expect((await request.get(f)).status(), f).toBe(200);
  });
});
