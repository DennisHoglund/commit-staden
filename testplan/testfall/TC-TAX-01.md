[← Testplan](../index.md)

# TC-TAX-01 · Sök och åk taxi till ett distrikt

| | |
|---|---|
| **Område** | Sök och taxi |
| **Prioritet** | Hög |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md](../../SPEC.md) |
| **Playwright** | [`tests/vader-taxi.spec.js`](../../tests/vader-taxi.spec.js#L27) – *sök och åk taxi till ett distrikt* |

## Förutsättningar

- Appen öppnad

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Tryck **Sök** i verktygsraden | Kortet **Sök i staden** visas med repon |
| 2 | Skriv **elk** | Bara elkoll visas, med status "brinner" |
| 3 | Tryck på elkoll | En gul taxi kör längs vägen till distriktet och kameran följer med |
| 4 | Vänta tills taxin är framme | Distriktskortet för elkoll öppnas |
| 5 | Stäng kortet | Taxin försvinner |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
