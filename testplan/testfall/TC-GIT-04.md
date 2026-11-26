[← Testplan](../index.md)

# TC-GIT-04 · Staden visas från senaste hämtningen när GitHub inte nås

| | |
|---|---|
| **Område** | GitHub |
| **Prioritet** | Medel |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md avsnitt 5](../../SPEC.md) |
| **Playwright** | [`tests/github.spec.js`](../../tests/github.spec.js#L106) – *staden visas från senaste hämtningen när GitHub inte nås* |

## Förutsättningar

- Ansluten och staden hämtad minst en gång

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Slå på flygplansläge | – |
| 2 | Öppna appen | Din stad visas direkt och ett meddelande säger "Kunde inte nå GitHub. Visar staden från hh:mm" |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
