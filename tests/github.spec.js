const { test, expect, bild, lage } = require('./hjalp');
const { ansluten, TOKEN } = require('./mock');

const sv = (n) => n.toLocaleString('sv-SE');

async function vantaPaStad(page, antal) {
  await page.waitForFunction((n) => window.CsStad && window.CsStad.klar && window.CsStad.lage().distrikt.length === n, antal);
}

test.describe('GitHub', () => {
  test('anslut med token bygger staden av mina repon', { annotation: { type: 'testfall', description: 'TC-GIT-01' } }, async ({ staden: page, api }) => {
    await expect(page.locator('#btn-konto')).toHaveText('Demo');
    await page.locator('#btn-github').click();
    await expect(page.getByRole('dialog', { name: 'Anslut GitHub' })).toBeVisible();
    await bild(page, 'Anslut GitHub');
    await page.locator('#token').fill(TOKEN);
    await page.getByRole('button', { name: 'Anslut', exact: true }).click();

    await vantaPaStad(page, 3);
    await expect(page.locator('#btn-konto')).toHaveText('testdennis');
    const l = await lage(page);
    expect(l.distrikt.map((d) => d.namn).sort()).toEqual(['alfa', 'beta', 'gamma']); // forken räknas inte
    expect(l.brander).toEqual(['beta']);
    expect(l.byggen).toEqual(['alfa']);
    expect(l.torn).toEqual(['alfa']);
    expect(l.distrikt.find((d) => d.namn === 'gamma').gammal).toBe(true);

    await expect(page.locator('#hud-invanare')).toHaveText(sv(3800));
    await expect(page.locator('#hud-budget')).toHaveText('12');
    await expect(page.locator('#hud-nojdhet')).toHaveText('50 %');
    await expect(page.locator('#hud-brander')).toHaveText('1');

    // Token sparas bara lokalt och syns inte kvar i sidan
    expect(await page.evaluate(() => localStorage.getItem('cs-token'))).toBe(TOKEN);
    await expect(page.locator('#token')).toHaveValue('');
    expect(await page.content()).not.toContain(TOKEN);
    expect(api.authHeaders.every((h) => h === 'Bearer ' + TOKEN)).toBe(true);
    await bild(page, 'Min stad');

    // Alfa: commits från Link-huvudet, issues utan PR, release
    await page.getByRole('button', { name: 'alfa' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#kort-siffror')).toContainText('120 commits');
    await expect(page.locator('#kort-siffror')).toContainText('trafikstockning');
    await expect(page.locator('#kort-status')).toContainText('landmärke v1.2');
    await expect(page.locator('#kort-repo')).toHaveAttribute('href', 'https://github.com/testdennis/alfa');
    await expect(page.locator('#kort-brand')).toBeHidden();
  });

  test('fel token ger tydligt fel och sparas inte', { annotation: { type: 'testfall', description: 'TC-GIT-02' } }, async ({ staden: page, api }) => {
    await page.locator('#btn-github').click();
    await page.locator('#token').fill('hej');
    await page.getByRole('button', { name: 'Anslut', exact: true }).click();
    await expect(page.locator('#token-msg')).toContainText('ser inte ut som en GitHub-token');
    expect(api.anrop.filter((a) => a.startsWith('/'))).toHaveLength(0);

    await page.locator('#token').fill('github_pat_FELFELFEL1234567');
    await page.getByRole('button', { name: 'Anslut', exact: true }).click();
    await expect(page.locator('#token-msg')).toContainText('GitHub godtar inte token');
    expect(await page.evaluate(() => localStorage.getItem('cs-token'))).toBeNull();
    await expect(page.locator('#btn-konto')).toHaveText('Demo');
  });

  test('Vad brinner? visar workflow, steg, fel och länk till körningen', { annotation: { type: 'testfall', description: 'TC-GIT-03' } }, async ({ page, api }) => {
    await ansluten(page);
    await page.goto('./');
    await vantaPaStad(page, 3);
    await expect(page.locator('#ticker-text')).toContainText('Brand i beta');
    await expect(page.locator('#ticker-text')).toContainText('Kör Playwright-testerna');
    await page.locator('#ticker').click();

    const brand = page.locator('#kort-brand');
    await expect(brand).toBeVisible();
    await expect(page.locator('#brand-workflow')).toHaveText('Tester · Testa och publicera › Kör Playwright-testerna');
    await expect(page.locator('#brand-fel li')).toHaveCount(1);
    await expect(page.locator('#brand-fel li')).toHaveText('inloggning.spec.js:12 › Fel lösenord: Expected "Fel lösenord", received ""');
    await expect(page.locator('#brand-commit')).toContainText('abc1234');
    await expect(page.locator('#brand-commit')).toContainText('Ny inloggning');
    await expect(page.locator('#brand-commit')).toContainText('testdennis');
    await expect(page.locator('#brand-commit')).toContainText('för 2 h sedan');
    await expect(page.locator('#brand-lank')).toHaveAttribute('href', 'https://github.com/testdennis/beta/actions/runs/77');
    await expect(page.locator('#kort-siffror')).toContainText('Rött');
    await bild(page, 'Vad brinner?');
  });

  test('staden visas från senaste hämtningen när GitHub inte nås', { annotation: { type: 'testfall', description: 'TC-GIT-04' } }, async ({ page, api }) => {
    await ansluten(page);
    await page.goto('./');
    await vantaPaStad(page, 3);
    await expect(page.locator('#btn-konto')).toHaveText('testdennis');

    api.nere = true;
    await page.reload();
    await vantaPaStad(page, 3);
    await expect(page.locator('#btn-konto')).toHaveText('testdennis');
    await expect(page.locator('#toast')).toContainText('Kunde inte nå GitHub');
    await expect(page.locator('#toast')).toContainText('Visar staden från');
    expect((await lage(page)).brander).toEqual(['beta']);
  });

  test('logga ut tar bort token och visar demostaden', { annotation: { type: 'testfall', description: 'TC-GIT-05' } }, async ({ page, api }) => {
    await ansluten(page);
    await page.goto('./');
    await vantaPaStad(page, 3);
    await page.locator('#btn-konto').click();
    await expect(page.getByRole('dialog', { name: 'Ditt GitHub' })).toBeVisible();
    await expect(page.locator('#gh-login')).toHaveText('testdennis');
    await expect(page.locator('#gh-status')).toContainText('3 distrikt');
    await page.getByRole('button', { name: 'Logga ut' }).click();

    const demo = await page.evaluate(() => window.CsDemo.repon.length);
    await vantaPaStad(page, demo);
    await expect(page.locator('#btn-konto')).toHaveText('Demo');
    expect(await page.evaluate(() => [localStorage.getItem('cs-token'), localStorage.getItem('cs-stad-cache')])).toEqual([null, null]);
    await page.reload();
    await vantaPaStad(page, demo);
    await expect(page.locator('#btn-konto')).toHaveText('Demo');
  });

  test('utgången token vid start visar demon och ber om ny token', { annotation: { type: 'testfall', description: 'TC-GIT-06' } }, async ({ page, api }) => {
    await page.addInitScript(() => { try { localStorage.setItem('cs-token', 'github_pat_GAMMALTOKEN12345'); } catch (e) {} });
    await page.goto('./');
    await expect(page.getByRole('dialog', { name: 'Anslut GitHub' })).toBeVisible();
    await expect(page.locator('#token-msg')).toContainText('Skapa en ny token');
    await expect(page.locator('#btn-konto')).toHaveText('Demo');
  });
});
