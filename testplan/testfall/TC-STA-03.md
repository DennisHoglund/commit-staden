[← Testplan](../index.md)

# TC-STA-03 · Tryck på ett distrikt öppnar distriktskortet

| | |
|---|---|
| **Område** | Staden |
| **Prioritet** | Hög |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md](../../SPEC.md) |
| **Playwright** | [`tests/stad.spec.js`](../../tests/stad.spec.js#L44) – *tryck på ett distrikt öppnar distriktskortet* |

## Förutsättningar

- Appen öppnad

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Tryck på distriktet **jaktvind** | Ett kort glider upp med namn, zon och statistik |
| 2 | Titta på staden | Övriga distrikt är nedtonade |
| 3 | Tryck på krysset | Kortet stängs och staden blir normal igen |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
