[← Testplan](../index.md)

# TC-STA-09 · Tryck på ett tak eller en skylt ger rätt distrikt

| | |
|---|---|
| **Område** | Staden |
| **Prioritet** | Hög |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md](../../SPEC.md) |
| **Playwright** | [`tests/stad.spec.js`](../../tests/stad.spec.js#L122) – *tryck på ett tak eller en skylt ger rätt distrikt* |

## Förutsättningar

- Appen öppnad, staden centrerad

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Tryck på taket på ett högt hus som skymmer ett distrikt bakom sig | Kortet för husets eget distrikt öppnas |
| 2 | Tryck på en namnskylt | Kortet för det distriktet öppnas |
| 3 | Tryck på marken (en tomt) i ett distrikt | Kortet för det distriktet öppnas |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
