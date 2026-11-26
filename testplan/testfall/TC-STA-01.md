[← Testplan](../index.md)

# TC-STA-01 · Staden ritas med ett distrikt per repo

| | |
|---|---|
| **Område** | Staden |
| **Prioritet** | Hög |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md](../../SPEC.md) |
| **Playwright** | [`tests/stad.spec.js`](../../tests/stad.spec.js#L4) – *staden ritas med ett distrikt per repo* |

## Förutsättningar

- Ansluten till GitHub

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Öppna Commit-staden | En isometrisk stad visas med vägar, hus och namnskyltar |
| 2 | Räkna namnskyltarna | En skylt per repo (forkar räknas inte) |
| 3 | Titta i HUD:en uppe | Ditt GitHub-namn visas |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
