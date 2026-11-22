# Commit-staden – specifikation

## 1. Syfte
En PWA för iPhone där Dennis GitHub-repon blir en levande isometrisk stad i stadsbyggarstil.
Varje repo är ett distrikt, och det som händer i repot syns i staden: commits bygger hus, rött bygge ger brand,
öppna PR blir byggarbetsplatser, issues blir trafik och repon som står still växer igen.

## 2. Stack
- Ren HTML/CSS/JS utan byggsteg. Moduler som IIFE på `window` (`CsStad`, `CsDemo`).
- Staden ritas på `<canvas>` i 2D-isometri (ingen Three.js) för att vara lätt och snabb på iPhone.
- Typsnitt: Geist, Geist Mono och Silkscreen från Google Fonts (cachas av service workern).
- Data från GitHubs API med en token som bara får läsa (steg 2). Ingen egen server, ingen Supabase.
- GitHub Pages via Actions, Playwright-tester med egen rapport.

## 3. Design
### 3.1 Färgprofil "Natt"
- Mörkt läge (natt): svart bakgrund, mörkgröna hus med tända gröna fönster, accent `#3DFF8A`.
- Ljust läge (dag): ljusgrön bakgrund `#DCEBE0`, gräs och dagsljusfärger, accent `#1E7A45`.
- Temaknappen växlar Auto → Ljust → Mörkt och sparas i `cs-theme`. Auto följer telefonen.
- Glasytor (HUD, nyhetsrad, verktyg, distriktskort) med `backdrop-filter`.

### 3.2 Skärmen
- **HUD** överst: Invånare, Budget, Nöjdhet, Bränder, datum och antal distrikt. Etiketten Demo tills riktiga repon används.
- **Staden** fyller skärmen. Dra för att flytta, nyp (två fingrar) eller scrolla för att zooma.
- **Nyhetsrad** ovanför verktygen visar händelser, en i taget var 6:e sekund. Tryck öppnar distriktet.
- **Verktyg**: Centrera och Tema.
- **Distriktskort** glider upp vid tryck på ett distrikt. Övriga distrikt tonas ned och kameran flyttar distriktet ovanför kortet.
- Dold lista med alla distrikt som knappar för skärmläsare och tangentbord. Escape stänger kortet.

## 4. Spelregler (GitHub → stad)
| I staden | Från repot |
|---|---|
| Distrikt (4×4 tomter) | ett repo, sorterade efter antal commits |
| Byggnader | en per 10 commits (max 16), högst i mitten |
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

## 5. Datamodell (ett repo)
```js
{ namn, sprak, commits, rader, veckans, ci: 'ok'|'fel'|'pagar'|'', ciAndel, prOppna, issues, senast: ISO, release }
```
`demo.js` innehåller påhittade värden tills GitHub-hämtningen finns.

## 6. Offline
Service workern: appfiler nätet först (cache vid offline), typsnitt cache först, `/rapport/` ignoreras.
Höj `CACHE` i `sw.js` vid varje ändring.

## 7. Tester
Playwright på iPhone 14 (WebKit) och Pixel 7 (Chromium), sv-SE, Europe/Stockholm, `serviceWorkers: 'block'`.
All extern trafik mockas i `tests/mock.js`. `window.CsStad.lage()` och `skarmpunkt(namn)` används för att testa canvasen.
Testplan i `testplan/` (docs-as-code). Rapport: https://dennishoglund.github.io/commit-staden/rapport/

## 8. Beslut
- 2D-isometri på canvas i stället för Three.js: lättare, snabbare på telefon och passar pixelkänslan.
- Ingen Supabase: allt kommer från GitHub och token sparas bara lokalt i telefonen.
- Inspiration från Git City, GitCity, Repolis, RepoVerse och CodeCity, men simuleringen (händelser som spelmekanik) är egen.

## 9. Kvar att göra
1. ~~Steg 1: PWA-skal, demostad, tester och CI~~
2. Steg 2: inloggning med GitHub-token (bara läsrätt), hämta riktiga repon, cacha lokalt.
3. Steg 3: staden från riktiga data (commits, språk, rader).
4. Steg 4: händelser från Actions, PR, issues och releaser.
5. Steg 5: tidslinje – spola upp historiken och se staden växa.
6. Senare: zooma in i ett distrikt (mappar som kvarter), fler teman, SVG till README, LED-matrisen 64×32.
