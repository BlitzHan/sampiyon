// ===== GERÇEK FİKSTÜR VERİLERİ (19 Nisan 2026 itibarıyla) =====
const gsMatches = [
  { id: 'gs-2', week: '31. Hafta', opponent: 'Fenerbahçe', home: true, goalsFor: '', goalsAgainst: '', outcome: null },
  { id: 'gs-3', week: '32. Hafta', opponent: 'Samsunspor', home: false, goalsFor: '', goalsAgainst: '', outcome: null },
  { id: 'gs-4', week: '33. Hafta', opponent: 'Antalyaspor', home: true, goalsFor: '', goalsAgainst: '', outcome: null },
  { id: 'gs-5', week: '34. Hafta', opponent: 'Kasımpaşa', home: false, goalsFor: '', goalsAgainst: '', outcome: null },
];

const fbMatches = [
  { id: 'fb-2', week: '31. Hafta', opponent: 'Galatasaray', home: false, goalsFor: '', goalsAgainst: '', outcome: null },
  { id: 'fb-3', week: '32. Hafta', opponent: 'Başakşehir', home: true, goalsFor: '', goalsAgainst: '', outcome: null },
  { id: 'fb-4', week: '33. Hafta', opponent: 'Konyaspor', home: false, goalsFor: '', goalsAgainst: '', outcome: null },
  { id: 'fb-5', week: '34. Hafta', opponent: 'Eyüpspor', home: true, goalsFor: '', goalsAgainst: '', outcome: null },
];

const tsMatches = [
  { id: 'ts-3', week: '32. Hafta', opponent: 'Göztepe', home: true, goalsFor: '', goalsAgainst: '', outcome: null },
  { id: 'ts-4', week: '33. Hafta', opponent: 'Beşiktaş', home: false, goalsFor: '', goalsAgainst: '', outcome: null },
  { id: 'ts-5', week: '34. Hafta', opponent: 'Gençlerbirliği', home: true, goalsFor: '', goalsAgainst: '', outcome: null },
];

const bjkMatches = [
  { id: 'bjk-3', week: '32. Hafta', opponent: 'Gaziantep FK', home: false, goalsFor: '', goalsAgainst: '', outcome: null },
  { id: 'bjk-4', week: '33. Hafta', opponent: 'Trabzonspor', home: true, goalsFor: '', goalsAgainst: '', outcome: null },
  { id: 'bjk-5', week: '34. Hafta', opponent: 'Ç. Rizespor', home: false, goalsFor: '', goalsAgainst: '', outcome: null },
];

function getPoints(outcome) {
  if (outcome === 'W') return 3;
  if (outcome === 'D') return 1;
  return 0;
}

// State
const state = {
  GS: {
    basePoints: 71,
    baseGF: 69,
    baseGA: 23,
    matches: gsMatches.map(m => ({ ...m }))
  },
  FB: {
    basePoints: 67,
    baseGF: 68,
    baseGA: 30,
    matches: fbMatches.map(m => ({ ...m }))
  },
  TS: {
    basePoints: 65,
    baseGF: 56,
    baseGA: 32,
    matches: tsMatches.map(m => ({ ...m }))
  },
  BJK: {
    basePoints: 56,
    baseGF: 55,
    baseGA: 37,
    matches: bjkMatches.map(m => ({ ...m }))
  }
};

// ===== PUAN DURUMU VERİLERİ =====
const TEAMS = ['GS', 'FB', 'TS', 'BJK'];

const standingsBase = [
  { key: 'GS', name: 'Galatasaray', played: 30, won: 22, drawn: 5, lost: 3, gf: 69, ga: 23, pts: 71, dynamic: true },
  { key: 'FB', name: 'Fenerbahçe', played: 30, won: 19, drawn: 10, lost: 1, gf: 68, ga: 30, pts: 67, dynamic: true },
  { key: 'TS', name: 'Trabzonspor', played: 31, won: 19, drawn: 8, lost: 4, gf: 56, ga: 32, pts: 65, dynamic: true },
  { key: 'BJK', name: 'Beşiktaş', played: 31, won: 16, drawn: 8, lost: 7, gf: 55, ga: 37, pts: 56, dynamic: true },
];

function renderStandings() {
  const rows = standingsBase.map(team => {
    let p = team.pts, g = team.won, b = team.drawn, m = team.lost, o = team.played;
    let gf = team.gf, ga = team.ga;

    if (team.dynamic && state[team.key]) {
      const t = state[team.key];
      const earnedPts = t.matches.reduce((s, mt) => s + (mt.outcome ? getPoints(mt.outcome) : 0), 0);
      let extraGF = 0, extraGA = 0, wins = 0, draws = 0, losses = 0, played = 0;
      t.matches.forEach(mt => {
        if (mt.outcome) {
          played++;
          if (mt.outcome === 'W') wins++;
          else if (mt.outcome === 'D') draws++;
          else losses++;
        }
        const gfv = parseInt(mt.goalsFor);
        const gav = parseInt(mt.goalsAgainst);
        if (!isNaN(gfv)) extraGF += gfv;
        if (!isNaN(gav)) extraGA += gav;
      });
      p = t.basePoints + earnedPts;
      gf = t.baseGF + extraGF;
      ga = t.baseGA + extraGA;
      g = team.won + wins;
      b = team.drawn + draws;
      m = team.lost + losses;
      o = team.played + played;
    }

    return { ...team, pts: p, won: g, drawn: b, lost: m, played: o, gf, ga, av: gf - ga };
  });

  // Sort by pts desc, then av desc
  rows.sort((a, b) => b.pts - a.pts || b.av - a.av);

  const tbody = document.getElementById('standings-body');
  tbody.innerHTML = rows.map((r, i) => {
    const rowClassMap = { GS: 'row-gs', FB: 'row-fb', TS: 'row-ts', BJK: 'row-bjk' };
    const rowClass = rowClassMap[r.key] || '';
    return `<tr class="${rowClass}">
      <td>${i + 1}</td>
      <td class="team-col">
        <div class="team-name-cell">
          <div class="team-dot dot-${r.key.toLowerCase()}"></div>
          <span style="${i === 0 ? 'color: var(--brand-gs);' : ''}">${r.name}</span>
        </div>
      </td>
      <td>${r.played}</td>
      <td>${r.won}</td>
      <td>${r.drawn}</td>
      <td>${r.lost}</td>
      <td>${r.gf}</td>
      <td>${r.ga}</td>
      <td class="av-col">${r.av >= 0 ? '+' : ''}${r.av}</td>
      <td class="pts-col" style="${i === 0 ? 'color: var(--brand-gs);' : ''}"><strong>${r.pts}</strong></td>
    </tr>`;
  }).join('');

  // Mini Leaderboard Güncellemesi (Sadece Top 2)
  const top2 = rows.slice(0, 2);
  const miniBoard = document.getElementById('mini-leaderboard');
  if (miniBoard) {
    miniBoard.innerHTML = top2.map((t, index) => `
      <div class="mini-team ${index === 0 ? 'leader' : ''}">
        <div class="team-dot dot-${t.key.toLowerCase()}"></div>
        ${t.name} <span class="mini-pts">${t.pts} P</span>
      </div>
    `).join('');
  }
}

// Scroll Event for Mini Leaderboard (Optimized)
const elStandingsTable = document.querySelector('.standings-section');
const elMiniBoard = document.getElementById('mini-leaderboard');
let scrollTicking = false;

window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    window.requestAnimationFrame(() => {
      if (elStandingsTable && elMiniBoard) {
        const rect = elStandingsTable.getBoundingClientRect();
        if (rect.top < 0) {
          elMiniBoard.classList.add('visible');
        } else {
          elMiniBoard.classList.remove('visible');
        }
      }
      scrollTicking = false;
    });
    scrollTicking = true;
  }
});

// ===== RENDER =====
function renderMatches(team, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  state[team].matches.forEach((match, index) => {
    const row = document.createElement('div');
    const outcomeLower = match.outcome ? match.outcome.toLowerCase() : '';
    row.className = `match-card ${match.outcome ? 'state-' + outcomeLower : ''}`;

    const venueTag = match.home
      ? '<span class="venue-tag home">EV SAHİBİ</span>'
      : '<span class="venue-tag away">DEPLASMAN</span>';

    row.innerHTML = `
      <div class="match-header-row">
        <span>${match.week}</span>
        ${venueTag}
      </div>
      <div class="match-main">
        <span class="opponent-name">${match.opponent}</span>
        <div class="score-inputs">
          <input type="number" min="0" max="20" class="score-box" value="${match.goalsFor}" onchange="setScore('${team}', ${index}, 'gf', this.value)">
          <span class="score-sep">-</span>
          <input type="number" min="0" max="20" class="score-box" value="${match.goalsAgainst}" onchange="setScore('${team}', ${index}, 'ga', this.value)">
        </div>
      </div>
      <div class="prediction-controls">
        <button class="pred-btn w ${match.outcome === 'W' ? 'active' : ''}" onclick="setOutcome('${team}', ${index}, 'W')">KAZANIR</button>
        <button class="pred-btn d ${match.outcome === 'D' ? 'active' : ''}" onclick="setOutcome('${team}', ${index}, 'D')">BERABERE</button>
        <button class="pred-btn l ${match.outcome === 'L' ? 'active' : ''}" onclick="setOutcome('${team}', ${index}, 'L')">KAYBEDER</button>
      </div>
    `;
    container.appendChild(row);
  });
}

let debounceTimer;
function saveState() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    localStorage.setItem('sampiyonSimulatorState_v5', JSON.stringify(state));
  }, 300);
}

function updatePoints() {
  TEAMS.forEach(team => {
    const t = state[team];
    const earnedPts = t.matches.reduce((s, m) => s + (m.outcome ? getPoints(m.outcome) : 0), 0);
    const totalPts = t.basePoints + earnedPts;

    let extraGF = 0, extraGA = 0;
    t.matches.forEach(m => {
      const gf = parseInt(m.goalsFor);
      const ga = parseInt(m.goalsAgainst);
      if (!isNaN(gf)) extraGF += gf;
      if (!isNaN(ga)) extraGA += ga;
    });

    const totalGF = t.baseGF + extraGF;
    const totalGA = t.baseGA + extraGA;
    const averaj = totalGF - totalGA;

    const abbr = team.toLowerCase();
    document.getElementById(`total-${abbr}`).textContent = totalPts + ' P';
    document.getElementById(`averaj-${abbr}`).textContent = (averaj >= 0 ? '+' : '') + averaj;
    document.getElementById(`gf-${abbr}`).textContent = totalGF;
    document.getElementById(`ga-${abbr}`).textContent = totalGA;
  });

  // Leader highlight - en yüksek puanlı kartı vurgula
  const totals = TEAMS.map(t => ({
    key: t,
    pts: state[t].basePoints + state[t].matches.reduce((s, m) => s + (m.outcome ? getPoints(m.outcome) : 0), 0)
  }));
  const maxPts = Math.max(...totals.map(t => t.pts));

  TEAMS.forEach(t => {
    const card = document.getElementById(`card-${t.toLowerCase()}`);
    card.classList.remove('leader');
    if (totals.find(x => x.key === t).pts === maxPts) card.classList.add('leader');
  });

  // Update standings table
  renderStandings();
  saveState();
}

// ===== BAĞLI MAÇLAR (Derbi senkronizasyonu) =====
// GS index 1 (vs Fenerbahçe) <-> FB index 0 (vs Galatasaray)
const linkedMatches = [
  { teamA: 'GS', indexA: 0, teamB: 'FB', indexB: 0 },  // 31. Hafta GS-FB
  { teamA: 'TS', indexA: 2, teamB: 'BJK', indexB: 2 }   // 33. Hafta TS-BJK
];

function getLinkedMatch(team, index) {
  for (const link of linkedMatches) {
    if (link.teamA === team && link.indexA === index) return { team: link.teamB, index: link.indexB };
    if (link.teamB === team && link.indexB === index) return { team: link.teamA, index: link.indexA };
  }
  return null;
}

function flipOutcome(outcome) {
  if (outcome === 'W') return 'L';
  if (outcome === 'L') return 'W';
  if (outcome === 'D') return 'D';
  return null;
}

// ===== VARSAYILAN SKORLAR =====
function getDefaultScores(outcome) {
  if (outcome === 'W') return { gf: '1', ga: '0' };
  if (outcome === 'L') return { gf: '0', ga: '1' };
  if (outcome === 'D') return { gf: '0', ga: '0' };
  return { gf: '', ga: '' };
}

// ===== GLOBAL HANDLERS =====
window.setOutcome = function (team, index, outcome) {
  const match = state[team].matches[index];
  const linked = getLinkedMatch(team, index);

  // Toggle off
  if (match.outcome === outcome) {
    match.outcome = null;
    match.goalsFor = '';
    match.goalsAgainst = '';
    if (linked) {
      const lm = state[linked.team].matches[linked.index];
      lm.outcome = null;
      lm.goalsFor = '';
      lm.goalsAgainst = '';
      renderMatches(linked.team, `fixtures-${linked.team.toLowerCase()}`);
    }
  } else {
    match.outcome = outcome;
    const scores = getDefaultScores(outcome);
    match.goalsFor = scores.gf;
    match.goalsAgainst = scores.ga;
    if (linked) {
      const lm = state[linked.team].matches[linked.index];
      lm.outcome = flipOutcome(outcome);
      lm.goalsFor = scores.ga;   // Rakibin AG = bizim YG
      lm.goalsAgainst = scores.gf; // Rakibin YG = bizim AG
      renderMatches(linked.team, `fixtures-${linked.team.toLowerCase()}`);
    }
  }
  renderMatches(team, `fixtures-${team.toLowerCase()}`);
  updatePoints();
};

window.setScore = function (team, index, type, value) {
  if (type === 'gf') {
    state[team].matches[index].goalsFor = value;
  } else {
    state[team].matches[index].goalsAgainst = value;
  }

  // Bağlı maçın skorunu senkronize et (AG <-> YG)
  const linked = getLinkedMatch(team, index);
  if (linked) {
    if (type === 'gf') {
      state[linked.team].matches[linked.index].goalsAgainst = value;
    } else {
      state[linked.team].matches[linked.index].goalsFor = value;
    }
    renderMatches(linked.team, `fixtures-${linked.team.toLowerCase()}`);
  }

  updatePoints();
};

// Base input listeners
['gs', 'fb', 'ts', 'bjk'].forEach(abbr => {
  const team = abbr.toUpperCase();
  document.getElementById(`base-${abbr}`).addEventListener('input', e => {
    state[team].basePoints = parseInt(e.target.value) || 0;
    updatePoints();
  });
  document.getElementById(`basegf-${abbr}`).addEventListener('input', e => {
    state[team].baseGF = parseInt(e.target.value) || 0;
    updatePoints();
  });
  document.getElementById(`basega-${abbr}`).addEventListener('input', e => {
    state[team].baseGA = parseInt(e.target.value) || 0;
    updatePoints();
  });
});

// Init
const savedState = localStorage.getItem('sampiyonSimulatorState_v5');
if (savedState) {
  try {
    const parsed = JSON.parse(savedState);
    TEAMS.forEach(team => {
      if (parsed[team]) {
        state[team].basePoints = parsed[team].basePoints;
        state[team].baseGF = parsed[team].baseGF;
        state[team].baseGA = parsed[team].baseGA;
        document.getElementById(`base-${team.toLowerCase()}`).value = state[team].basePoints;
        document.getElementById(`basegf-${team.toLowerCase()}`).value = state[team].baseGF;
        document.getElementById(`basega-${team.toLowerCase()}`).value = state[team].baseGA;

        parsed[team].matches.forEach((pm) => {
          const m = state[team].matches.find(sm => sm.id === pm.id);
          if (m) {
            m.outcome = pm.outcome;
            m.goalsFor = pm.goalsFor;
            m.goalsAgainst = pm.goalsAgainst;
          }
        });
      }
    });
  } catch (e) {
    console.error('State geri yüklenemedi:', e);
  }
}

renderStandings();
TEAMS.forEach(t => renderMatches(t, `fixtures-${t.toLowerCase()}`));
updatePoints();

// ===== ACTIONS =====
function resetPredictions() {
  if (confirm("Tüm tahminlerinizi silip orijinal puan durumuna dönmek istediğinize emin misiniz?")) {
    localStorage.removeItem('sampiyonSimulatorState');
    location.reload();
  }
}

function sharePrediction() {
  const btn = document.getElementById('btn-share');
  const originalText = btn.innerHTML;
  btn.innerHTML = '⏳ Hazırlanıyor...';

  // Capture the entire app instead of just the standings, so match predictions are included.
  const target = document.querySelector('.app-container');

  html2canvas(target, {
    backgroundColor: '#0B0E14',
    scale: 2,
    ignoreElements: (node) => {
      // Hide the buttons inside the screenshot so it looks cleaner
      return node.classList && node.classList.contains('actions-bar');
    }
  }).then(canvas => {
    const link = document.createElement('a');
    link.download = 'Sampiyonluk-Tahminim.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    btn.innerHTML = originalText;
  }).catch(err => {
    console.error('Screenshot error:', err);
    alert('Tahmin indirilirken bir hata oluştu.');
    btn.innerHTML = originalText;
  });
}
