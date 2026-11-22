[← Testplan](../index.md)

# TC-GIT-06 · Utgången token vid start visar demon och ber om ny token

| | |
|---|---|
| **Område** | GitHub |
| **Prioritet** | Medel |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md avsnitt 5](../../SPEC.md) |
| **Playwright** | [`tests/github.spec.js`](../../tests/github.spec.js#L125) – *utgången token vid start visar demon och ber om ny token* |

## Förutsättningar

- Token har gått ut eller dragits tillbaka på GitHub

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Öppna appen | Kortet **Anslut GitHub** öppnas med meddelandet "Skapa en ny token och anslut igen" |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
