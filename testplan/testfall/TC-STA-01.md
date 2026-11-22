[← Testplan](../index.md)

# TC-STA-01 · Demostaden ritas med ett distrikt per repo

| | |
|---|---|
| **Område** | Staden |
| **Prioritet** | Hög |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md](../../SPEC.md) |
| **Playwright** | [`tests/stad.spec.js`](../../tests/stad.spec.js#L4) – *demostaden ritas med ett distrikt per repo* |

## Förutsättningar

- Appen öppnad på telefonen

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Öppna Commit-staden | En isometrisk stad visas med vägar, hus och namnskyltar |
| 2 | Räkna namnskyltarna | En skylt per repo (9 i demon) |
| 3 | Titta i HUD:en uppe | Etiketten **Demo** visas |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
