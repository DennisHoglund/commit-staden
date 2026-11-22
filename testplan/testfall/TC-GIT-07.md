[← Testplan](../index.md)

# TC-GIT-07 · Skapa token på iPhone och anslut

| | |
|---|---|
| **Område** | GitHub |
| **Prioritet** | Hög |
| **Typ** | 🖐️ Manuell |
| **Krav** | [SPEC.md avsnitt 5](../../SPEC.md) |

## Förutsättningar

- Inloggad på github.com i Safari

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | I appen: tryck **GitHub** › **Så skapar du en token** › länken | GitHubs sida för ny fine-grained token öppnas |
| 2 | Namn **Commit-staden**, Expiration 1 år, Repository access **All repositories** | – |
| 3 | Permissions: **Actions**, **Contents**, **Issues**, **Pull requests** = Read-only | Metadata blir Read-only av sig själv |
| 4 | **Generate token**, kopiera | Token börjar med github_pat_ |
| 5 | Tillbaka i appen: klistra in och **Anslut** | Din riktiga stad byggs |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
