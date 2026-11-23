[← Testplan](../index.md)

# TC-TAX-02 · Sök utan träff säger det, och Enter åker till första träffen

| | |
|---|---|
| **Område** | Sök och taxi |
| **Prioritet** | Låg |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md](../../SPEC.md) |
| **Playwright** | [`tests/vader-taxi.spec.js`](../../tests/vader-taxi.spec.js#L51) – *sök utan träff säger det, och Enter åker till första träffen* |

## Förutsättningar

- Appen öppnad

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Sök på **zzz** | "Inga repon matchar." |
| 2 | Sök på **jakt** och tryck Retur/Gå | Taxin kör till jaktvind och kortet öppnas |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
