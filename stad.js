// Ritar staden: en isometrisk stad på canvas där varje repo är ett distrikt.
// Exponeras som window.CsStad. Inga beroenden.
(function () {
  'use strict';

  const TW = 32;          // rutans bredd i px (världskoordinater)
  const TH = 16;          // rutans höjd
  const BLOCK = 4;        // distrikt är 4×4 tomter
  const STEG = BLOCK + 1; // + en väg
  const GAMMAL_DAGAR = 45;

  // ---------- Zoner efter språk ----------
  const ZON = {
    bostad: { namn: 'Bostadsområde', sprak: ['JavaScript', 'TypeScript'] },
    centrum: { namn: 'Centrum', sprak: ['HTML', 'CSS', 'Vue', 'Svelte', 'SCSS'] },
    industri: { namn: 'Industriområde', sprak: ['C#', 'Java', 'Go', 'Rust', 'Python', 'C', 'C++', 'Kotlin', 'Swift', 'PowerShell', 'Shell'] },
    blandat: { namn: 'Blandat', sprak: [] }
  };
  function zonFor(sprak) {
    for (const k of ['bostad', 'centrum', 'industri']) if (ZON[k].sprak.includes(sprak)) return k;
    return 'blandat';
  }

  // ---------- Färger per tema ----------
  const PALETT = {
    dark: {
      bg: '#000000', gras: '#0B1A10', kant: '#050B07', vag: '#141916', linje: '#3A4A3F', trad: '#1F5A33', stam: '#2A3A2F',
      etikett: 'rgba(0,0,0,.78)', etikettText: '#EAFBEF', morkt: '#0A140D',
      zon: {
        bostad: ['#0F2A18', '#2B5A3C', '#1C3D28', '#132B1C', '#3DFF8A'],
        centrum: ['#0D2424', '#2A5757', '#1B3B3B', '#122929', '#7FFFE0'],
        industri: ['#26200F', '#5A4A2A', '#3D321C', '#2B2313', '#FFC25A'],
        blandat: ['#17191A', '#3A4046', '#2A2E33', '#1D2024', '#C9D3DC'],
        gammal: ['#121612', '#2A302B', '#1E231F', '#151915', '#3A453C']
      }
    },
    light: {
      bg: '#DCEBE0', gras: '#B9D8B8', kant: '#A3C4A3', vag: '#8E9A93', linje: '#E8EFE9', trad: '#4E9A5E', stam: '#6B5A45',
      etikett: 'rgba(255,255,255,.88)', etikettText: '#0F2A18', morkt: '#5F7D69',
      zon: {
        bostad: ['#A6D3AE', '#E4F3E7', '#BCD9C1', '#93BC9B', '#2E6B43'],
        centrum: ['#A3D2CF', '#E2F4F3', '#B6DAD7', '#8DBDB9', '#1F5E5A'],
        industri: ['#D9C9A0', '#F5EBD2', '#DCCBA3', '#BFA97A', '#6B4E12'],
        blandat: ['#C3CAD0', '#EEF1F4', '#CDD3D9', '#AAB3BB', '#3A4046'],
        gammal: ['#C2CCBF', '#DCE2DA', '#C5CDC3', '#AEB8AC', '#7F8B7D']
      }
    }
  };

  // ---------- Hjälp ----------
  function hash() {
    let h = 2166136261;
    for (const a of arguments) {
      const s = String(a);
      for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    }
    return (h >>> 0) / 4294967295;
  }
  function dagarSedan(iso) {
    const t = Date.parse(iso);
    return isNaN(t) ? 9999 : (Date.now() - t) / 86400000;
  }

  // ---------- Bygg staden från repon ----------
  // repo: { namn, sprak, commits, rader, ci: 'ok'|'fel'|'pagar'|'', prOppna, issues, senast (ISO), release }
  function bygg(repon) {
    const lista = [...repon].sort((a, b) => b.commits - a.commits || a.namn.localeCompare(b.namn));
    const kol = Math.max(1, Math.ceil(Math.sqrt(lista.length)));
    const rader = Math.max(1, Math.ceil(lista.length / kol));
    const storlek = { i: kol * STEG + 1, j: rader * STEG + 1 };

    // Tomter ordnade från mitten och utåt, så att de högsta husen hamnar i mitten
    const tomter = [];
    for (let a = 0; a < BLOCK; a++) for (let b = 0; b < BLOCK; b++) tomter.push([a, b]);
    const c = (BLOCK - 1) / 2;
    tomter.sort((p, q) => (Math.hypot(p[0] - c, p[1] - c) - Math.hypot(q[0] - c, q[1] - c)) || (p[0] - q[0]) || (p[1] - q[1]));

    const distrikt = lista.map((r, k) => {
      const i0 = (k % kol) * STEG + 1;
      const j0 = Math.floor(k / kol) * STEG + 1;
      const gammal = dagarSedan(r.senast) > GAMMAL_DAGAR;
      const zon = zonFor(r.sprak);
      // En byggnad per 10 commits, men minst 3 så att små repon ser ut som kvarter
      const antal = Math.min(BLOCK * BLOCK - (r.prOppna ? 1 : 0), Math.max(r.commits ? 3 : 1, Math.ceil((r.commits || 0) / 10)));
      const hus = [];
      const maxH = 16 + Math.min(50, Math.sqrt(r.commits || 0) * 3.5);
      for (let n = 0; n < BLOCK * BLOCK; n++) {
        const [a, b] = tomter[n];
        const t = { i: i0 + a, j: j0 + b, typ: 'tom' };
        if (n < antal) {
          const fall = n / Math.max(1, antal);
          t.typ = 'hus';
          t.h = Math.round(Math.max(11, maxH * (1 - fall * 0.6) * (0.75 + hash(r.namn, n) * 0.5)));
          t.w = 0.62 + hash(r.namn, n, 'w') * 0.22;
        } else if (n === antal && r.prOppna) {
          t.typ = 'bygge';
        } else {
          t.typ = hash(r.namn, n, 't') < (gammal ? 0.75 : 0.35) ? 'trad' : 'tom';
        }
        hus.push(t);
      }
      if (r.release) { hus[0].typ = 'torn'; hus[0].h = Math.round(maxH * 1.5 + 14); hus[0].w = 0.55; }
      if (r.ci === 'fel') {
        const brand = hus.find((t, n) => n > 0 && t.typ === 'hus') || hus.find((t) => t.typ === 'hus' || t.typ === 'torn');
        if (brand) brand.brand = true;
      }
      return { repo: r, namn: r.namn, zon, gammal, i0, j0, hus, mitt: { i: i0 + c, j: j0 + c } };
    });

    // Bilar: några på varje väg nära distrikt med öppna issues (trafik)
    const bilar = [];
    distrikt.forEach((d, k) => {
      const n = 1 + Math.min(6, d.repo.issues || 0);
      for (let m = 0; m < n; m++) {
        const langsI = hash(d.namn, m, 'r') < 0.5;
        bilar.push({
          langsI,
          fast: langsI ? d.j0 - 1 : d.i0 - 1,
          start: hash(d.namn, m, 's') * (langsI ? storlek.i : storlek.j),
          fart: 0.6 + hash(d.namn, m, 'v') * 0.9,
          rikt: hash(d.namn, m, 'd') < 0.5 ? 1 : -1,
          farg: m % 3
        });
      }
    });

    return { storlek, distrikt, bilar };
  }

  // ---------- Rendering ----------
  const S = {
    canvas: null, ctx: null, dpr: 1, w: 0, h: 0,
    stad: null, kam: { x: 0, y: 0, s: 1 }, tema: 'dark', vald: null,
    tid: 0, anim: true, klar: false, onValj: null
  };

  function iso(i, j) { return { x: (i - j) * TW / 2, y: (i + j) * TH / 2 }; }

  function poly(ctx, pts, fill) {
    ctx.beginPath();
    ctx.moveTo(pts[0], pts[1]);
    for (let k = 2; k < pts.length; k += 2) ctx.lineTo(pts[k], pts[k + 1]);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
  }

  function ruta(ctx, x, y, fill, kant) {
    poly(ctx, [x, y - TH / 2, x + TW / 2, y, x, y + TH / 2, x - TW / 2, y], fill);
    if (kant) { ctx.strokeStyle = kant; ctx.lineWidth = 0.5; ctx.stroke(); }
  }

  function lada(ctx, x, y, h, w, f, seed, opts) {
    const hw = TW / 2 * w, hh = TH / 2 * w;
    poly(ctx, [x - hw, y, x, y + hh, x, y + hh - h, x - hw, y - h], f[2]);
    poly(ctx, [x, y + hh, x + hw, y, x + hw, y - h, x, y + hh - h], f[3]);
    poly(ctx, [x, y - hh - h, x + hw, y - h, x, y + hh - h, x - hw, y - h], f[1]);
    // Fönster
    const P = PALETT[S.tema];
    let k = 0;
    for (let lv = 5; lv < h - 2; lv += 5) {
      for (let a = 0.25; a < 0.95; a += 0.35) {
        k++;
        const tand = hash(seed, k) < (opts.gammal ? 0.12 : 0.42);
        const blink = S.anim && tand && hash(seed, k, 'b') < 0.08 && Math.sin(S.tid / 700 + k) > 0.6;
        const c1 = tand && !blink ? f[4] : P.morkt;
        const px = x - hw + a * hw, py = y + a * hh - lv;
        poly(ctx, [px, py, px + 2.4, py + 1.2, px + 2.4, py - 1.4, px, py - 2.6], c1);
        const tand2 = hash(seed, k, 'h') < (opts.gammal ? 0.12 : 0.38);
        const qx = x + a * hw, qy = y + hh - a * hh - lv;
        poly(ctx, [qx, qy, qx + 2.4, qy - 1.2, qx + 2.4, qy - 3.8, qx, qy - 2.6], tand2 ? f[4] : P.morkt);
      }
    }
  }

  function trad(ctx, x, y) {
    const P = PALETT[S.tema];
    ctx.fillStyle = P.stam;
    ctx.fillRect(x - 0.6, y - 4, 1.2, 4);
    poly(ctx, [x, y - 13, x + 4, y - 3.5, x - 4, y - 3.5], P.trad);
  }

  function eld(ctx, x, y) {
    const t = S.tid / 1000;
    const fl = (n) => S.anim ? 0.6 + 0.4 * Math.abs(Math.sin(t * 9 + n * 1.7)) : 1;
    const farger = ['#FF8A3D', '#FFD23D', '#FF5A3D', '#FF8A3D', '#FFD23D'];
    [[-6, 0], [0, -4], [6, -1], [3, -9], [-3, -7]].forEach(([dx, dy], n) => {
      const s = 5.2 * fl(n);
      poly(ctx, [x + dx, y + dy - s * 2, x + dx + s, y + dy, x + dx - s, y + dy], farger[n]);
    });
    for (let n = 0; n < 3; n++) {
      const fas = S.anim ? ((t * 0.6 + n / 3) % 1) : n / 3;
      ctx.globalAlpha = 0.55 * (1 - fas);
      ctx.fillStyle = '#4A524E';
      ctx.beginPath();
      ctx.arc(x + Math.sin(n * 2 + t) * 2, y - 12 - fas * 26, 2.5 + fas * 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  function bygge(ctx, x, y) {
    poly(ctx, [x - 12, y, x, y + 6, x + 12, y, x, y - 6], S.tema === 'dark' ? '#3A3220' : '#C9B98F');
    const f = PALETT[S.tema].zon.industri;
    lada(ctx, x, y, 8, 0.5, f, 'bygge' + x, { gammal: false });
    ctx.strokeStyle = '#FFC25A';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(x + 6, y - 2); ctx.lineTo(x + 6, y - 46);
    ctx.moveTo(x - 12, y - 46); ctx.lineTo(x + 18, y - 46);
    ctx.stroke();
    const sv = S.anim ? Math.sin(S.tid / 600) * 1.5 : 0;
    ctx.strokeStyle = '#9DB5A4';
    ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.moveTo(x - 8, y - 46); ctx.lineTo(x - 8 + sv, y - 28); ctx.stroke();
    ctx.fillStyle = '#C9A55A';
    ctx.fillRect(x - 10 + sv, y - 28, 4, 2.6);
  }

  function torn(ctx, x, y, h, f, seed, gammal) {
    lada(ctx, x, y, h, 0.55, f, seed, { gammal });
    ctx.fillStyle = '#9DB5A4';
    ctx.fillRect(x - 0.6, y - h - 18, 1.2, 16);
    const p = S.anim ? (Math.sin(S.tid / 300) > 0 ? 1 : 0.25) : 1;
    ctx.globalAlpha = p;
    ctx.fillStyle = '#3DFF8A';
    ctx.beginPath(); ctx.arc(x, y - h - 19, 2.2, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = p * 0.2;
    ctx.beginPath(); ctx.arc(x, y - h - 19, 7, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }

  function bil(ctx, x, y, farg) {
    const c = ['#EAFBEF', '#7FFFE0', '#FFC25A'][farg];
    poly(ctx, [x - 3.2, y, x, y + 1.6, x + 3.2, y, x, y - 1.6], 'rgba(0,0,0,.35)');
    poly(ctx, [x - 3, y - 1.4, x, y + 0.2, x + 3, y - 1.4, x, y - 3], c);
  }

  function rita() {
    const { ctx, stad } = S;
    if (!ctx || !stad) return;
    const P = PALETT[S.tema];
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = P.bg;
    ctx.fillRect(0, 0, S.canvas.width, S.canvas.height);
    const s = S.dpr * S.kam.s;
    ctx.setTransform(s, 0, 0, s, S.dpr * S.kam.x, S.dpr * S.kam.y);

    const { storlek, distrikt } = stad;
    const tomtIndex = new Map();
    distrikt.forEach((d) => d.hus.forEach((t) => tomtIndex.set(t.i + ',' + t.j, { d, t })));

    // Mark och vägar
    for (let i = 0; i < storlek.i; i++) {
      for (let j = 0; j < storlek.j; j++) {
        const p = iso(i, j);
        const vag = i % STEG === 0 || j % STEG === 0;
        if (vag) {
          ruta(ctx, p.x, p.y, P.vag, P.kant);
          ctx.strokeStyle = P.linje;
          ctx.lineWidth = 0.7;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          if (j % STEG === 0 && i % STEG !== 0) { ctx.moveTo(p.x - 5, p.y - 2.5); ctx.lineTo(p.x + 5, p.y + 2.5); }
          if (i % STEG === 0 && j % STEG !== 0) { ctx.moveTo(p.x + 5, p.y - 2.5); ctx.lineTo(p.x - 5, p.y + 2.5); }
          ctx.stroke();
          ctx.setLineDash([]);
        } else {
          const hit = tomtIndex.get(i + ',' + j);
          const f = hit ? P.zon[hit.d.gammal ? 'gammal' : hit.d.zon] : null;
          ruta(ctx, p.x, p.y, f ? f[0] : P.gras, P.kant);
        }
      }
    }

    // Allt som står på marken ritas bakifrån och fram
    const objekt = [];
    distrikt.forEach((d) => d.hus.forEach((t) => objekt.push({ z: t.i + t.j, d, t })));
    stad.bilar.forEach((b) => {
      const len = b.langsI ? storlek.i : storlek.j;
      let pos = (b.start + (S.anim ? S.tid / 1000 * b.fart * b.rikt : 0)) % len;
      if (pos < 0) pos += len;
      const i = b.langsI ? pos : b.fast;
      const j = b.langsI ? b.fast : pos;
      objekt.push({ z: i + j + 0.01, bil: b, i, j });
    });
    objekt.sort((a, b) => a.z - b.z);

    for (const o of objekt) {
      if (o.bil) {
        const p = iso(o.i, o.j);
        const off = o.bil.rikt > 0 ? 2 : -2;
        bil(ctx, p.x + (o.bil.langsI ? -off : off), p.y + off / 2, o.bil.farg);
        continue;
      }
      const { d, t } = o;
      const p = iso(t.i, t.j);
      const f = P.zon[d.gammal ? 'gammal' : d.zon];
      const dimma = S.vald && S.vald !== d.namn;
      if (dimma) ctx.globalAlpha = 0.35;
      const seed = d.namn + t.i + ',' + t.j;
      if (t.typ === 'hus') lada(ctx, p.x, p.y, t.h, t.w, f, seed, { gammal: d.gammal });
      else if (t.typ === 'torn') torn(ctx, p.x, p.y, t.h, f, seed, d.gammal);
      else if (t.typ === 'bygge') bygge(ctx, p.x, p.y);
      else if (t.typ === 'trad') trad(ctx, p.x, p.y);
      if (t.brand) eld(ctx, p.x, p.y - t.h - 1);
      ctx.globalAlpha = 1;
    }

    // Namnskyltar ovanför varje distrikt
    ctx.font = '600 9px Geist, -apple-system, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    distrikt.forEach((d) => {
      if (S.vald && S.vald !== d.namn) return;
      const p = iso(d.mitt.i, d.mitt.j);
      const hog = Math.max(...d.hus.map((t) => t.h || 0));
      const y = p.y - hog - 16 - (d.repo.release ? 22 : 0);
      const w = ctx.measureText(d.namn).width + 14;
      ctx.fillStyle = P.etikett;
      rundad(ctx, p.x - w / 2, y - 7, w, 14, 7);
      ctx.fill();
      ctx.strokeStyle = P.zon[d.gammal ? 'gammal' : d.zon][4];
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.fillStyle = P.etikettText;
      ctx.fillText(d.namn, p.x, y + 0.5);
    });
  }

  function rundad(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // ---------- Kamera ----------
  // Visar hela staden på höjden. Kanterna får hamna lite utanför på bredden
  // (max 1,5 gånger skärmbredden) så att staden fyller telefonen.
  function centrera() {
    if (!S.stad) return;
    const { storlek } = S.stad;
    const minX = -storlek.j * TW / 2, maxX = storlek.i * TW / 2;
    const hogst = Math.max(40, ...S.stad.distrikt.flatMap((d) => d.hus.map((t) => (t.h || 0) + (t.typ === 'torn' ? 24 : 0))));
    const minY = -hogst - 20, maxY = (storlek.i + storlek.j) * TH / 2;
    const topp = 150, botten = 140;
    const tillgH = Math.max(200, S.h - topp - botten);
    const breddFit = (S.w - 16) / (maxX - minX);
    const hojdFit = tillgH / (maxY - minY);
    const s = Math.min(2.4, Math.max(0.35, Math.min(hojdFit, breddFit * 1.5)));
    S.kam.s = s;
    S.kam.x = S.w / 2 - (minX + maxX) / 2 * s;
    S.kam.y = topp + (tillgH - (maxY - minY) * s) / 2 - minY * s;
    rita();
  }

  function tillRuta(px, py) {
    const wx = (px - S.kam.x) / S.kam.s;
    const wy = (py - S.kam.y) / S.kam.s;
    const a = wy / (TH / 2), b = wx / (TW / 2);
    return { i: (a + b) / 2, j: (a - b) / 2 };
  }

  function distriktVid(px, py) {
    if (!S.stad) return null;
    const r = tillRuta(px, py);
    // Träffa också höga hus: prova punkter längre ner på skärmen (bakom huset)
    for (let dy = 0; dy <= 60; dy += 6) {
      const q = tillRuta(px, py + dy * S.kam.s);
      const hit = S.stad.distrikt.find((d) => q.i >= d.i0 - 0.5 && q.i < d.i0 + BLOCK - 0.5 && q.j >= d.j0 - 0.5 && q.j < d.j0 + BLOCK - 0.5);
      if (hit) return hit;
      if (dy === 0 && r.i < -1) break;
    }
    return null;
  }

  function skarmpunkt(namn) {
    const d = S.stad && S.stad.distrikt.find((x) => x.namn === namn);
    if (!d) return null;
    const p = iso(d.mitt.i, d.mitt.j);
    return { x: S.kam.x + p.x * S.kam.s, y: S.kam.y + p.y * S.kam.s };
  }

  function valj(namn) {
    S.vald = namn || null;
    rita();
  }

  // Flyttar kameran så att distriktet hamnar mitt i den synliga ytan (mellan HUD och kort)
  function fokus(namn, topp, botten) {
    const d = S.stad && S.stad.distrikt.find((x) => x.namn === namn);
    if (!d) return;
    const p = iso(d.mitt.i, d.mitt.j);
    const hog = Math.max(...d.hus.map((t) => t.h || 0));
    const malY = (topp + botten) / 2 + hog * S.kam.s / 2;
    S.kam.x = S.w / 2 - p.x * S.kam.s;
    S.kam.y = malY - p.y * S.kam.s;
    rita();
  }

  // ---------- Pekare: dra, nyp och tryck ----------
  function pekare(canvas) {
    const aktiva = new Map();
    let start = null, nyp = null;

    canvas.addEventListener('pointerdown', (e) => {
      canvas.setPointerCapture(e.pointerId);
      aktiva.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (aktiva.size === 1) start = { x: e.clientX, y: e.clientY, t: Date.now(), kx: S.kam.x, ky: S.kam.y, flyttad: false };
      if (aktiva.size === 2) {
        const [a, b] = [...aktiva.values()];
        nyp = { d: Math.hypot(a.x - b.x, a.y - b.y), s: S.kam.s, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2, kx: S.kam.x, ky: S.kam.y };
        if (start) start.flyttad = true;
      }
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!aktiva.has(e.pointerId)) return;
      aktiva.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (nyp && aktiva.size === 2) {
        const [a, b] = [...aktiva.values()];
        const s = Math.min(4, Math.max(0.3, nyp.s * Math.hypot(a.x - b.x, a.y - b.y) / nyp.d));
        S.kam.x = nyp.mx - (nyp.mx - nyp.kx) * s / nyp.s;
        S.kam.y = nyp.my - (nyp.my - nyp.ky) * s / nyp.s;
        S.kam.s = s;
        rita();
      } else if (start) {
        const dx = e.clientX - start.x, dy = e.clientY - start.y;
        if (Math.abs(dx) + Math.abs(dy) > 6) start.flyttad = true;
        if (start.flyttad) { S.kam.x = start.kx + dx; S.kam.y = start.ky + dy; rita(); }
      }
    });
    const slut = (e) => {
      if (!aktiva.has(e.pointerId)) return;
      aktiva.delete(e.pointerId);
      if (aktiva.size < 2) nyp = null;
      if (aktiva.size === 0 && start) {
        if (!start.flyttad && e.type === 'pointerup') {
          const r = canvas.getBoundingClientRect();
          const d = distriktVid(e.clientX - r.left, e.clientY - r.top);
          if (S.onValj) S.onValj(d ? d.namn : null);
        }
        start = null;
      }
    };
    canvas.addEventListener('pointerup', slut);
    canvas.addEventListener('pointercancel', slut);
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const r = canvas.getBoundingClientRect();
      const mx = e.clientX - r.left, my = e.clientY - r.top;
      const s = Math.min(4, Math.max(0.3, S.kam.s * Math.exp(-e.deltaY / 400)));
      S.kam.x = mx - (mx - S.kam.x) * s / S.kam.s;
      S.kam.y = my - (my - S.kam.y) * s / S.kam.s;
      S.kam.s = s;
      rita();
    }, { passive: false });
  }

  // ---------- Start ----------
  function storleksandra() {
    const r = S.canvas.getBoundingClientRect();
    S.dpr = Math.min(3, window.devicePixelRatio || 1);
    S.w = r.width; S.h = r.height;
    S.canvas.width = Math.round(r.width * S.dpr);
    S.canvas.height = Math.round(r.height * S.dpr);
  }

  function loop(t) {
    S.tid = t;
    if (S.anim && !document.hidden) rita();
    requestAnimationFrame(loop);
  }

  function starta(canvas, repon, opts) {
    S.canvas = canvas;
    S.ctx = canvas.getContext('2d');
    S.onValj = (opts && opts.onValj) || null;
    S.anim = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    S.stad = bygg(repon);
    storleksandra();
    centrera();
    pekare(canvas);
    window.addEventListener('resize', () => { storleksandra(); centrera(); });
    requestAnimationFrame(loop);
    S.klar = true;
  }

  // Bygger om staden med nya repon (t.ex. efter hämtning från GitHub)
  function sattRepon(repon) {
    S.stad = bygg(repon);
    S.vald = null;
    if (S.canvas) centrera();
  }

  function sattTema(tema) {
    S.tema = tema === 'light' ? 'light' : 'dark';
    rita();
  }

  // Sammanfattning av staden (används av HUD:en och testerna)
  function lage() {
    if (!S.stad) return null;
    return {
      distrikt: S.stad.distrikt.map((d) => ({ namn: d.namn, zon: d.zon, gammal: d.gammal, hus: d.hus.filter((t) => t.typ === 'hus' || t.typ === 'torn').length })),
      brander: S.stad.distrikt.filter((d) => d.hus.some((t) => t.brand)).map((d) => d.namn),
      byggen: S.stad.distrikt.filter((d) => d.hus.some((t) => t.typ === 'bygge')).map((d) => d.namn),
      torn: S.stad.distrikt.filter((d) => d.hus.some((t) => t.typ === 'torn')).map((d) => d.namn),
      bilar: S.stad.bilar.length,
      kamera: { ...S.kam },
      bredd: (S.stad.storlek.i + S.stad.storlek.j) * TW / 2 * S.kam.s,
      tema: S.tema,
      vald: S.vald
    };
  }

  window.CsStad = {
    starta, rita, centrera, valj, fokus, sattRepon, sattTema, lage, skarmpunkt, bygg, zonFor, ZON,
    get klar() { return S.klar; }
  };
})();
