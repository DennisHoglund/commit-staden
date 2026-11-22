[← Testplan](../index.md)

# TC-STA-02 · HUD:en visar invånare, budget, nöjdhet och bränder

| | |
|---|---|
| **Område** | Staden |
| **Prioritet** | Hög |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md](../../SPEC.md) |
| **Playwright** | [`tests/stad.spec.js`](../../tests/stad.spec.js#L27) – *HUD:en visar invånare, budget, nöjdhet och bränder* |

## Förutsättningar

- Appen öppnad

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Titta på HUD:en | Invånare (rader kod), Budget (commits i veckan), Nöjdhet (andel gröna byggen) och Bränder visas |
| 2 | Titta på Bränder | Siffran är orange när något bygge är rött |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
