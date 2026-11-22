// Mockar all extern trafik så att testerna är stabila och snabba.
// - Google Fonts ersätts med tomma svar
// - GitHubs API är en fejkad server med testdata (api.github)
// - allt annat externt stoppas
const TOKEN = 'github_pat_RATTTOKEN123456';

const dagar = (n) => new Date(Date.now() - n * 86400000).toISOString();

function testdata() {
  return {
    login: 'testdennis',
    repos: [
      { name: 'alfa', language: 'JavaScript', open_issues_count: 4, archived: false, fork: false, private: false, default_branch: 'main', pushed_at: dagar(0) },
      { name: 'beta', language: 'C#', open_issues_count: 0, archived: false, fork: false, private: true, default_branch: 'main', pushed_at: dagar(1) },
      { name: 'gamma', language: 'HTML', open_issues_count: 0, archived: false, fork: false, private: false, default_branch: 'master', pushed_at: dagar(4400) },
      { name: 'en-fork', language: 'Go', open_issues_count: 0, archived: false, fork: true, private: false, default_branch: 'main', pushed_at: dagar(2) }
    ].map((r) => ({ ...r, full_name: 'testdennis/' + r.name, html_url: 'https://github.com/testdennis/' + r.name })),
    commits: { alfa: 120, beta: 45, gamma: 12 },
    veckans: { alfa: 9, beta: 3, gamma: 0 },
    senast: { alfa: dagar(0), beta: dagar(1), gamma: dagar(4400) }, // gamma: ca 12 år sedan
    sprak: { alfa: { JavaScript: 70000, CSS: 7000 }, beta: { 'C#': 52500 }, gamma: { HTML: 3500 } },
    pulls: { alfa: 1, beta: 0, gamma: 0 },
    release: { alfa: 'v1.2' },
    runs: {
      alfa: [{ id: 11, workflow_id: 1, name: 'Tester', status: 'completed', conclusion: 'success' }, { id: 10, workflow_id: 1, name: 'Tester', status: 'completed', conclusion: 'failure' }],
      beta: [{
        id: 77, workflow_id: 2, name: 'Tester', status: 'completed', conclusion: 'failure',
        head_sha: 'abc1234def567', head_commit: { message: 'Ny inloggning\n\nMed e-post och lösenord' },
        triggering_actor: { login: 'testdennis' }, updated_at: new Date(Date.now() - 2 * 3600000).toISOString(),
        html_url: 'https://github.com/testdennis/beta/actions/runs/77'
      }, { id: 76, workflow_id: 2, name: 'Tester', status: 'completed', conclusion: 'success' }],
      gamma: []
    },
    jobs: {
      77: [{ id: 501, name: 'Testa och publicera', conclusion: 'failure', steps: [{ name: 'Installera beroenden', conclusion: 'success' }, { name: 'Kör Playwright-testerna', conclusion: 'failure' }] }]
    },
    annotations: {
      501: [
        { annotation_level: 'failure', title: 'inloggning.spec.js:12 › Fel lösenord', message: 'Expected "Fel lösenord", received ""\nmer text' },
        { annotation_level: 'warning', title: 'varning', message: 'ska inte visas' },
        { annotation_level: 'failure', title: '', message: 'Process completed with exit code 1.' }
      ]
    }
  };
}

async function mocka(page) {
  const gh = testdata();
  const api = { anrop: [], github: gh, nere: false, token: TOKEN, authHeaders: [] };

  await page.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, (route) =>
    route.fulfill({ status: 200, contentType: 'text/css', body: '' }));

  await page.route(/^https:\/\/api\.github\.com\//, async (route) => {
    const req = route.request();
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Authorization, Accept',
      'Access-Control-Expose-Headers': 'Link, X-RateLimit-Remaining'
    };
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
    if (api.nere) return route.abort('internetdisconnected');
    const url = new URL(req.url());
    api.anrop.push(url.pathname + url.search);
    const auth = (await req.allHeaders()).authorization || '';
    api.authHeaders.push(auth);
    const svara = (status, body, extra) => route.fulfill({ status, headers: { ...cors, ...(extra || {}) }, contentType: 'application/json', body: JSON.stringify(body) });
    if (auth !== 'Bearer ' + TOKEN) return svara(401, { message: 'Bad credentials' });

    const p = url.pathname;
    let m;
    if (p === '/user') return svara(200, { login: gh.login });
    if (p === '/user/repos') return svara(200, gh.repos);
    if ((m = p.match(/^\/repos\/testdennis\/([\w-]+)\/commits$/))) {
      const n = m[1];
      if (url.searchParams.get('since')) return svara(200, Array.from({ length: gh.veckans[n] || 0 }, () => ({})));
      const antal = gh.commits[n] || 0;
      const commit = { commit: { committer: { date: gh.senast[n] } } };
      return svara(200, antal ? [commit] : [], antal > 1 ? { Link: '<https://api.github.com/x?per_page=1&page=2>; rel="next", <https://api.github.com/x?per_page=1&page=' + antal + '>; rel="last"' } : {});
    }
    if ((m = p.match(/^\/repos\/testdennis\/([\w-]+)\/languages$/))) return svara(200, gh.sprak[m[1]] || {});
    if ((m = p.match(/^\/repos\/testdennis\/([\w-]+)\/pulls$/))) return svara(200, Array.from({ length: gh.pulls[m[1]] || 0 }, (_, i) => ({ number: i + 1 })));
    if ((m = p.match(/^\/repos\/testdennis\/([\w-]+)\/releases\/latest$/))) return gh.release[m[1]] ? svara(200, { tag_name: gh.release[m[1]] }) : svara(404, { message: 'Not Found' });
    if ((m = p.match(/^\/repos\/testdennis\/([\w-]+)\/actions\/runs$/))) return svara(200, { workflow_runs: gh.runs[m[1]] || [] });
    if ((m = p.match(/^\/repos\/testdennis\/[\w-]+\/actions\/runs\/(\d+)\/jobs$/))) return svara(200, { jobs: gh.jobs[m[1]] || [] });
    if ((m = p.match(/^\/repos\/testdennis\/[\w-]+\/check-runs\/(\d+)\/annotations$/))) return svara(200, gh.annotations[m[1]] || []);
    return svara(404, { message: 'Not Found' });
  });

  await page.route((url) => url.hostname !== '127.0.0.1' && url.hostname !== 'api.github.com' && !/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname), (route) => {
    api.anrop.push(route.request().url());
    return route.abort();
  });
  return api;
}

// Sparar token i telefonen innan sidan laddas (som om man redan anslutit)
async function ansluten(page) {
  await page.addInitScript((t) => {
    try {
      if (!sessionStorage.getItem('cs-test-token')) { localStorage.setItem('cs-token', t); sessionStorage.setItem('cs-test-token', '1'); }
    } catch (e) {}
  }, TOKEN);
}

module.exports = { mocka, ansluten, TOKEN };
