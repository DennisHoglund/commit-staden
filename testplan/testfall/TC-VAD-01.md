[← Testplan](../index.md)

# TC-VAD-01 · Vädret visar hur byggena mår

| | |
|---|---|
| **Område** | Väder och utryckning |
| **Prioritet** | Medel |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md](../../SPEC.md) |
| **Playwright** | [`tests/vader-taxi.spec.js`](../../tests/vader-taxi.spec.js#L6) – *vädret visar hur byggena mår* |

## Förutsättningar

- Appen öppnad

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Titta på himlen och HUD:en när inget bygge är rött | Klart: stjärnor och måne på natten, sol på dagen. HUD:en säger **Klart** |
| 2 | Med ett rött bygge | Moln och duggregn, HUD:en säger **Mulet** |
| 3 | Med två eller fler röda byggen | Mörka moln, regn och blixt, HUD:en säger **Åska** |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
