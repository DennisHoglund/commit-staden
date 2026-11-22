// Hämtar Dennis repon från GitHubs API och gör om dem till stadens datamodell.
// Token sparas bara i telefonen (localStorage) och används bara för att läsa.
// Exponeras som window.CsGithub.
(function () {
  'use strict';

  const API = 'https://api.github.com';
  const TOKEN_KEY = 'cs-token';
  const CACHE_KEY = 'cs-stad-cache';
  const MAX_REPON = 30;
  const SAMTIDIGA = 6;
  const BYTE_PER_RAD = 35; // ungefärligt antal tecken per kodrad

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} }
  };

  class GhFel extends Error {
    constructor(typ, text) { super(text); this.typ = typ; }
  }

  function token() { return store.get(TOKEN_KEY); }
  function sparaToken(t) { store.set(TOKEN_KEY, t); }
  function glomToken() { store.del(TOKEN_KEY); store.del(CACHE_KEY); }

  function rimligToken(t) {
    return /^(github_pat_|ghp_)[A-Za-z0-9_]{10,}$/.test(String(t || '').trim());
  }

  function lasCache() {
    try {
      const c = JSON.parse(store.get(CACHE_KEY) || 'null');
      return c && Array.isArray(c.repon) ? c : null;
    } catch (e) { return null; }
  }
  function sparaCache(c) { store.set(CACHE_KEY, JSON.stringify(c)); }

  async function api(path, tok, opts) {
    let res;
    try {
      res = await fetch(API + path, { headers: { Authorization: 'Bearer ' + tok, Accept: 'application/vnd.github+json' } });
    } catch (e) {
      throw new GhFel('nat', 'Kunde inte nå GitHub.');
    }
    if (res.status === 401) throw new GhFel('token', 'GitHub godtar inte token. Den kan ha gått ut eller vara felinklistrad.');
    if ((res.status === 403 || res.status === 429) && res.headers.get('x-ratelimit-remaining') === '0') {
      throw new GhFel('grans', 'GitHub har tillfälligt stoppat hämtningen (för många anrop). Försök igen om en stund.');
    }
    if (opts && opts.tillat && opts.tillat.includes(res.status)) return { data: null, res };
    if (!res.ok) throw new GhFel('http', 'GitHub svarade ' + res.status + ' för ' + path.split('?')[0] + '.');
    return { data: await res.json(), res };
  }

  // Antal sidor enligt Link-huvudet = antal poster när per_page=1
  function antalFranLink(res, langd) {
    const link = res.headers.get('link') || '';
    const m = link.match(/[?&]page=(\d+)[^>]*>;\s*rel="last"/);
    return m ? parseInt(m[1], 10) : langd;
  }

  async function pool(lista, n, fn) {
    const ut = new Array(lista.length);
    let nasta = 0;
    async function arbetare() {
      while (nasta < lista.length) {
        const i = nasta++;
        ut[i] = await fn(lista[i], i);
      }
    }
    await Promise.all(Array.from({ length: Math.min(n, lista.length) }, arbetare));
    return ut;
  }

  const forstaRad = (s) => String(s || '').split('\n')[0].trim();

  // Varför brinner det? Workflow, steg som föll och felmeddelanden (annoteringar)
  async function brandorsak(full, run, tok) {
    const brand = {
      workflow: run.name || 'Workflow',
      steg: [],
      fel: [],
      sha: (run.head_sha || '').slice(0, 7),
      meddelande: forstaRad(run.head_commit && run.head_commit.message),
      vem: (run.triggering_actor && run.triggering_actor.login) || (run.actor && run.actor.login) || '',
      tid: run.updated_at || run.created_at || '',
      url: run.html_url || ''
    };
    try {
      const { data } = await api('/repos/' + full + '/actions/runs/' + run.id + '/jobs?per_page=30', tok);
      const fallna = (data.jobs || []).filter((j) => j.conclusion === 'failure' || j.conclusion === 'timed_out');
      fallna.forEach((j) => {
        const steg = (j.steps || []).filter((s) => s.conclusion === 'failure').map((s) => s.name);
        brand.steg.push(j.name + (steg.length ? ' › ' + steg.join(', ') : ''));
      });
      for (const j of fallna.slice(0, 2)) {
        try {
          const a = await api('/repos/' + full + '/check-runs/' + j.id + '/annotations?per_page=30', tok);
          (a.data || [])
            .filter((x) => x.annotation_level === 'failure')
            .map((x) => (x.title ? forstaRad(x.title) + ': ' : '') + forstaRad(x.message))
            .filter((t) => t && !/^Process completed with exit code/.test(t))
            .forEach((t) => { if (brand.fel.length < 4 && !brand.fel.includes(t)) brand.fel.push(t); });
        } catch (e) { if (e.typ === 'token') throw e; }
      }
    } catch (e) { if (e.typ === 'token') throw e; }
    return brand;
  }

  async function ciLage(full, gren, tok) {
    const { data } = await api('/repos/' + full + '/actions/runs?per_page=30&exclude_pull_requests=true&branch=' + encodeURIComponent(gren), tok, { tillat: [404] });
    const runs = (data && data.workflow_runs) || [];
    if (!runs.length) return { ci: '', ciAndel: null, brand: null };
    const klara = runs.filter((r) => r.status === 'completed' && r.conclusion !== 'skipped' && r.conclusion !== 'cancelled');
    const andel = klara.length ? klara.filter((r) => r.conclusion === 'success').length / klara.length : null;
    // Senaste avslutade körningen per workflow
    const senast = new Map();
    klara.forEach((r) => { if (!senast.has(r.workflow_id)) senast.set(r.workflow_id, r); });
    const roda = [...senast.values()].filter((r) => r.conclusion === 'failure' || r.conclusion === 'timed_out');
    if (roda.length) return { ci: 'fel', ciAndel: andel, brand: await brandorsak(full, roda[0], tok) };
    if (!klara.length) return { ci: 'pagar', ciAndel: null, brand: null };
    return { ci: runs[0].status !== 'completed' ? 'pagar' : 'ok', ciAndel: andel, brand: null };
  }

  async function repoData(r, tok) {
    const full = r.full_name;
    const gren = r.default_branch || 'main';
    const vecka = new Date(Date.now() - 7 * 86400000).toISOString();
    const [commits, veckans, sprak, pulls, release, ci] = await Promise.all([
      api('/repos/' + full + '/commits?per_page=1&sha=' + encodeURIComponent(gren), tok, { tillat: [404, 409] }),
      api('/repos/' + full + '/commits?per_page=100&since=' + vecka + '&sha=' + encodeURIComponent(gren), tok, { tillat: [404, 409] }),
      api('/repos/' + full + '/languages', tok, { tillat: [404] }),
      api('/repos/' + full + '/pulls?state=open&per_page=100', tok, { tillat: [404] }),
      api('/repos/' + full + '/releases/latest', tok, { tillat: [404] }),
      ciLage(full, gren, tok)
    ]);
    const senasteCommit = commits.data && commits.data[0];
    const bytes = sprak.data ? Object.values(sprak.data).reduce((s, n) => s + n, 0) : 0;
    const prOppna = pulls.data ? pulls.data.length : 0;
    return {
      namn: r.name,
      sprak: r.language || '',
      commits: commits.data ? antalFranLink(commits.res, commits.data.length) : 0,
      rader: Math.round(bytes / BYTE_PER_RAD),
      veckans: veckans.data ? veckans.data.length : 0,
      ci: ci.ci,
      ciAndel: ci.ciAndel,
      brand: ci.brand,
      prOppna,
      issues: Math.max(0, (r.open_issues_count || 0) - prOppna),
      senast: senasteCommit ? (senasteCommit.commit.committer || senasteCommit.commit.author).date : r.pushed_at,
      release: release.data ? release.data.tag_name : '',
      url: r.html_url,
      privat: !!r.private,
      arkiverad: !!r.archived
    };
  }

  // Hämtar allt. framsteg(klara, totalt) anropas under tiden.
  async function hamta(tok, framsteg) {
    const { data: anv } = await api('/user', tok);
    const { data: alla } = await api('/user/repos?per_page=100&affiliation=owner&sort=pushed', tok);
    const lista = (alla || []).filter((r) => !r.fork).slice(0, MAX_REPON);
    let klara = 0;
    if (framsteg) framsteg(0, lista.length);
    const repon = await pool(lista, SAMTIDIGA, async (r) => {
      const d = await repoData(r, tok);
      klara++;
      if (framsteg) framsteg(klara, lista.length);
      return d;
    });
    const resultat = { login: anv.login, tid: new Date().toISOString(), repon };
    sparaCache(resultat);
    return resultat;
  }

  window.CsGithub = { token, sparaToken, glomToken, rimligToken, lasCache, hamta, GhFel };
})();
