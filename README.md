# Commit-staden

Dina GitHub-repon som en levande stad. Varje repo är ett distrikt: commits bygger hus, rött bygge ger brand,
öppna PR blir byggarbetsplatser och issues blir trafik.

- **Appen:** https://dennishoglund.github.io/commit-staden/
- **Testrapport:** https://dennishoglund.github.io/commit-staden/rapport/
- **Specifikation:** [SPEC.md](SPEC.md) · **Testplan:** [testplan/index.md](testplan/index.md)

Utan anslutning visas en demostad. Tryck **GitHub** och klistra in en fine-grained token med läsrätt så byggs staden av dina riktiga repon.

## Kom igång
```bash
npm ci
npx playwright install webkit chromium
npx playwright test          # kör testerna
npx http-server . -p 4173    # starta appen lokalt
```

## Filer
| Fil | Innehåll |
|---|---|
| `index.html` | Skalet: HUD, canvas, nyhetsrad, verktyg och distriktskort |
| `styles.css` | Färgprofil Natt med ljust och mörkt läge |
| `stad.js` | Bygger och ritar den isometriska staden (`window.CsStad`) |
| `app.js` | Tema, GitHub-anslutning, HUD, nyhetsrad och distriktskort |
| `github.js` | Hämtar repon, Actions och brandorsak från GitHubs API (`window.CsGithub`) |
| `demo.js` | Demodata (`window.CsDemo`) |
| `sw.js` | Service worker för offline |
| `tests/` | Playwright-tester, mockar och egen rapport |
| `testplan/` | Testfall som docs-as-code |

## Tester
Playwright kör på iPhone 14 (WebKit) och Pixel 7 (Chromium) vid varje push till `main`.
Rapporten publiceras på GitHub Pages tillsammans med appen.
