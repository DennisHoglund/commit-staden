[← Testplan](../index.md)

# TC-GIT-03 · Vad brinner? visar workflow, steg, fel och länk till körningen

| | |
|---|---|
| **Område** | GitHub |
| **Prioritet** | Hög |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md avsnitt 5](../../SPEC.md) |
| **Playwright** | [`tests/github.spec.js`](../../tests/github.spec.js#L64) – *Vad brinner? visar workflow, steg, fel och länk till körningen* |

## Förutsättningar

- Ansluten
- Ett repo har rött bygge på main

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Tryck på nyhetsraden "Brand i …" | Distriktskortet öppnas med rutan **Vad brinner?** |
| 2 | Läs rutan | Workflow, jobb och steg som föll, felmeddelanden från testerna och vilken commit som orsakade det |
| 3 | Tryck **Öppna körningen på GitHub** | Körningen öppnas på GitHub |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
