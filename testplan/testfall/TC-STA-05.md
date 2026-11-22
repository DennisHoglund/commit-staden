[← Testplan](../index.md)

# TC-STA-05 · Öppen PR, release och gamla repon syns i staden

| | |
|---|---|
| **Område** | Staden |
| **Prioritet** | Medel |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md](../../SPEC.md) |
| **Playwright** | [`tests/stad.spec.js`](../../tests/stad.spec.js#L77) – *öppen PR, release och gamla repon syns i staden* |

## Förutsättningar

- Appen öppnad

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Titta på **kaloriappen** | En byggarbetsplats med kran (öppen PR) |
| 2 | Titta på **svampkartan** och **tillsatskoll** | Ett högt torn med blinkande topp (release) |
| 3 | Titta på **appspec** | Grått distrikt med många träd. Kortet säger "står still, ingen commit på 2 månader" (över 1 år: "övergivet") |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
