[← Testplan](../index.md)

# TC-TEM-01 · Temaknappen växlar och sparar valet

| | |
|---|---|
| **Område** | Tema och design |
| **Prioritet** | Medel |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md](../../SPEC.md) |
| **Playwright** | [`tests/tema.spec.js`](../../tests/tema.spec.js#L5) – *temaknappen växlar Auto → Ljust → Mörkt och sparar valet* |

## Förutsättningar

- Appen öppnad

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Tryck på temaknappen i verktygsraden | Texten blir **Ljust** och staden blir dagstad |
| 2 | Tryck igen | **Mörkt** – nattstaden i svart och grönt |
| 3 | Stäng och öppna appen | Mörkt läge är kvar |
| 4 | Tryck igen | **Auto** – följer telefonen |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
