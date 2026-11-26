// Gemensamma hjälpfunktioner och fixturer för testerna.
const base = require('@playwright/test');
const { mocka } = require('./mock');
const { repon: stadRepon } = require('./stad-data');

const test = base.test.extend({
  // Mockar allt externt innan varje test
  api: async ({ page }, use) => {
    const api = await mocka(page);
    await use(api);
  },

  // Startsidan med en färdig stad av testdatan (stad-data.js), utan att gå via GitHub
  staden: async ({ page, api }, use) => {
    await page.goto('./');
    await page.waitForFunction(() => window.CsStad && window.CsStad.klar && window.CsApp);
    await page.locator('#btn-gh-stang').click();
    await page.evaluate((r) => window.CsApp.visa(r, { login: 'testdennis', tid: new Date().toISOString() }), stadRepon);
    await base.expect(page.locator('#hud-invanare')).not.toHaveText('–');
    await use(page);
  }
});

// Bifogar en skärmdump till rapporten
async function bild(page, namn) {
  await page.waitForTimeout(250); // låt animationer landa
  await test.info().attach(namn, { body: await page.screenshot(), contentType: 'image/png' });
}

// Läser stadens läge (distrikt, bränder, kamera m.m.)
const lage = (page) => page.evaluate(() => window.CsStad.lage());

module.exports = { test, expect: base.expect, bild, lage, stadRepon };
