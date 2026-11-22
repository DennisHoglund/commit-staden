[← Testplan](../index.md)

# TC-GIT-01 · Anslut med token bygger staden av mina repon

| | |
|---|---|
| **Område** | GitHub |
| **Prioritet** | Hög |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md avsnitt 5](../../SPEC.md) |
| **Playwright** | [`tests/github.spec.js`](../../tests/github.spec.js#L11) – *anslut med token bygger staden av mina repon* |

## Förutsättningar

- En fine-grained token med läsrätt (se TC-GIT-07)

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Tryck på **GitHub** i verktygsraden | Kortet **Anslut GitHub** visas |
| 2 | Klistra in token och tryck **Anslut** | Nyhetsraden visar "Hämtar dina repon… N av M" |
| 3 | Vänta tills hämtningen är klar | Staden byggs om med ett distrikt per eget repo (forkar räknas inte) och ditt GitHub-namn visas uppe till höger |
| 4 | Tryck på ett distrikt | Commits, språk, PR, issues och release stämmer med GitHub |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
