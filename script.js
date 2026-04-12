// ===== GERÇEK FİKSTÜR VERİLERİ (12 Nisan 2026 itibarıyla) =====
const gsMatches = [
  { id: 'gs-1', week: '30. Hafta', opponent: 'Gençlerbirliği', home: false, goalsFor: '', goalsAgainst: '', outcome: null },
  { id: 'gs-2', week: '31. Hafta', opponent: 'Fenerbahçe', home: true, goalsFor: '', goalsAgainst: '', outcome: null },
  { id: 'gs-3', week: '32. Hafta', opponent: 'Samsunspor', home: false, goalsFor: '', goalsAgainst: '', outcome: null },
  { id: 'gs-4', week: '33. Hafta', opponent: 'Beşiktaş', home: true, goalsFor: '', goalsAgainst: '', outcome: null },
  { id: 'gs-5', week: '34. Hafta', opponent: 'Kasımpaşa', home: false, goalsFor: '', goalsAgainst: '', outcome: null },
];

const fbMatches = [
  { id: 'fb-1', week: '30. Hafta', opponent: 'Ç. Rizespor', home: true, goalsFor: '', goalsAgainst: '', outcome: null },
  { id: 'fb-2', week: '31. Hafta', opponent: 'Galatasaray', home: false, goalsFor: '', goalsAgainst: '', outcome: null },
  { id: 'fb-3', week: '32. Hafta', opponent: 'Başakşehir', home: true, goalsFor: '', goalsAgainst: '', outcome: null },
  { id: 'fb-4', week: '33. Hafta', opponent: 'Bodrumspor', home: false, goalsFor: '', goalsAgainst: '', outcome: null },
  { id: 'fb-5', week: '34. Hafta', opponent: 'Eyüpspor', home: true, goalsFor: '', goalsAgainst: '', outcome: null },
];

function getPoints(outcome) {
  if (outcome === 'W') return 3;
  if (outcome === 'D') return 1;
  return 0;
}

// State
const state = {
  GS: {
    basePoints: 68,
    baseGF: 67,   // Atılan Gol
    baseGA: 22,   // Yenen Gol
    matches: gsMatches.map(m => ({...m}))
  },
  FB: {
    basePoints: 66,
    baseGF: 66,
    baseGA: 28,
    matches: fbMatches.map(m => ({...m}))
  }
};

// ===== RENDER =====
function renderMatches(team, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  state[team].matches.forEach((match, index) => {
    const row = document.createElement('div');
    row.className = 'match-row';
    if (match.outcome === 'W') row.classList.add('row-win');
    else if (match.outcome === 'D') row.classList.add('row-draw');
    else if (match.outcome === 'L') row.classList.add('row-loss');

    const venueTag = match.home
      ? '<span class="venue home">İÇ</span>'
      : '<span class="venue away">DIŞ</span>';

    row.innerHTML = `
      <div class="match-info">
        <span class="match-week">${match.week}</span>
        <span class="match-opponent">${venueTag} ${match.opponent}</span>
      </div>
      <div class="match-controls">
        <div class="score-inputs">
          <input type="number" min="0" max="20" class="score-input" placeholder="-" value="${match.goalsFor}" onchange="setScore('${team}', ${index}, 'gf', this.value)" title="Attığı Gol">
          <span class="score-dash">-</span>
          <input type="number" min="0" max="20" class="score-input" placeholder="-" value="${match.goalsAgainst}" onchange="setScore('${team}', ${index}, 'ga', this.value)" title="Yediği Gol">
        </div>
        <div class="match-actions">
          <button class="btn-outcome btn-w ${match.outcome === 'W' ? 'active' : ''}" onclick="setOutcome('${team}', ${index}, 'W')" title="Yener">G</button>
          <button class="btn-outcome btn-d ${match.outcome === 'D' ? 'active' : ''}" onclick="setOutcome('${team}', ${index}, 'D')" title="Berabere">B</button>
          <button class="btn-outcome btn-l ${match.outcome === 'L' ? 'active' : ''}" onclick="setOutcome('${team}', ${index}, 'L')" title="Yenilir">M</button>
        </div>
      </div>
    `;
    container.appendChild(row);
  });
}

function updatePoints() {
  ['GS', 'FB'].forEach(team => {
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

  // Leader highlight
  const gsTotal = state.GS.basePoints + state.GS.matches.reduce((s, m) => s + (m.outcome ? getPoints(m.outcome) : 0), 0);
  const fbTotal = state.FB.basePoints + state.FB.matches.reduce((s, m) => s + (m.outcome ? getPoints(m.outcome) : 0), 0);

  const gsCard = document.getElementById('card-gs');
  const fbCard = document.getElementById('card-fb');

  gsCard.classList.remove('leader');
  fbCard.classList.remove('leader');

  if (gsTotal > fbTotal) gsCard.classList.add('leader');
  else if (fbTotal > gsTotal) fbCard.classList.add('leader');
}

// ===== BAĞLI MAÇLAR (Derbi senkronizasyonu) =====
// GS index 1 (vs Fenerbahçe) <-> FB index 1 (vs Galatasaray)
const linkedMatches = [
  { teamA: 'GS', indexA: 1, teamB: 'FB', indexB: 1 }
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
window.setOutcome = function(team, index, outcome) {
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

window.setScore = function(team, index, type, value) {
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
['gs', 'fb'].forEach(abbr => {
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
renderMatches('GS', 'fixtures-gs');
renderMatches('FB', 'fixtures-fb');
updatePoints();
