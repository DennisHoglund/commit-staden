[← Testplan](../index.md)

# TC-GIT-02 · Fel token ger tydligt fel och sparas inte

| | |
|---|---|
| **Område** | GitHub |
| **Prioritet** | Hög |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md avsnitt 5](../../SPEC.md) |
| **Playwright** | [`tests/github.spec.js`](../../tests/github.spec.js#L69) – *fel token ger tydligt fel och sparas inte* |

## Förutsättningar

- Inte ansluten

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Skriv något som inte är en token och tryck **Anslut** | "Det ser inte ut som en GitHub-token" och inget skickas |
| 2 | Klistra in en ogiltig token | "GitHub godtar inte token…" och knappen uppe till höger visar fortfarande **Anslut** |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
