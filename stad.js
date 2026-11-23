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

    // Bilar: några på vägarna runt varje distrikt (trafik). Väg och riktning slumpas per bil
    // (stabilt via hash). Bilar i samma fil kör lika fort och fördelas jämnt längs filen,
    // så att de aldrig kör igenom varandra.
    const bilar = [];
    distrikt.forEach((d) => {
      const n = 1 + Math.min(6, d.repo.issues || 0);
      for (let m = 0; m < n; m++) {
        const langsI = hash(d.namn, m, 'vag') < 0.5;
        bilar.push({
          langsI,
          fast: langsI ? d.j0 - 1 : d.i0 - 1,
          rikt: hash(d.namn, m, 'rikt') < 0.5 ? 1 : -1,
          fart: 0.9,
          farg: Math.floor(hash(d.namn, m, 'farg') * 3)
        });
      }
    });
    const filer = new Map();
    bilar.forEach((b) => {
      const k = b.langsI + ':' + b.fast + ':' + b.rikt;
      if (!filer.has(k)) filer.set(k, []);
      filer.get(k).push(b);
    });
    filer.forEach((lista, k) => {
      const len = lista[0].langsI ? storlek.i : storlek.j;
      const bas = hash(k) * len;
      lista.forEach((b, n) => { b.start = (bas + n * len / lista.length) % len; });
    });

    // Brandbilar: en per brinnande distrikt, parkerad på vägen ovanför huset som brinner
    const brandbilar = [];
    distrikt.forEach((d) => {
      const t = d.hus.find((x) => x.brand);
      if (t) brandbilar.push({ namn: d.namn, i: t.i, j: d.j0 - 1, langsI: true, rikt: 1, typ: 'brandbil', parkerad: true, brand: t });
    });

    return { storlek, distrikt, bilar, brandbilar };
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

  // Liten 3D-bil: kaross och tak som lådor längs vägen, strålkastare fram och bakljus bak.
  // a = halva längden i färdriktningen, b = halva bredden (skärmvektorer).
  const BILFARG = [
    ['#EAFBEF', '#BFD6C6', '#93AC9B'],
    ['#7FFFE0', '#4FCDB2', '#329A85'],
    ['#FFC25A', '#D69A36', '#A87520']
  ];
  const ROD = ['#FF5A4A', '#D23C2E', '#A12A20'];
  function lada3(ctx, p, a, b, z0, z1, f) {
    const pt = (sa, sb, z) => [p.x + sa * a.x + sb * b.x, p.y + sa * a.y + sb * b.y - z];
    const sA = a.y >= 0 ? 1 : -1, sB = b.y >= 0 ? 1 : -1;
    poly(ctx, [...pt(sA, -1, z0), ...pt(sA, 1, z0), ...pt(sA, 1, z1), ...pt(sA, -1, z1)], f[2]);
    poly(ctx, [...pt(-1, sB, z0), ...pt(1, sB, z0), ...pt(1, sB, z1), ...pt(-1, sB, z1)], f[1]);
    poly(ctx, [...pt(-1, -1, z1), ...pt(1, -1, z1), ...pt(1, 1, z1), ...pt(-1, 1, z1)], f[0]);
    return pt;
  }
  function bil(ctx, i, j, b0) {
    const ui = { x: TW / 2, y: TH / 2 }, uj = { x: -TW / 2, y: TH / 2 };
    const ax = b0.langsI ? ui : uj, vx = b0.langsI ? uj : ui;
    const L = b0.typ === 'brandbil' ? 0.42 : 0.3;
    const a = { x: ax.x * L * b0.rikt, y: ax.y * L * b0.rikt };
    const b = { x: vx.x * 0.11, y: vx.y * 0.11 };
    const p = iso(i, j);
    const natt = S.tema === 'dark';
    // Skugga
    poly(ctx, [p.x - a.x - b.x, p.y - a.y - b.y + 1, p.x + a.x - b.x, p.y + a.y - b.y + 1, p.x + a.x + b.x, p.y + a.y + b.y + 1, p.x - a.x + b.x, p.y - a.y + b.y + 1], natt ? 'rgba(0,0,0,.35)' : 'rgba(15,42,24,.18)');
    // Ljuskägla framför bilen på natten
    if (natt && !b0.parkerad) {
      ctx.globalAlpha = 0.16;
      poly(ctx, [p.x + a.x - b.x * 0.8, p.y + a.y - b.y * 0.8, p.x + a.x * 3.2 - b.x * 1.8, p.y + a.y * 3.2 - b.y * 1.8,
        p.x + a.x * 3.2 + b.x * 1.8, p.y + a.y * 3.2 + b.y * 1.8, p.x + a.x + b.x * 0.8, p.y + a.y + b.y * 0.8], '#FFE9A0');
      ctx.globalAlpha = 1;
    }
    const f = b0.typ === 'brandbil' ? ROD : b0.typ === 'taxi' ? BILFARG[2] : BILFARG[b0.farg % BILFARG.length];
    const glas = natt ? '#14201A' : '#3A4A42';
    const pt = lada3(ctx, p, a, b, 0.6, b0.typ === 'brandbil' ? 4.6 : 4.2, f);
    if (b0.typ === 'brandbil') {
      // Hytt fram, stege på taket och blinkande blåljus
      const pc = { x: p.x + a.x * 0.6, y: p.y + a.y * 0.6 };
      lada3(ctx, pc, { x: a.x * 0.32, y: a.y * 0.32 }, { x: b.x * 0.9, y: b.y * 0.9 }, 4.6, 8, [f[0], glas, glas]);
      for (let k = 0; k < 5; k++) {
        const t = -0.8 + k * 0.28;
        const q = { x: p.x + a.x * t, y: p.y + a.y * t - 5.6 };
        poly(ctx, [q.x - b.x * 0.5, q.y - b.y * 0.5, q.x + b.x * 0.5, q.y + b.y * 0.5, q.x + b.x * 0.5, q.y + b.y * 0.5 - 0.7, q.x - b.x * 0.5, q.y - b.y * 0.5 - 0.7], '#E6ECE8');
      }
      const lp = { x: p.x + a.x * 0.6, y: p.y + a.y * 0.6 - 8.8 };
      const fas = S.anim ? Math.floor(S.tid / 250) % 2 : 0;
      ctx.fillStyle = fas ? '#1C3A8A' : '#3D7BFF';
      ctx.fillRect(lp.x - 3, lp.y - 1.6, 2.6, 1.8);
      ctx.fillStyle = fas ? '#3D7BFF' : '#1C3A8A';
      ctx.fillRect(lp.x + 0.4, lp.y - 1.6, 2.6, 1.8);
      if (natt) {
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = '#3D7BFF';
        ctx.beginPath(); ctx.arc(lp.x + (fas ? 1.7 : -1.7), lp.y, 9, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      }
    } else {
      // Tak med mörka rutor, lite bakåt
      const pc = { x: p.x - a.x * 0.15, y: p.y - a.y * 0.15 };
      lada3(ctx, pc, { x: a.x * 0.55, y: a.y * 0.55 }, { x: b.x * 0.85, y: b.y * 0.85 }, 4.2, 7, [f[0], glas, glas]);
      if (b0.typ === 'taxi') {
        const q = { x: pc.x, y: pc.y - 7 };
        poly(ctx, [q.x - 2.6, q.y, q.x, q.y + 1.3, q.x + 2.6, q.y, q.x + 2.6, q.y - 2.4, q.x, q.y - 1.1, q.x - 2.6, q.y - 2.4], '#FFF3C4');
        ctx.font = '700 2.2px Geist, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#2B2313';
        ctx.fillText('TAXI', q.x, q.y - 0.6);
      }
    }
    // Strålkastare om fronten syns, annars bakljus
    const fram = a.y >= 0;
    const sida = fram ? 1 : -1;
    const lampa = fram ? '#FFE9A0' : '#FF4A3D';
    [-0.62, 0.62].forEach((sb) => {
      const q = (d, z) => pt(sida, sb + d, z);
      poly(ctx, [...q(-0.22, 1.6), ...q(0.22, 1.6), ...q(0.22, 3), ...q(-0.22, 3)], lampa);
    });
  }

  function rita() {
    const { ctx, stad } = S;
    if (!ctx || !stad) return;
    const P = PALETT[S.tema];
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = P.bg;
    ctx.fillRect(0, 0, S.canvas.width, S.canvas.height);
    himmel(ctx);
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
    stad.brandbilar.forEach((b) => objekt.push({ z: b.i + b.j + 0.01, bil: b, i: b.i, j: b.j }));
    const taxi = taxiLage();
    if (taxi) {
      // Streckad rutt fram till målet
      const fil = taxi.rikt > 0 ? 0.24 : -0.24;
      const a0 = iso(taxi.i, taxi.j + fil), a1 = iso(S.taxi.slut, taxi.j + fil);
      ctx.strokeStyle = '#FFC25A';
      ctx.lineWidth = 1.6;
      ctx.setLineDash([4, 4]);
      ctx.lineDashOffset = S.anim ? -S.tid / 60 : 0;
      ctx.beginPath(); ctx.moveTo(a0.x, a0.y); ctx.lineTo(a1.x, a1.y); ctx.stroke();
      ctx.setLineDash([]);
      objekt.push({ z: taxi.i + taxi.j + 0.01, bil: { langsI: true, rikt: taxi.rikt, typ: 'taxi', farg: 2 }, i: taxi.i, j: taxi.j });
    }
    objekt.sort((a, b) => a.z - b.z);

    for (const o of objekt) {
      if (o.bil) {
        // Högertrafik: körfältet förskjuts åt sidan beroende på riktning
        const fil = o.bil.rikt > 0 ? 0.24 : -0.24;
        bil(ctx, o.bil.langsI ? o.i : o.i - fil, o.bil.langsI ? o.j + fil : o.j, o.bil);
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

    // Vattenstråle från brandbilen till branden
    stad.brandbilar.forEach((b) => {
      const p0 = iso(b.i, b.j + 0.24), p1 = iso(b.brand.i, b.brand.j);
      const y0 = p0.y - 9, y1 = p1.y - b.brand.h - 4;
      ctx.strokeStyle = '#9AD8FF';
      ctx.lineWidth = 1.8;
      ctx.globalAlpha = 0.9;
      ctx.setLineDash([4, 3]);
      ctx.lineDashOffset = S.anim ? -S.tid / 40 : 0;
      ctx.beginPath();
      ctx.moveTo(p0.x, y0);
      ctx.quadraticCurveTo((p0.x + p1.x) / 2, Math.min(y0, y1) - 34, p1.x, y1);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    });

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

    // Följ taxin med kameran
    if (taxi && !S.taxi.framme) {
      const p = iso(taxi.i, taxi.j);
      S.kam.s += (Math.max(1.7, S.kam.s) - S.kam.s) * 0.06; // zooma in lite under resan
      S.kam.x += (S.w / 2 - p.x * S.kam.s - S.kam.x) * 0.15;
      S.kam.y += (S.h * 0.5 - p.y * S.kam.s - S.kam.y) * 0.15;
    }

    vader(ctx);
  }

  // ---------- Väder: himlen visar hur byggena mår ----------
  // 0 bränder = klart, 1 = mulet med duggregn, 2 eller fler = åska.
  function vaderFor(stad) {
    const n = stad.distrikt.filter((d) => d.hus.some((t) => t.brand)).length;
    return n === 0 ? 'klart' : n === 1 ? 'mulet' : 'aska';
  }
  // Jämnt utspridda slumptal (mulberry32), samma varje gång
  function slump(fro) {
    let a = fro >>> 0;
    return () => {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const r1 = slump(11), r2 = slump(22), r3 = slump(33);
  const DROPPAR = Array.from({ length: 120 }, () => ({ x: r1(), y: r1(), v: 0.8 + r1() * 0.5 }));
  const MOLN = Array.from({ length: 9 }, (_, k) => ({ x: (k + r2() * 0.6) / 9, y: r2(), r: 14 + r2() * 14 }));
  const STJARNOR = Array.from({ length: 60 }, () => ({ x: r3(), y: r3(), r: 0.5 + r3(), a: 0.3 + r3() * 0.6 }));

  function himmel(ctx) {
    if (S.vader !== 'klart') return;
    ctx.setTransform(S.dpr, 0, 0, S.dpr, 0, 0);
    if (S.tema === 'dark') {
      STJARNOR.forEach((st, k) => {
        const blink = S.anim ? 0.75 + 0.25 * Math.sin(S.tid / 900 + k) : 1;
        ctx.globalAlpha = st.a * blink;
        ctx.fillStyle = '#CFE8D6';
        ctx.beginPath(); ctx.arc(st.x * S.w, st.y * S.h * 0.8, st.r, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;
      const mx = S.w - 54, my = 176;
      ctx.fillStyle = '#E8F5EC';
      ctx.beginPath(); ctx.arc(mx, my, 13, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = PALETT.dark.bg;
      ctx.beginPath(); ctx.arc(mx + 6, my - 4, 12, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = '#FFE08A';
      ctx.beginPath(); ctx.arc(S.w - 54, 176, 30, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#FFD25A';
      ctx.beginPath(); ctx.arc(S.w - 54, 176, 16, 0, Math.PI * 2); ctx.fill();
    }
  }

  function vader(ctx) {
    if (S.vader === 'klart') return;
    ctx.setTransform(S.dpr, 0, 0, S.dpr, 0, 0);
    const t = S.anim ? S.tid : 0;
    const aska = S.vader === 'aska';
    const natt = S.tema === 'dark';
    // Regn (duggregn vid mulet)
    const antal = aska ? DROPPAR.length : 35;
    ctx.strokeStyle = natt ? 'rgba(127,167,201,.55)' : 'rgba(70,100,130,.45)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let k = 0; k < antal; k++) {
      const d = DROPPAR[k];
      const y = (d.y * S.h + t * 0.5 * d.v) % S.h;
      const x = ((d.x * (S.w + 40) - (t * 0.12 * d.v)) % (S.w + 40) + S.w + 40) % (S.w + 40) - 20;
      const l = aska ? 12 : 7;
      ctx.moveTo(x, y); ctx.lineTo(x - l * 0.3, y + l);
    }
    ctx.stroke();
    // Moln som driver förbi, under HUD:en
    const molnFarg = natt ? (aska ? 'rgba(22,30,26,.82)' : 'rgba(40,52,45,.6)') : (aska ? 'rgba(110,125,118,.7)' : 'rgba(170,185,176,.55)');
    ctx.fillStyle = molnFarg;
    MOLN.forEach((m) => {
      const x = ((m.x * (S.w + 120) + t * 0.008) % (S.w + 120)) - 60;
      const y = 150 + m.y * 50;
      ctx.beginPath();
      ctx.arc(x, y, m.r, 0, Math.PI * 2);
      ctx.arc(x + m.r * 0.9, y + 6, m.r * 0.75, 0, Math.PI * 2);
      ctx.arc(x - m.r * 0.9, y + 8, m.r * 0.65, 0, Math.PI * 2);
      ctx.fill();
    });
    // Blixt var 5:e sekund vid åska
    if (aska && S.anim) {
      const fas = S.tid % 5000;
      if (fas < 180) {
        ctx.fillStyle = 'rgba(220,232,255,' + (fas < 60 || fas > 120 ? 0.18 : 0.06) + ')';
        ctx.fillRect(0, 0, S.w, S.h);
        const x0 = S.w * (0.3 + hash('blixt', Math.floor(S.tid / 5000)) * 0.4);
        ctx.strokeStyle = '#FFF7C2';
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(x0, 170); ctx.lineTo(x0 - 12, 220); ctx.lineTo(x0 + 2, 222); ctx.lineTo(x0 - 14, 280);
        ctx.stroke();
      }
    }
  }

  // ---------- Taxi till ett distrikt ----------
  function taxiLage() {
    if (!S.taxi) return null;
    const x = S.taxi;
    const nu = performance.now();
    const k = x.framme ? 1 : Math.min(1, (nu - x.t0) / x.dur);
    const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; // mjuk start och inbromsning
    if (k >= 1 && !x.framme) {
      x.framme = true;
      setTimeout(() => { if (x.cb) x.cb(); }, 0);
    }
    return { i: x.start + e * (x.slut - x.start), j: x.j, rikt: x.slut >= x.start ? 1 : -1 };
  }

  function taxiTill(namn, cb) {
    const d = S.stad && S.stad.distrikt.find((x) => x.namn === namn);
    if (!d) return false;
    // Taxin startar på den bortre sidan av staden så att resan syns
    const slut = d.i0 + 1.5;
    const start = slut < S.stad.storlek.i / 2 ? S.stad.storlek.i - 0.5 : 0;
    const langd = Math.abs(slut - start);
    S.vald = null;
    S.taxi = { namn, j: d.j0 - 1, start, slut, t0: performance.now(), dur: Math.min(4000, Math.max(2000, langd / 3.5 * 1000)), framme: false, cb };
    if (!S.anim) { S.taxi.framme = true; setTimeout(cb, 0); }
    rita();
    return true;
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
    if (!namn) S.taxi = null;
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
    S.vader = vaderFor(S.stad);
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
    S.vader = vaderFor(S.stad);
    S.vald = null;
    S.taxi = null;
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
      bilRiktningar: [...new Set(S.stad.bilar.map((b) => (b.langsI ? 'i' : 'j') + ':' + b.rikt))],
      kamera: { ...S.kam },
      bredd: (S.stad.storlek.i + S.stad.storlek.j) * TW / 2 * S.kam.s,
      tema: S.tema,
      vader: S.vader,
      brandbilar: S.stad.brandbilar.map((b) => b.namn),
      taxi: S.taxi ? { namn: S.taxi.namn, framme: S.taxi.framme } : null,
      vald: S.vald
    };
  }

  window.CsStad = {
    starta, rita, centrera, valj, fokus, sattRepon, taxi: taxiTill, sattTema, lage, skarmpunkt, bygg, zonFor, ZON,
    get klar() { return S.klar; }
  };
})();
