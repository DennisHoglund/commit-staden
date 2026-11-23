// Appens skal: tema, GitHub-anslutning, HUD, nyhetsrad och distriktskort.
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const THEME_KEY = 'cs-theme';
  const GH = window.CsGithub;

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} }
  };

  const tal = (n) => Number(n || 0).toLocaleString('sv-SE');
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const klocka = (iso) => new Date(iso).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });

  function dagarSedan(iso) {
    const t = Date.parse(iso);
    return isNaN(t) ? null : Math.floor((Date.now() - t) / 86400000);
  }
  // "3 månader", "12 år" – hur länge sedan, avrundat
  function langeSedan(dagar) {
    if (dagar < 60) return dagar + ' dagar';
    if (dagar < 365) return Math.floor(dagar / 30) + ' månader';
    const ar = Math.floor(dagar / 365);
    return ar === 1 ? '1 år' : ar + ' år';
  }
  // Distrikt utan commits: står still (45 dagar) eller övergivet (1 år)
  function stillaText(dagar) {
    if (dagar == null || dagar <= 45) return '';
    return (dagar >= 365 ? 'övergivet' : 'står still') + ', ingen commit på ' + langeSedan(dagar);
  }

  function nar(iso) {
    const t = Date.parse(iso);
    if (isNaN(t)) return '–';
    const min = Math.floor((Date.now() - t) / 60000);
    if (min < 60) return min <= 1 ? 'nyss' : 'för ' + min + ' min sedan';
    if (min < 24 * 60) return 'för ' + Math.floor(min / 60) + ' h sedan';
    const d = Math.floor(min / 1440);
    return d === 1 ? 'i går' : 'för ' + d + ' dagar sedan';
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

  // ---------- Läge ----------
  const lage = { repon: [], perNamn: new Map(), demo: true, login: '', tid: '', hamtar: false };

  function visa(repon, info) {
    lage.repon = repon;
    lage.perNamn = new Map(repon.map((r) => [r.namn, r]));
    lage.demo = !!info.demo;
    lage.login = info.login || '';
    lage.tid = info.tid || '';
    $('kort').hidden = true;
    window.CsStad.sattRepon(repon);
    hud();
    lista();
    tickerLista = handelser();
    tickerIndex = 0;
    visaTicker();
    konto();
  }

  // ---------- HUD ----------
  function hud() {
    const repon = lage.repon;
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
    const vader = { klart: 'Klart', mulet: 'Mulet', aska: 'Åska' }[window.CsStad.lage().vader] || '';
    $('hud-datum').textContent = d.toLocaleDateString('sv-SE', { weekday: 'short', day: 'numeric', month: 'short' }) + ' · ' + repon.length + ' distrikt' + (vader ? ' · ' + vader : '');
  }

  function konto() {
    const b = $('btn-konto');
    b.textContent = lage.hamtar && lage.demo ? 'Hämtar…' : lage.demo ? 'Demo' : lage.login;
    b.setAttribute('aria-label', lage.demo ? 'Demoläge. Anslut GitHub' : 'GitHub-konto ' + lage.login);
  }

  // ---------- Händelser till nyhetsraden ----------
  function handelser() {
    const h = [];
    lage.repon.forEach((r) => {
      const d = dagarSedan(r.senast);
      if (r.ci === 'fel') {
        const steg = r.brand && r.brand.steg && r.brand.steg[0] ? ' (' + r.brand.steg[0].split(' › ').pop() + ')' : '';
        h.push({ typ: 'brand', namn: r.namn, text: 'Brand i ' + r.namn + '! Brandkåren är på plats' + steg });
      }
      if (r.prOppna) h.push({ typ: 'bygge', namn: r.namn, text: 'Byggstart i ' + r.namn + ': ' + r.prOppna + ' öppen PR' });
      if (r.release) h.push({ typ: 'torn', namn: r.namn, text: 'Nytt landmärke i ' + r.namn + ': ' + r.release });
      if ((r.issues || 0) >= 3) h.push({ typ: 'trafik', namn: r.namn, text: 'Trafikstockning i ' + r.namn + ': ' + r.issues + ' öppna issues' });
      if (d != null && d > 45) h.push({ typ: 'gammal', namn: r.namn, text: r.namn + (d >= 365 ? ' är ' : ' ') + stillaText(d) });
    });
    const snabbast = [...lage.repon].sort((a, b) => (b.veckans || 0) - (a.veckans || 0))[0];
    if (snabbast && snabbast.veckans) h.push({ typ: 'vaxer', namn: snabbast.namn, text: snabbast.namn + ' växer snabbast: ' + snabbast.veckans + ' commits i veckan' });
    const ordning = { brand: 0, trafik: 1, bygge: 2, torn: 3, vaxer: 4, gammal: 5 };
    return h.sort((a, b) => ordning[a.typ] - ordning[b.typ]);
  }

  let tickerIndex = 0;
  let tickerLista = [];
  let tickerInfo = null;
  function visaTicker() {
    const t = $('ticker');
    const e = tickerInfo || tickerLista[tickerIndex % Math.max(1, tickerLista.length)];
    if (!e) { t.hidden = true; return; }
    t.hidden = false;
    t.dataset.typ = e.typ;
    t.dataset.namn = e.namn || '';
    $('ticker-text').textContent = e.text;
    t.setAttribute('aria-label', e.namn ? e.text + '. Visa distriktet.' : e.text);
  }
  $('ticker').addEventListener('click', () => { if ($('ticker').dataset.namn) oppna($('ticker').dataset.namn); });
  setInterval(() => { tickerIndex++; visaTicker(); }, 6000);

  let toastTimer = null;
  function toast(text, fel) {
    const t = $('toast');
    t.textContent = text;
    t.className = 'toast' + (fel ? ' fel' : '');
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 6000);
  }

  // ---------- Distriktskort ----------
  function oppna(namn) {
    const r = lage.perNamn.get(namn);
    if (!r) { stangAlla(); return; }
    $('gh-kort').hidden = true;
    $('sok-kort').hidden = true;
    const zon = window.CsStad.ZON[window.CsStad.zonFor(r.sprak)].namn;
    const info = window.CsStad.lage().distrikt.find((d) => d.namn === namn) || {};
    $('kort-zon').textContent = zon + ' · ' + (r.sprak || 'okänt språk');
    $('kort-titel').textContent = r.namn;
    const ci = { ok: ['Grönt', 'ok'], fel: ['Rött', 'fel'], pagar: ['Pågår', ''] }[r.ci] || ['–', ''];
    const rutor = [
      ['Invånare', tal(r.rader), 'rader kod', 'ok'],
      ['Byggnader', tal(info.hus), tal(r.commits) + ' commits', ''],
      ['Bygget', ci[0], r.ci === 'fel' ? 'huset brinner' : r.ci ? 'på main' : 'inga Actions', ci[1]],
      ['Veckan', tal(r.veckans), 'commits', ''],
      ['Öppna PR', tal(r.prOppna), r.prOppna ? 'byggkran' : '', ''],
      ['Issues', tal(r.issues), (r.issues || 0) >= 3 ? 'trafikstockning' : 'trafik', '']
    ];
    $('kort-siffror').innerHTML = rutor.map(([dt, dd, sub, cls]) =>
      '<div><dt>' + esc(dt) + '</dt><dd' + (cls ? ' class="' + cls + '"' : '') + '>' + esc(dd) + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</dd></div>').join('');
    const rad = ['Senaste commit ' + nar(r.senast)];
    if (r.release) rad.push('landmärke ' + r.release);
    if (info.gammal) { const t = stillaText(dagarSedan(r.senast)); if (t) rad.push('distriktet ' + (t.startsWith('över') ? 'är ' : '') + t); }
    $('kort-status').textContent = rad.join(' · ');
    brand(r);
    $('kort-repo').hidden = !r.url;
    if (r.url) $('kort-repo').href = r.url;
    $('kort').hidden = false;
    $('kort').scrollTop = 0;
    window.CsStad.valj(namn);
    const hudBotten = document.querySelector('.hud').getBoundingClientRect().bottom;
    window.CsStad.fokus(namn, hudBotten, $('kort').getBoundingClientRect().top);
  }

  // Varför brinner det?
  function brand(r) {
    const b = r.ci === 'fel' && r.brand;
    $('kort-brand').hidden = !b;
    if (!b) return;
    $('brand-workflow').textContent = b.workflow + (b.steg && b.steg.length ? ' · ' + b.steg.join(' · ') : '');
    $('brand-fel').innerHTML = (b.fel || []).map((f) => '<li>' + esc(f) + '</li>').join('');
    $('brand-fel').hidden = !(b.fel && b.fel.length);
    $('brand-commit').innerHTML = (b.sha ? '<code>' + esc(b.sha) + '</code> ' : '') +
      (b.meddelande ? '”' + esc(b.meddelande) + '”' : '') +
      (b.vem ? ' av ' + esc(b.vem) : '') + (b.tid ? ' · ' + esc(nar(b.tid)) : '');
    $('brand-lank').hidden = !b.url;
    if (b.url) $('brand-lank').href = b.url;
  }

  function stangAlla() {
    $('kort').hidden = true;
    $('gh-kort').hidden = true;
    $('sok-kort').hidden = true;
    window.CsStad.valj(null);
  }

  $('btn-stang').addEventListener('click', stangAlla);
  $('btn-gh-stang').addEventListener('click', stangAlla);
  $('btn-sok-stang').addEventListener('click', stangAlla);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') stangAlla(); });
  $('btn-centrera').addEventListener('click', () => { stangAlla(); window.CsStad.centrera(); });

  // Lista för skärmläsare (och tangentbord) med alla distrikt
  function lista() {
    $('distrikt-lista').innerHTML = lage.repon.map((r) => '<li><button type="button" data-namn="' + esc(r.namn) + '">' + esc(r.namn) + '</button></li>').join('');
  }
  $('distrikt-lista').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-namn]');
    if (b) oppna(b.dataset.namn);
  });

  // ---------- Sök och taxi ----------
  function sokStatus(r) {
    if (r.ci === 'fel') return 'brinner';
    const d = dagarSedan(r.senast);
    const still = stillaText(d);
    if (still) return still.split(',')[0];
    return r.ci === 'ok' ? 'grönt' : r.ci === 'pagar' ? 'bygger' : '';
  }
  function sokLista(q) {
    const s = q.trim().toLowerCase();
    const traffar = lage.repon
      .filter((r) => !s || r.namn.toLowerCase().includes(s))
      .sort((a, b) => (b.namn.toLowerCase().startsWith(s) - a.namn.toLowerCase().startsWith(s)) || a.namn.localeCompare(b.namn))
      .slice(0, 8);
    $('sok-lista').innerHTML = traffar.map((r) => {
      const zon = window.CsStad.ZON[window.CsStad.zonFor(r.sprak)].namn;
      const sub = [zon, r.sprak, sokStatus(r)].filter(Boolean).join(' · ');
      const cls = r.ci === 'fel' ? 'fel' : r.ci === 'ok' ? 'ok' : '';
      return '<li><button type="button" data-namn="' + esc(r.namn) + '"><span class="sok-prick ' + cls + '" aria-hidden="true"></span>' +
        '<span class="sok-text"><span class="sok-namn">' + esc(r.namn) + '</span><span class="sok-sub">' + esc(sub) + '</span></span>' +
        '<span class="sok-taxi">Taxi</span></button></li>';
    }).join('');
    $('sok-tom').hidden = traffar.length > 0;
    return traffar;
  }
  function aktTaxi(namn) {
    stangAlla();
    $('sok').blur();
    window.CsStad.taxi(namn, () => oppna(namn));
  }
  $('btn-sok').addEventListener('click', () => {
    stangAlla();
    $('sok').value = '';
    sokLista('');
    $('sok-kort').hidden = false;
    $('sok').focus();
  });
  $('sok').addEventListener('input', () => sokLista($('sok').value));
  $('form-sok').addEventListener('submit', (e) => {
    e.preventDefault();
    const t = sokLista($('sok').value);
    if (t.length) aktTaxi(t[0].namn);
  });
  $('sok-lista').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-namn]');
    if (b) aktTaxi(b.dataset.namn);
  });

  // ---------- GitHub ----------
  function oppnaGithub() {
    stangAlla();
    const inne = !!GH.token() && !lage.demo;
    $('gh-ut').hidden = inne;
    $('gh-in').hidden = !inne;
    $('gh-titel').textContent = inne ? 'Ditt GitHub' : 'Anslut GitHub';
    if (inne) {
      $('gh-login').textContent = lage.login;
      $('gh-status').textContent = 'Uppdaterad ' + (lage.tid ? klocka(lage.tid) : '–') + ' · ' + lage.repon.length + ' distrikt';
    }
    $('gh-kort').hidden = false;
  }
  $('btn-github').addEventListener('click', oppnaGithub);
  $('btn-konto').addEventListener('click', oppnaGithub);

  function setMsg(text, typ) {
    $('token-msg').textContent = text || '';
    $('token-msg').className = 'msg' + (typ ? ' ' + typ : '');
  }

  async function uppdatera(tok, franFormular) {
    if (lage.hamtar) return;
    lage.hamtar = true;
    konto();
    $('btn-uppdatera').disabled = true;
    tickerInfo = { typ: 'info', text: 'Hämtar dina repon från GitHub…' };
    visaTicker();
    try {
      const res = await GH.hamta(tok, (klara, totalt) => {
        tickerInfo = { typ: 'info', text: 'Hämtar dina repon från GitHub… ' + klara + ' av ' + totalt };
        visaTicker();
      });
      if (franFormular) {
        GH.sparaToken(tok);
        $('token').value = '';
        setMsg('');
        $('gh-kort').hidden = true;
      }
      tickerInfo = null;
      lage.hamtar = false;
      visa(res.repon, { login: res.login, tid: res.tid });
      if (!$('gh-kort').hidden) oppnaGithub();
      toast('Staden är byggd av ' + res.repon.length + ' repon');
    } catch (e) {
      tickerInfo = null;
      lage.hamtar = false;
      visaTicker();
      konto();
      const text = (e && e.message) || 'Något gick fel vid hämtningen.';
      if (franFormular) {
        setMsg(text, 'fel');
      } else if (e && e.typ === 'token') {
        GH.glomToken();
        visa(window.CsDemo.repon, { demo: true });
        oppnaGithub();
        setMsg(text + ' Skapa en ny token och anslut igen.', 'fel');
      } else {
        const c = GH.lasCache();
        toast(text + (c ? ' Visar staden från ' + klocka(c.tid) + '.' : ''), true);
      }
    } finally {
      $('btn-uppdatera').disabled = false;
    }
  }

  $('form-token').addEventListener('submit', (e) => {
    e.preventDefault();
    const tok = $('token').value.trim();
    if (!GH.rimligToken(tok)) {
      setMsg('Det ser inte ut som en GitHub-token. Den börjar med github_pat_ eller ghp_.', 'fel');
      return;
    }
    setMsg('Ansluter…');
    uppdatera(tok, true);
  });
  $('btn-uppdatera').addEventListener('click', () => { const t = GH.token(); if (t) uppdatera(t, false); });
  $('btn-loggaut').addEventListener('click', () => {
    GH.glomToken();
    visa(window.CsDemo.repon, { demo: true });
    $('gh-kort').hidden = true;
    toast('Utloggad. Token är borttagen från telefonen.');
  });

  // ---------- Start ----------
  window.CsStad.starta($('stad'), [], { onValj: (namn) => (namn ? oppna(namn) : stangAlla()) });
  applyTheme(currentTheme());

  const tok = GH.token();
  const cache = GH.lasCache();
  if (tok && cache) {
    visa(cache.repon, { login: cache.login, tid: cache.tid });
  } else {
    visa(window.CsDemo.repon, { demo: true });
  }
  if (tok) uppdatera(tok, false);

  // Hämta på nytt när appen öppnas igen efter en stund
  let senast = Date.now();
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && GH.token() && Date.now() - senast > 5 * 60000) {
      senast = Date.now();
      uppdatera(GH.token(), false);
    }
  });
})();
