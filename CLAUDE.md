# Commit-staden – instruktioner för AI-assistenter

Läs `SPEC.md` för hela specifikationen. Det här är reglerna som gäller vid varje ändring.

## Projektet
- Privat PWA där Dennis GitHub-repon blir en isometrisk stad. En användare, används på iPhone.
- Ren HTML/CSS/JS **utan byggsteg**. Inga ramverk, ingen bundler, ingen Three.js. Staden ritas på canvas i `stad.js`.
- Data från GitHubs API. Ingen egen server och ingen Supabase.

## Språk och ton
- All UI-text, felmeddelanden, kommentarer, commit-meddelanden och testnamn på **svenska**.
- Kort och praktiskt.

## Får aldrig brytas
- GitHub-token sparas bara i telefonen (`localStorage`), aldrig i repot, i loggar eller i testrapporten.
- Token ska bara behöva läsrätt. Appen skriver aldrig till GitHub.
- Inga hemligheter i koden.

## Vid varje ändring
1. Höj `CACHE`-versionen i `sw.js` (`commit-staden-vN`) när appfiler ändras, och lägg nya filer i `SHELL`.
2. Nya JS-filer: lägg till `<script>` i `index.html` och i `SHELL`.
3. Kör testerna: `npx playwright test` (lokalt räcker `--project="Android (Chromium)"` om WebKit saknas).
4. Lägg till eller uppdatera tester i `tests/`. All extern trafik mockas i `tests/mock.js`.
   Använd `bild(page, 'Namn')` för skärmdumpar som ska synas i rapporten. Canvasen testas via `window.CsStad.lage()` och `skarmpunkt(namn)`.
5. Lägg till eller uppdatera testfall i `testplan/` (fil i `testfall/` + rad i `index.md`) och koppla automatiserade tester med
   `{ annotation: { type: 'testfall', description: 'TC-…' } }`. Kör `npm run testplan`.
6. Uppdatera `SPEC.md` (och `README.md` vid behov) så att den stämmer med koden.
7. Committa med beskrivande svenskt meddelande och pusha till `main`. CI testar och publicerar.

## Design
- Färgprofil **Natt**: svart/grönt mörkt läge och ljust dagläge via CSS-variabler i `styles.css`. Canvasens färger finns i `PALETT` i `stad.js`.
  Använd alltid variablerna, aldrig hårdkodade färger i CSS.
- Stora tryckytor (≥ 44 px), `env(safe-area-inset-*)` för iPhone, respektera `prefers-reduced-motion`.

## Kod
- Moduler som IIFE på `window` (`CsStad`, `CsDemo`).
- `localStorage` alltid i try/catch. Nycklar börjar med `cs-`.
- Escapa all text som hamnar i HTML (`esc()`).

## Tester och rapport
- Playwright på iPhone 14 (WebKit) och Pixel 7 (Chromium).
- Egen rapport: `tests/rapport-reporter.js` → https://dennishoglund.github.io/commit-staden/rapport/
- Ett rött test i WebKit men grönt i Chromium betyder oftast ett riktigt Safari-problem – fixa appen, inte testet.
