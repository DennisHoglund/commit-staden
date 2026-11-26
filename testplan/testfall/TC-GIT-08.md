[← Testplan](../index.md)

# TC-GIT-08 · Utan token visas ingen påhittad stad, bara Anslut GitHub

| | |
|---|---|
| **Område** | GitHub |
| **Prioritet** | Hög |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md avsnitt 5](../../SPEC.md) |
| **Playwright** | [`tests/github.spec.js`](../../tests/github.spec.js#L11) – *utan token visas ingen påhittad stad, bara Anslut GitHub* |

## Förutsättningar

- Ingen token sparad i telefonen (första start eller efter Logga ut)

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Öppna appen | Kortet **Anslut GitHub** öppnas direkt, knappen uppe till höger visar **Anslut** |
| 2 | Titta på staden | Inga distrikt och inga bränder, ingen påhittad data |
| 3 | Stäng kortet | Nyhetsraden säger att du ska trycka Anslut och lägga in en token |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
