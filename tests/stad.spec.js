const { test, expect, bild, lage, stadRepon } = require('./hjalp');

test.describe('Staden', () => {
  test('staden ritas med ett distrikt per repo', { annotation: { type: 'testfall', description: 'TC-STA-01' } }, async ({ staden: page }) => {
    const antal = stadRepon.length;
    await expect(page.locator('#distrikt-lista button')).toHaveCount(antal);
    const l = await lage(page);
    expect(l.distrikt).toHaveLength(antal);
    // Staden fyller skärmen på bredden (kanterna får gå utanför)
    expect(l.bredd).toBeGreaterThanOrEqual(page.viewportSize().width - 16);
    // Små repon blir minst tre hus
    expect(Math.min(...l.distrikt.map((d) => d.hus))).toBeGreaterThanOrEqual(3);
    await expect(page.locator('#btn-konto')).toHaveText('testdennis');

    // Canvasen ska innehålla mer än bakgrundsfärg
    const farger = await page.evaluate(() => {
      const c = document.getElementById('stad');
      const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
      const set = new Set();
      for (let i = 0; i < d.length; i += 4 * 97) set.add(d[i] + ',' + d[i + 1] + ',' + d[i + 2]);
      return set.size;
    });
    expect(farger).toBeGreaterThan(10);
    await bild(page, 'Staden');
  });

  test('HUD:en visar invånare, budget, nöjdhet och bränder', { annotation: { type: 'testfall', description: 'TC-STA-02' } }, async ({ staden: page }) => {
    const v = await page.evaluate((r) => {
      const sum = (f) => r.reduce((s, x) => s + (x[f] || 0), 0);
      return {
        invanare: sum('rader').toLocaleString('sv-SE'),
        budget: sum('veckans').toLocaleString('sv-SE'),
        nojdhet: Math.round(r.reduce((s, x) => s + x.ciAndel, 0) / r.length * 100) + ' %',
        brander: String(r.filter((x) => x.ci === 'fel').length)
      };
    }, stadRepon);
    await expect(page.locator('#hud-invanare')).toHaveText(v.invanare);
    await expect(page.locator('#hud-budget')).toHaveText(v.budget);
    await expect(page.locator('#hud-nojdhet')).toHaveText(v.nojdhet);
    await expect(page.locator('#hud-brander')).toHaveText(v.brander);
    await expect(page.locator('#hud-brander')).toHaveClass(/varning/);
  });

  test('tryck på ett distrikt öppnar distriktskortet', { annotation: { type: 'testfall', description: 'TC-STA-03' } }, async ({ staden: page }) => {
    // Tryck på taket (marken i mitten kan skymmas av husen framför)
    const p = await page.evaluate(() => window.CsStad.takpunkt('jaktvind'));
    await page.touchscreen.tap(p.x, p.y);
    await expect(page.locator('#kort')).toBeVisible();
    await expect(page.locator('#kort-titel')).toHaveText('jaktvind');
    await expect(page.locator('#kort-zon')).toContainText('Bostadsområde');
    await expect(page.locator('#kort-siffror')).toContainText('Invånare');
    expect((await lage(page)).vald).toBe('jaktvind');
    // Distriktet flyttas fram så att det syns ovanför kortet
    const efter = await page.evaluate(() => window.CsStad.skarmpunkt('jaktvind'));
    const kortTopp = (await page.locator('#kort').boundingBox()).y;
    expect(efter.y).toBeLessThan(kortTopp);
    await bild(page, 'Distriktskort');

    await page.locator('#btn-stang').click();
    await expect(page.locator('#kort')).toBeHidden();
    expect((await lage(page)).vald).toBeNull();
  });

  test('rött bygge syns som brand och i nyhetsraden', { annotation: { type: 'testfall', description: 'TC-STA-04' } }, async ({ staden: page }) => {
    expect((await lage(page)).brander).toEqual(['elkoll']);
    // Brandkåren står vid huset som brinner
    expect((await lage(page)).brandbilar).toEqual(['elkoll']);
    await expect(page.locator('#ticker')).toHaveAttribute('data-typ', 'brand');
    await expect(page.locator('#ticker-text')).toContainText('Brand i elkoll! Brandkåren är på plats');
    await page.locator('#ticker').click();
    await expect(page.locator('#kort-titel')).toHaveText('elkoll');
    await expect(page.locator('#kort-siffror')).toContainText('Rött');
    await expect(page.locator('#kort-siffror')).toContainText('huset brinner');
    // Kortet visar också varför det brinner
    await expect(page.locator('#kort-brand')).toBeVisible();
    await expect(page.locator('#brand-workflow')).toContainText('Kör Playwright-testerna');
  });

  test('öppen PR, release och gamla repon syns i staden', { annotation: { type: 'testfall', description: 'TC-STA-05' } }, async ({ staden: page }) => {
    const l = await lage(page);
    expect(l.byggen).toEqual(['kaloriappen']);
    expect(l.torn.sort()).toEqual(['svampkartan', 'tillsatskoll']);
    expect(l.distrikt.find((d) => d.namn === 'appspec').gammal).toBe(true);
    expect(l.distrikt.find((d) => d.namn === 'jaktvind').gammal).toBe(false);
    // Fler issues ger fler bilar (trafik), och de kör åt olika håll på båda sorters vägar
    expect(l.bilar).toBeGreaterThan(l.distrikt.length);
    expect(l.bilRiktningar.sort()).toEqual(['i:-1', 'i:1', 'j:-1', 'j:1']);

    await page.getByRole('button', { name: 'appspec', exact: true }).focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#kort-status')).toContainText('distriktet står still, ingen commit på 2 månader');
    await expect(page.locator('#kort-status')).toContainText('Senaste commit för');
  });

  test('dra för att flytta staden och Centrera för att återställa', { annotation: { type: 'testfall', description: 'TC-STA-06' } }, async ({ staden: page }) => {
    const fore = (await lage(page)).kamera;
    await page.mouse.move(200, 420);
    await page.mouse.down();
    await page.mouse.move(150, 380, { steps: 5 });
    await page.mouse.move(120, 360, { steps: 5 });
    await page.mouse.up();
    const efter = (await lage(page)).kamera;
    expect(Math.round(efter.x)).toBe(Math.round(fore.x - 80));
    expect(Math.round(efter.y)).toBe(Math.round(fore.y - 60));
    await expect(page.locator('#kort')).toBeHidden();

    await page.locator('#btn-centrera').click();
    const tillbaka = (await lage(page)).kamera;
    expect(tillbaka.x).toBeCloseTo(fore.x, 1);
    expect(tillbaka.y).toBeCloseTo(fore.y, 1);
  });

  test('distrikten går att öppna med tangentbord och skärmläsare', { annotation: { type: 'testfall', description: 'TC-STA-07' } }, async ({ staden: page }) => {
    await page.getByRole('button', { name: 'virkesfynd', exact: true }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog', { name: 'virkesfynd' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#kort')).toBeHidden();
  });

  test('tryck på ett tak eller en skylt ger rätt distrikt', { annotation: { type: 'testfall', description: 'TC-STA-09' } }, async ({ staden: page }) => {
    // Höga hus täcker marken bakom sig. Ett tryck på taket ska ge husets eget distrikt,
    // inte distriktet vars mark ligger bakom (tidigare fel: 4 av 9 tak gav fel repo).
    const namn = stadRepon.map((r) => r.namn);
    const vy = page.viewportSize();
    let provade = 0;
    for (const n of namn) {
      const p = await page.evaluate((x) => window.CsStad.takpunkt(x), n);
      if (!p || p.x < 10 || p.x > vy.width - 10 || p.y < 10 || p.y > vy.height - 170) continue;
      await page.touchscreen.tap(p.x, p.y);
      await expect(page.locator('#kort-titel'), 'tak på ' + n).toHaveText(n);
      await page.locator('#btn-stang').click();
      await page.locator('#btn-centrera').click();
      provade++;
    }
    expect(provade).toBeGreaterThanOrEqual(5);
    // Samma sak med logiken direkt för alla distrikt, även de utanför skärmen
    const fel = await page.evaluate((alla) => alla
      .filter((n) => { const p = window.CsStad.takpunkt(n); return window.CsStad.distriktVid(p.x, p.y) !== n; }), namn);
    expect(fel).toEqual([]);
  });
});
