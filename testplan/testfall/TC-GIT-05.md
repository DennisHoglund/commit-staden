[← Testplan](../index.md)

# TC-GIT-05 · Logga ut tar bort token och tömmer staden

| | |
|---|---|
| **Område** | GitHub |
| **Prioritet** | Medel |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md avsnitt 5](../../SPEC.md) |
| **Playwright** | [`tests/github.spec.js`](../../tests/github.spec.js#L121) – *logga ut tar bort token och tömmer staden* |

## Förutsättningar

- Ansluten

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Tryck på ditt GitHub-namn uppe till höger | Kortet **Ditt GitHub** visar namn och när staden uppdaterades |
| 2 | Tryck **Logga ut** | Staden töms, knappen visar **Anslut** och token är borttagen från telefonen |
| 3 | Stäng och öppna appen | Tom stad och **Anslut GitHub** öppnas |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
