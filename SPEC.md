# Commit-staden – specifikation

## 1. Syfte
En PWA för iPhone där Dennis GitHub-repon blir en levande isometrisk stad i stadsbyggarstil.
Varje repo är ett distrikt, och det som händer i repot syns i staden: commits bygger hus, rött bygge ger brand,
öppna PR blir byggarbetsplatser, issues blir trafik och repon som står still växer igen.

## 2. Stack
- Ren HTML/CSS/JS utan byggsteg. Moduler som IIFE på `window` (`CsStad`, `CsGithub`, `CsDemo`).
- Staden ritas på `<canvas>` i 2D-isometri (ingen Three.js) för att vara lätt och snabb på iPhone.
- Typsnitt: Geist, Geist Mono och Silkscreen från Google Fonts (cachas av service workern).
- Data från GitHubs REST-API direkt från telefonen med en fine-grained token som bara får läsa. Ingen egen server, ingen Supabase.
- GitHub Pages via Actions, Playwright-tester med egen rapport.

## 3. Design
### 3.1 Färgprofil "Natt"
- Mörkt läge (natt): svart bakgrund, mörkgröna hus med tända gröna fönster, accent `#3DFF8A`.
- Ljust läge (dag): ljusgrön bakgrund `#DCEBE0`, gräs och dagsljusfärger, accent `#1E7A45`.
- Temaknappen växlar Auto → Ljust → Mörkt och sparas i `cs-theme`. Auto följer telefonen.
- Glasytor (HUD, nyhetsrad, verktyg, distriktskort) med `backdrop-filter`.

### 3.2 Skärmen
- **HUD** överst: Invånare, Budget, Nöjdhet, Bränder, datum och antal distrikt. Knappen uppe till höger visar **Demo** eller ditt GitHub-namn och öppnar GitHub-kortet.
- **Staden** fyller skärmen: Centrera visar hela höjden och låter kanterna gå utanför på bredden (högst 1,5 gånger skärmbredden). Dra för att flytta, nyp (två fingrar) eller scrolla för att zooma.
- **Nyhetsrad** ovanför verktygen visar händelser, en i taget var 6:e sekund. Tryck öppnar distriktet.
- **Verktyg**: Centrera, GitHub och Tema.
- **GitHub-kort**: anslut med token (med instruktion för att skapa en), eller Uppdatera/Logga ut när man är ansluten.
- **Vad brinner?** i distriktskortet när bygget är rött: workflow, jobb och steg som föll, felmeddelanden (annoteringar), commit, vem och när, samt länk till körningen.
- **Toast** under HUD:en för kvitton och fel.
- **Distriktskort** glider upp vid tryck på ett distrikt. Övriga distrikt tonas ned och kameran flyttar distriktet ovanför kortet.
- Dold lista med alla distrikt som knappar för skärmläsare och tangentbord. Escape stänger kortet.

## 4. Spelregler (GitHub → stad)
| I staden | Från repot |
|---|---|
| Distrikt (4×4 tomter) | ett repo, sorterade efter antal commits |
| Byggnader | en per 10 commits, minst 3 och högst 16, högst hus i mitten |
| Höjd | växer med antal commits |
| Zon och färg | språk: JS/TS = bostäder (grönt), HTML/CSS = centrum (turkos), C#/Java/Python m.fl. = industri (gult), annat = blandat (grått) |
| Torn med blinkande topp | release finns |
| Byggarbetsplats med kran | öppen PR |
| Brand med rök | senaste bygget på main är rött |
| Bilar | trafik, fler vid öppna issues (stockning från 3) |
| Grått distrikt med träd | ingen commit på 45 dagar (växer igen) |
| Invånare (HUD) | rader kod totalt |
| Budget (HUD) | commits i veckan |
| Nöjdhet (HUD) | andel gröna byggen |
| Bränder (HUD) | antal repon med rött bygge |

## 5. GitHub
### 5.1 Token
- Fine-grained personal access token, Repository access **All repositories**, Read-only för **Actions**, **Contents**, **Issues** och **Pull requests** (Metadata följer med).
- Sparas bara i telefonen (`cs-token`). Börjar med `github_pat_` eller `ghp_`, annat stoppas innan något skickas.
- 401 vid start: token och cache tas bort, demon visas och GitHub-kortet ber om ny token.

### 5.2 Hämtning (`github.js`)
`/user` och `/user/repos?affiliation=owner&sort=pushed` (forkar räknas inte, max 30 repon). Per repo, högst 6 repon samtidigt:
| Uppgift | Anrop |
|---|---|
| Commits | `/commits?per_page=1` – antal från Link-huvudets `rel="last"` |
| Veckans commits | `/commits?since=<7 dagar>` |
| Rader kod | `/languages` – byte delat med 35 (ungefär) |
| Öppna PR | `/pulls?state=open`; issues = `open_issues_count` minus PR |
| Release | `/releases/latest` (404 = ingen) |
| Bygget | `/actions/runs?branch=<standardgren>`: senaste avslutade körning per workflow. Rött om någon är `failure`/`timed_out`. Nöjdhet = andel `success` av de 30 senaste. |
| Vad brinner? | `/actions/runs/{id}/jobs` (jobb och steg som föll) och `/check-runs/{jobb}/annotations` (felnivå, max 4, "Process completed with exit code" filtreras bort) |

Resultatet sparas i `cs-stad-cache` och visas direkt vid nästa start medan ny hämtning pågår.
Hämtas igen när appen öppnas efter mer än 5 minuter, eller med **Uppdatera**.

### 5.3 Datamodell (ett repo)
```js
{ namn, sprak, commits, rader, veckans, ci: 'ok'|'fel'|'pagar'|'', ciAndel, prOppna, issues, senast: ISO, release, url,
  brand: { workflow, steg: [], fel: [], sha, meddelande, vem, tid, url } }
```
`demo.js` har påhittade värden (även en brand i elkoll) som visas när man inte är ansluten.

### 5.4 Tips
Lägg till Playwrights `github`-reporter i CI i dina andra repon (som här), så blir varje fallerat test en annotering som syns i **Vad brinner?**.

## 6. Offline
Service workern: appfiler nätet först (cache vid offline), typsnitt cache först, GitHub-API:t går alltid till nätet, `/rapport/` ignoreras.
Utan nät visas staden från senaste hämtningen med ett meddelande.
Höj `CACHE` i `sw.js` vid varje ändring.

## 7. Tester
Playwright på iPhone 14 (WebKit) och Pixel 7 (Chromium), sv-SE, Europe/Stockholm, `serviceWorkers: 'block'`.
All extern trafik mockas i `tests/mock.js`, där GitHubs API är en fejkad server med tre repon (ett grönt med PR och release, ett rött, ett gammalt) och en fork. `window.CsStad.lage()` och `skarmpunkt(namn)` används för att testa canvasen.
Testplan i `testplan/` (docs-as-code). Rapport: https://dennishoglund.github.io/commit-staden/rapport/

## 8. Beslut
- 2D-isometri på canvas i stället för Three.js: lättare, snabbare på telefon och passar pixelkänslan.
- Ingen Supabase: allt kommer från GitHub och token sparas bara lokalt i telefonen.
- Inspiration från Git City, GitCity, Repolis, RepoVerse och CodeCity, men simuleringen (händelser som spelmekanik) är egen.

## 9. Kvar att göra
1. ~~Steg 1: PWA-skal, demostad, tester och CI~~
2. ~~Steg 2: GitHub-token, riktiga repon, cache, Vad brinner?~~ (steg 3 och 4 ingick)
3. Steg 3: tidslinje – spola upp historiken och se staden växa.
4. Senare: zooma in i ett distrikt (mappar som kvarter), fler teman, SVG till README, LED-matrisen 64×32.
