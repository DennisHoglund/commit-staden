[← Testplan](../index.md)

# TC-STA-04 · Rött bygge syns som brand och i nyhetsraden

| | |
|---|---|
| **Område** | Staden |
| **Prioritet** | Hög |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md](../../SPEC.md) |
| **Playwright** | [`tests/stad.spec.js`](../../tests/stad.spec.js#L64) – *rött bygge syns som brand och i nyhetsraden* |

## Förutsättningar

- Appen öppnad

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Leta upp distriktet **elkoll** | Ett hus brinner med flimrande lågor och rök |
| 2 | Titta på nyhetsraden ovanför verktygen | "Brand i elkoll! Bygget på main är rött" med orange prick |
| 3 | Tryck på nyhetsraden | Distriktskortet för elkoll öppnas och Bygget visar **Rött** |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
