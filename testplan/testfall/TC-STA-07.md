[← Testplan](../index.md)

# TC-STA-07 · Distrikten går att öppna med tangentbord och skärmläsare

| | |
|---|---|
| **Område** | Staden |
| **Prioritet** | Låg |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md](../../SPEC.md) |
| **Playwright** | [`tests/stad.spec.js`](../../tests/stad.spec.js#L111) – *distrikten går att öppna med tangentbord och skärmläsare* |

## Förutsättningar

- VoiceOver påslaget (Inställningar › Hjälpmedel)

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Svep till listan **Distrikt i staden** | Varje repo läses upp som en knapp |
| 2 | Dubbeltryck på **virkesfynd** | Distriktskortet öppnas |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
