// Appens skal: tema, HUD, nyhetsrad och distriktskort.
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const THEME_KEY = 'cs-theme';

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} }
  };

  const tal = (n) => Number(n || 0).toLocaleString('sv-SE');
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function dagarSedan(iso) {
    const t = Date.parse(iso);
    return isNaN(t) ? null : Math.floor((Date.now() - t) / 86400000);
  }
  function nar(iso) {
    const d = dagarSedan(iso);
    if (d == null) return '–';
    if (d <= 0) return 'i dag';
    if (d === 1) return 'i går';
    return 'för ' + d + ' dagar sedan';
  }

  // ---------- Tema ----------
  const THEMES = ['auto', 'light', 'dark'];
  const THEME_LABELS = { auto: 'Auto', light: 'Ljust', dark: 'Mörkt' };
  const ljusQuery = window.matchMedia('(prefers-color-scheme: light)');

  function currentTheme() {
    const t = store.get(THEME_KEY);
    return THEMES.includes(t) ? t : 'auto';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    $('theme-label').textContent = THEME_LABELS[theme];
    const ljust = theme === 'light' || (theme === 'auto' && ljusQuery.matches);
    document.querySelector('meta[name="theme-color"]').setAttribute('content', ljust ? '#DCEBE0' : '#000000');
    window.CsStad.sattTema(ljust ? 'light' : 'dark');
  }

  $('btn-theme').addEventListener('click', () => {
    const next = THEMES[(THEMES.indexOf(currentTheme()) + 1) % THEMES.length];
    if (next === 'auto') store.del(THEME_KEY); else store.set(THEME_KEY, next);
    applyTheme(next);
  });
  ljusQuery.addEventListener('change', () => applyTheme(currentTheme()));

  // ---------- Data ----------
  const repon = (window.CsDemo && window.CsDemo.repon) || [];
  const perNamn = new Map(repon.map((r) => [r.namn, r]));

  // ---------- HUD ----------
  function hud() {
    const sum = (f) => repon.reduce((s, r) => s + (r[f] || 0), 0);
    const andelar = repon.filter((r) => typeof r.ciAndel === 'number');
    const nojd = andelar.length ? Math.round(andelar.reduce((s, r) => s + r.ciAndel, 0) / andelar.length * 100) : null;
    const brander = repon.filter((r) => r.ci === 'fel').length;
    $('hud-invanare').textContent = tal(sum('rader'));
    $('hud-budget').textContent = tal(sum('veckans'));
    $('hud-nojdhet').textContent = nojd == null ? '–' : nojd + ' %';
    $('hud-brander').textContent = String(brander);
    $('hud-brander').classList.toggle('varning', brander > 0);
    const d = new Date();
    $('hud-datum').textContent = d.toLocaleDateString('sv-SE', { weekday: 'short', day: 'numeric', month: 'short' }) + ' · ' + repon.length + ' distrikt';
  }

  // ---------- Händelser till nyhetsraden ----------
  function handelser() {
    const h = [];
    repon.forEach((r) => {
      const d = dagarSedan(r.senast);
      if (r.ci === 'fel') h.push({ typ: 'brand', namn: r.namn, text: 'Brand i ' + r.namn + '! Bygget på main är rött' });
      if (r.prOppna) h.push({ typ: 'bygge', namn: r.namn, text: 'Byggstart i ' + r.namn + ': ' + r.prOppna + ' öppen PR' });
      if (r.release) h.push({ typ: 'torn', namn: r.namn, text: 'Nytt landmärke i ' + r.namn + ': ' + r.release });
      if ((r.issues || 0) >= 3) h.push({ typ: 'trafik', namn: r.namn, text: 'Trafikstockning i ' + r.namn + ': ' + r.issues + ' öppna issues' });
      if (d != null && d > 45) h.push({ typ: 'gammal', namn: r.namn, text: r.namn + ' växer igen, ingen commit på ' + d + ' dagar' });
    });
    const snabbast = [...repon].sort((a, b) => (b.veckans || 0) - (a.veckans || 0))[0];
    if (snabbast && snabbast.veckans) h.push({ typ: 'vaxer', namn: snabbast.namn, text: snabbast.namn + ' växer snabbast: ' + snabbast.veckans + ' commits i veckan' });
    const ordning = { brand: 0, trafik: 1, bygge: 2, torn: 3, vaxer: 4, gammal: 5 };
    return h.sort((a, b) => ordning[a.typ] - ordning[b.typ]);
  }

  let tickerIndex = 0;
  let tickerLista = [];
  function visaTicker() {
    if (!tickerLista.length) { $('ticker').hidden = true; return; }
    const e = tickerLista[tickerIndex % tickerLista.length];
    $('ticker').hidden = false;
    $('ticker').dataset.typ = e.typ;
    $('ticker').dataset.namn = e.namn;
    $('ticker-text').textContent = e.text;
    $('ticker').setAttribute('aria-label', e.text + '. Visa distriktet.');
  }
  $('ticker').addEventListener('click', () => oppna($('ticker').dataset.namn));

  // ---------- Distriktskort ----------
  function oppna(namn) {
    const r = perNamn.get(namn);
    if (!r) { stang(); return; }
    const zon = window.CsStad.ZON[window.CsStad.zonFor(r.sprak)].namn;
    const info = window.CsStad.lage().distrikt.find((d) => d.namn === namn) || {};
    $('kort-zon').textContent = zon + ' · ' + (r.sprak || 'okänt språk');
    $('kort-titel').textContent = r.namn;
    const ci = { ok: ['Grönt', 'ok'], fel: ['Rött', 'fel'], pagar: ['Pågår', ''] }[r.ci] || ['–', ''];
    const rutor = [
      ['Invånare', tal(r.rader), 'rader kod', 'ok'],
      ['Byggnader', tal(info.hus), tal(r.commits) + ' commits', ''],
      ['Bygget', ci[0], r.ci === 'fel' ? 'huset brinner' : 'på main', ci[1]],
      ['Veckan', tal(r.veckans), 'commits', ''],
      ['Öppna PR', tal(r.prOppna), r.prOppna ? 'byggkran' : '', ''],
      ['Issues', tal(r.issues), (r.issues || 0) >= 3 ? 'trafikstockning' : 'trafik', '']
    ];
    $('kort-siffror').innerHTML = rutor.map(([dt, dd, sub, cls]) =>
      '<div><dt>' + esc(dt) + '</dt><dd' + (cls ? ' class="' + cls + '"' : '') + '>' + esc(dd) + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</dd></div>').join('');
    const rad = ['Senaste commit ' + nar(r.senast)];
    if (r.release) rad.push('landmärke ' + r.release);
    if (info.gammal) rad.push('distriktet växer igen');
    $('kort-status').textContent = rad.join(' · ');
    $('kort').hidden = false;
    window.CsStad.valj(namn);
    const hudBotten = document.querySelector('.hud').getBoundingClientRect().bottom;
    window.CsStad.fokus(namn, hudBotten, $('kort').getBoundingClientRect().top);
  }

  function stang() {
    $('kort').hidden = true;
    window.CsStad.valj(null);
  }

  $('btn-stang').addEventListener('click', stang);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('kort').hidden) stang(); });
  $('btn-centrera').addEventListener('click', () => { stang(); window.CsStad.centrera(); });

  // Lista för skärmläsare (och tangentbord) med alla distrikt
  $('distrikt-lista').innerHTML = repon.map((r) => '<li><button type="button" data-namn="' + esc(r.namn) + '">' + esc(r.namn) + '</button></li>').join('');
  $('distrikt-lista').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-namn]');
    if (b) oppna(b.dataset.namn);
  });

  // ---------- Start ----------
  window.CsStad.starta($('stad'), repon, { onValj: (namn) => (namn ? oppna(namn) : stang()) });
  applyTheme(currentTheme());
  hud();
  tickerLista = handelser();
  visaTicker();
  setInterval(() => { tickerIndex++; visaTicker(); }, 6000);
})();
