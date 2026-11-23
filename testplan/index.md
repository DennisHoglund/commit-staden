# Testplan · Commit-staden

Testfall för Commit-staden som docs-as-code. Varje testfall har steg-för-steg-instruktioner så att det kan köras manuellt på telefonen.
Automatiserade testfall körs dessutom av Playwright vid varje commit och är kopplade via sitt ID.

| | |
|---|---|
| **Testfall** | 24 |
| **Automatiserade** | 20 (körs på iPhone/WebKit och Android/Chromium) |
| **Manuella** | 4 (kräver riktig iPhone, fingrar, skärmläsare eller riktigt GitHub-konto) |
| **Senaste testrapport** | [dennishoglund.github.io/commit-staden/rapport/](https://dennishoglund.github.io/commit-staden/rapport/) |
| **Krav** | [SPEC.md](../SPEC.md) |

**Typ:** 🤖 automatiserad · 🖐️ manuell  **Prioritet:** Hög = måste fungera, Medel = viktig, Låg = bekvämlighet

## Staden

| ID | Testfall | Prio | Typ |
|---|---|---|---|
| [TC-STA-01](testfall/TC-STA-01.md) | [Demostaden ritas med ett distrikt per repo](testfall/TC-STA-01.md) | Hög | 🤖 |
| [TC-STA-02](testfall/TC-STA-02.md) | [HUD:en visar invånare, budget, nöjdhet och bränder](testfall/TC-STA-02.md) | Hög | 🤖 |
| [TC-STA-03](testfall/TC-STA-03.md) | [Tryck på ett distrikt öppnar distriktskortet](testfall/TC-STA-03.md) | Hög | 🤖 |
| [TC-STA-04](testfall/TC-STA-04.md) | [Rött bygge syns som brand och i nyhetsraden](testfall/TC-STA-04.md) | Hög | 🤖 |
| [TC-STA-05](testfall/TC-STA-05.md) | [Öppen PR, release och gamla repon syns i staden](testfall/TC-STA-05.md) | Medel | 🤖 |
| [TC-STA-06](testfall/TC-STA-06.md) | [Dra för att flytta staden och Centrera för att återställa](testfall/TC-STA-06.md) | Medel | 🤖 |
| [TC-STA-07](testfall/TC-STA-07.md) | [Distrikten går att öppna med tangentbord och skärmläsare](testfall/TC-STA-07.md) | Låg | 🤖 |
| [TC-STA-08](testfall/TC-STA-08.md) | [Nyp för att zooma](testfall/TC-STA-08.md) | Medel | 🖐️ |

## GitHub

| ID | Testfall | Prio | Typ |
|---|---|---|---|
| [TC-GIT-01](testfall/TC-GIT-01.md) | [Anslut med token bygger staden av mina repon](testfall/TC-GIT-01.md) | Hög | 🤖 |
| [TC-GIT-02](testfall/TC-GIT-02.md) | [Fel token ger tydligt fel och sparas inte](testfall/TC-GIT-02.md) | Hög | 🤖 |
| [TC-GIT-03](testfall/TC-GIT-03.md) | [Vad brinner? visar workflow, steg, fel och länk till körningen](testfall/TC-GIT-03.md) | Hög | 🤖 |
| [TC-GIT-04](testfall/TC-GIT-04.md) | [Staden visas från senaste hämtningen när GitHub inte nås](testfall/TC-GIT-04.md) | Medel | 🤖 |
| [TC-GIT-05](testfall/TC-GIT-05.md) | [Logga ut tar bort token och visar demostaden](testfall/TC-GIT-05.md) | Medel | 🤖 |
| [TC-GIT-06](testfall/TC-GIT-06.md) | [Utgången token vid start visar demon och ber om ny token](testfall/TC-GIT-06.md) | Medel | 🤖 |
| [TC-GIT-07](testfall/TC-GIT-07.md) | [Skapa token på iPhone och anslut](testfall/TC-GIT-07.md) | Hög | 🖐️ |

## Väder och utryckning

| ID | Testfall | Prio | Typ |
|---|---|---|---|
| [TC-VAD-01](testfall/TC-VAD-01.md) | [Vädret visar hur byggena mår](testfall/TC-VAD-01.md) | Medel | 🤖 |

## Sök och taxi

| ID | Testfall | Prio | Typ |
|---|---|---|---|
| [TC-TAX-01](testfall/TC-TAX-01.md) | [Sök och åk taxi till ett distrikt](testfall/TC-TAX-01.md) | Hög | 🤖 |
| [TC-TAX-02](testfall/TC-TAX-02.md) | [Sök utan träff säger det, och Enter åker till första träffen](testfall/TC-TAX-02.md) | Låg | 🤖 |

## Tema och design

| ID | Testfall | Prio | Typ |
|---|---|---|---|
| [TC-TEM-01](testfall/TC-TEM-01.md) | [Temaknappen växlar och sparar valet](testfall/TC-TEM-01.md) | Medel | 🤖 |
| [TC-TEM-02](testfall/TC-TEM-02.md) | [Mörkt nattläge följer telefonen](testfall/TC-TEM-02.md) | Medel | 🤖 |
| [TC-TEM-03](testfall/TC-TEM-03.md) | [Ljust läge ger dagstaden](testfall/TC-TEM-03.md) | Låg | 🤖 |

## Installation och uppdatering

| ID | Testfall | Prio | Typ |
|---|---|---|---|
| [TC-PWA-01](testfall/TC-PWA-01.md) | [Installera på hemskärmen](testfall/TC-PWA-01.md) | Hög | 🖐️ |
| [TC-PWA-02](testfall/TC-PWA-02.md) | [Ny version laddas automatiskt](testfall/TC-PWA-02.md) | Medel | 🖐️ |
| [TC-PWA-03](testfall/TC-PWA-03.md) | [Manifest, ikoner och service worker finns](testfall/TC-PWA-03.md) | Medel | 🤖 |

## Så lägger du till ett testfall

1. Skapa `testfall/TC-<OMRÅDE>-<NR>.md` (kopiera ett befintligt).
2. Lägg till raden i tabellen ovan.
3. Om det automatiseras: ge Playwright-testet annotationen `{ annotation: { type: 'testfall', description: 'TC-…' } }`.
   ID:t visas då i testrapporten med länk hit, och CI kontrollerar att varje ID finns som fil.
