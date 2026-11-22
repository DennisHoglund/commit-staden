// Demodata tills riktiga repon hämtas från GitHub (steg 2).
// Exponeras som window.CsDemo. Siffrorna är påhittade.
(function () {
  'use strict';

  const dagar = (n) => new Date(Date.now() - n * 86400000).toISOString();

  const repon = [
    { namn: 'svampkartan', sprak: 'JavaScript', commits: 214, rader: 9840, veckans: 23, ci: 'ok', ciAndel: 0.95, prOppna: 0, issues: 1, senast: dagar(1), release: 'v2.0' },
    { namn: 'jaktvind', sprak: 'JavaScript', commits: 183, rader: 6420, veckans: 12, ci: 'ok', ciAndel: 0.92, prOppna: 0, issues: 2, senast: dagar(0) },
    { namn: 'kaloriappen', sprak: 'JavaScript', commits: 121, rader: 4870, veckans: 31, ci: 'ok', ciAndel: 0.88, prOppna: 1, issues: 0, senast: dagar(0) },
    { namn: 'elkoll', sprak: 'TypeScript', commits: 96, rader: 5120, veckans: 8, ci: 'fel', ciAndel: 0.61, prOppna: 0, issues: 4, senast: dagar(0) },
    { namn: 'virkesfynd', sprak: 'JavaScript', commits: 88, rader: 3960, veckans: 0, ci: 'ok', ciAndel: 0.97, prOppna: 0, issues: 0, senast: dagar(12) },
    { namn: 'tillsatskoll', sprak: 'HTML', commits: 74, rader: 3310, veckans: 15, ci: 'ok', ciAndel: 0.9, prOppna: 0, issues: 1, senast: dagar(2), release: 'v1.0' },
    { namn: 'hallskarm', sprak: 'C#', commits: 57, rader: 2740, veckans: 3, ci: 'ok', ciAndel: 0.85, prOppna: 0, issues: 1, senast: dagar(4) },
    { namn: 'appspec', sprak: 'CSS', commits: 41, rader: 1890, veckans: 0, ci: 'ok', ciAndel: 1, prOppna: 0, issues: 0, senast: dagar(80) },
    { namn: 'commit-staden', sprak: 'JavaScript', commits: 4, rader: 900, veckans: 4, ci: 'ok', ciAndel: 1, prOppna: 0, issues: 0, senast: dagar(0) }
  ];

  window.CsDemo = { repon };
})();
