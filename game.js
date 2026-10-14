// =========================================================
//  GEOMETRY INFINITY — game.js
//  Single-player GD Top Player Simulator
// =========================================================
'use strict';

// ─────────────────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────────────────

const GI = {
  SAVE_KEY:  'geometry_infinity_save',
  MAX_TURNS: 30,

  // ─────────────────────────────────────────────────────────
  //  LEVEL IDs (COLOQUE OS IDs DO GEOMETRY DASH AQUI)
  //  Se você colocar o ID entre aspas, ele aparece no card!
  //  Se deixar vazio '' não aparece nada.
  // ─────────────────────────────────────────────────────────
  LEVEL_IDS: {
    'Stereo Madness': '',
    'Back on Track':  '',
    'Polargeist':     '',
    'Dry Out':        '',
    'Base After Base':'',
    "Can't Let Go":   '',
    'Jumper':         '',
    'level easy':     '11940'  // ID do desafio level easy
  },

  // Levels in initial order of DIFFICULTY (rank 1 = easiest, rank 7 = hardest)
  // Higher rank appears at TOP (#1) of the list.
  LEVELS: [
    {
      id: 'stereo_madness', name: 'Stereo Madness',
      rank: 1, unlockTurn: 1, verifier: 'Riot',
      points: 50,
      gradient: 'linear-gradient(135deg, #0d47a1, #42a5f5)',
      diffLabel: 'Auto', diffColor: '#90caf9'
    },
    {
      id: 'back_on_track', name: 'Back on Track',
      rank: 2, unlockTurn: 5, verifier: 'Zoink',
      points: 110,
      gradient: 'linear-gradient(135deg, #1b5e20, #66bb6a)',
      diffLabel: 'Easy', diffColor: '#a5d6a7'
    },
    {
      id: 'polargeist', name: 'Polargeist',
      rank: 3, unlockTurn: 9, verifier: 'Doggie',
      points: 200,
      gradient: 'linear-gradient(135deg, #bf360c, #ffa726)',
      diffLabel: 'Normal', diffColor: '#ffcc80'
    },
    {
      id: 'dry_out', name: 'Dry Out',
      rank: 4, unlockTurn: 13, verifier: 'Michigun',
      points: 320,
      gradient: 'linear-gradient(135deg, #b71c1c, #ef5350)',
      diffLabel: 'Hard', diffColor: '#ef9a9a'
    },
    {
      id: 'base_after_base', name: 'Base After Base',
      rank: 5, unlockTurn: 17, verifier: 'Cyclic',
      points: 470,
      gradient: 'linear-gradient(135deg, #880e4f, #e91e63)',
      diffLabel: 'Harder', diffColor: '#f48fb1'
    },
    {
      id: 'cant_let_go', name: "Can't Let Go",
      rank: 6, unlockTurn: 21, verifier: 'SpaceUK',
      points: 660,
      gradient: 'linear-gradient(135deg, #4a148c, #ab47bc)',
      diffLabel: 'Insane', diffColor: '#ce93d8'
    },
    {
      id: 'jumper', name: 'Jumper',
      rank: 7, unlockTurn: 25, verifier: 'Trick',
      points: 900,
      gradient: 'linear-gradient(135deg, #0d0010, #b71c1c, #e53935)',
      diffLabel: 'Demon', diffColor: '#ff5252'
    }
  ],

  // Challenges are always available, not verified by anyone (cannot be verified early)
  CHALLENGES: [
    {
      id: 'level_easy',
      name: 'level easy',
      points: 200, // Same points as Polargeist
      gradient: 'linear-gradient(135deg, #11998e, #38ef7d)',
      diffLabel: 'Challenge',
      diffColor: '#69f0ae'
    }
  ],

  NPCS: [
    { name: 'Riot',         skill: 9.8 },
    { name: 'Zoink',        skill: 9.5 },
    { name: 'SpaceUK',      skill: 9.2 },
    { name: 'Trick',        skill: 9.0 },
    { name: 'Wwase',        skill: 8.7 },
    { name: 'Cyclic',       skill: 8.5 },
    { name: 'Doggie',       skill: 8.3 },
    { name: 'Combined',     skill: 8.1 },
    { name: 'SrGuillester', skill: 7.9 },
    { name: 'Shaggy23',     skill: 7.7 },
    { name: 'Michigun',     skill: 7.5 },
    { name: 'KrmaL',        skill: 7.3 },
    { name: 'Zobros',       skill: 7.1 },
    { name: 'Woogi1411',    skill: 6.9 },
    { name: 'Nswish',       skill: 6.7 },
    { name: 'Dolos',        skill: 6.5 },
    { name: 'Diamond',      skill: 6.3 },
    { name: 'Paqeo',        skill: 6.1 },
    { name: 'Technical',    skill: 5.9 },
    { name: 'Cursed',       skill: 5.7 }
  ]
};

// ─────────────────────────────────────────────────────────
//  UTILITIES
// ─────────────────────────────────────────────────────────

function rand(min, max)    { return Math.random() * (max - min) + min; }
function randInt(min, max) { return Math.floor(rand(min, max + 1)); }
function getLevelById(id)  { return GI.LEVELS.find(l => l.id === id) || null; }
function getChallengeById(id) { return GI.CHALLENGES.find(c => c.id === id) || null; }

// Effective rank calculation (takes into account Turn 27 Can't Let Go swap with Jumper)
function getLevelRank(levelId, state) {
  const lvl = getLevelById(levelId);
  if (!lvl) return 0;
  if (state && state.cantLetGoTop1) {
    if (levelId === 'cant_let_go') return 7.5; // Higher than Jumper (7)
    if (levelId === 'jumper')      return 7.0;
  }
  return lvl.rank;
}

// Returns visible levels sorted HARDEST FIRST (highest rank = #1 in list)
function getVisibleLevelsSorted(state) {
  return GI.LEVELS
    .filter(l => state.playerLevels[l.id].status !== 'locked')
    .sort((a, b) => getLevelRank(b.id, state) - getLevelRank(a.id, state));
}

function getLockedLevels(state) {
  return GI.LEVELS.filter(l => state.playerLevels[l.id].status === 'locked');
}

// ─────────────────────────────────────────────────────────
//  LEVEL IDS LOADER (from level_ids.txt)
// ─────────────────────────────────────────────────────────

let _levelIdsMap = {};

function parseLevelIdsText(text) {
  if (!text) return;
  const lines = text.split(/\r?\n/);
  lines.forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    const colonIdx = line.indexOf(':');
    if (colonIdx !== -1) {
      const name = line.substring(0, colonIdx).trim().toLowerCase();
      const idVal = line.substring(colonIdx + 1).trim();
      if (idVal) {
        _levelIdsMap[name] = idVal;
      }
    }
  });
}

function loadLevelIds() {
  return new Promise((resolve) => {
    // Try fetch first
    if (typeof fetch === 'function') {
      fetch('level_ids.txt?t=' + Date.now())
        .then(res => {
          if (!res.ok) throw new Error('fetch failed');
          return res.text();
        })
        .then(text => {
          parseLevelIdsText(text);
          resolve();
        })
        .catch(() => {
          // Fallback to XMLHttpRequest for file://
          try {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', 'level_ids.txt', true);
            xhr.onload = function() {
              if (xhr.status === 200 || xhr.status === 0) {
                parseLevelIdsText(xhr.responseText);
              }
              resolve();
            };
            xhr.onerror = function() { resolve(); };
            xhr.send();
          } catch(e) { resolve(); }
        });
    } else {
      resolve();
    }
  });
}

function getLevelInGameId(name) {
  if (!name) return null;
  const clean = name.trim().toLowerCase();
  // Check GI.LEVEL_IDS first
  if (GI.LEVEL_IDS) {
    for (const [key, val] of Object.entries(GI.LEVEL_IDS)) {
      if (key.trim().toLowerCase() === clean && val && val.trim() !== '') {
        return val.trim();
      }
    }
  }
  // Fallback to loaded txt map if present
  return _levelIdsMap[clean] || null;
}

// ─────────────────────────────────────────────────────────
//  STATE MANAGEMENT
// ─────────────────────────────────────────────────────────

function createInitialState(nick) {
  const npcs = {};
  GI.NPCS.forEach(npc => {
    npcs[npc.name] = {
      progress: {},
      completed: [],
      attempts: {},
      challenges: {} // e.g. { level_easy: true }
    };
  });

  const playerLevels = {};
  GI.LEVELS.forEach(lvl => {
    playerLevels[lvl.id] = {
      status: 'locked',         // 'locked' | 'progress' | 'complete'
      attempts: 0,
      bestPercent: 0,
      completedAttempts: null,
      playerVerified: false
    };
  });

  const playerChallenges = {};
  GI.CHALLENGES.forEach(c => {
    playerChallenges[c.id] = {
      completed: false,
      attempts: 0
    };
  });

  return {
    nick,
    currentTurn: 1,
    gameOver: false,
    cantLetGoTop1: false,
    playerLevels,
    playerChallenges,
    npcs,
    eventLog: []
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(GI.SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed.playerChallenges) {
      parsed.playerChallenges = {};
      GI.CHALLENGES.forEach(c => {
        parsed.playerChallenges[c.id] = { completed: false, attempts: 0 };
      });
    }
    return parsed;
  } catch (e) { return null; }
}

function saveState(state)  { localStorage.setItem(GI.SAVE_KEY, JSON.stringify(state)); }
function resetState()      { localStorage.removeItem(GI.SAVE_KEY); }

// ─────────────────────────────────────────────────────────
//  SCORE
// ─────────────────────────────────────────────────────────

function calcAttemptBonus(pts, att) {
  if (!att || att <= 0) return 0;
  if (att < 100)  return Math.round(pts * 0.70);
  if (att < 300)  return Math.round(pts * 0.40);
  if (att < 1000) return Math.round(pts * 0.20);
  return 0;
}

// Player score calculation:
// - 100% complete: lvl.points + attempt bonus
// - 51% to 99%: 50% base points (no attempt bonus yet)
// - Challenges: full challenge points
function getPlayerScore(state) {
  let score = 0;

  // Levels
  Object.entries(state.playerLevels).forEach(([id, pl]) => {
    const lvl = getLevelById(id);
    if (!lvl) return;
    if (pl.status === 'complete') {
      score += lvl.points + calcAttemptBonus(lvl.points, pl.completedAttempts || pl.attempts);
    } else if (pl.bestPercent >= 51) {
      score += Math.round(lvl.points * 0.50);
    }
  });

  // Challenges
  if (state.playerChallenges) {
    Object.entries(state.playerChallenges).forEach(([id, pc]) => {
      if (pc.completed) {
        const chal = getChallengeById(id);
        if (chal) score += chal.points + calcAttemptBonus(chal.points, pc.attempts);
      }
    });
  }

  return score;
}

// NPC score calculation:
// - Completed levels: lvl.points + attempt bonus
// - Incomplete with progress >= 51%: 50% base points
// - Challenges completed: challenge points
function getNPCScore(npc) {
  let score = 0;

  // Levels
  GI.LEVELS.forEach(lvl => {
    if (npc.completed.includes(lvl.id)) {
      score += lvl.points + calcAttemptBonus(lvl.points, npc.attempts[lvl.id] || 0);
    } else if ((npc.progress[lvl.id] || 0) >= 51) {
      score += Math.round(lvl.points * 0.50);
    }
  });

  // Challenges
  if (npc.challenges) {
    GI.CHALLENGES.forEach(c => {
      if (npc.challenges[c.id]) {
        score += c.points;
      }
    });
  }

  return score;
}

function getHardestCompleted(completedIds, state) {
  if (!completedIds || completedIds.length === 0) return null;
  return completedIds.reduce((best, id) => {
    const lvl = getLevelById(id);
    if (!lvl) return best;
    if (!best || getLevelRank(lvl.id, state) > getLevelRank(best.id, state)) return lvl;
    return best;
  }, null);
}

function buildRanking(state) {
  const entries = [];

  const playerCompleted = Object.entries(state.playerLevels)
    .filter(([, v]) => v.status === 'complete').map(([id]) => id);
  const playerChallengesCompleted = state.playerChallenges
    ? Object.entries(state.playerChallenges).filter(([, v]) => v.completed).map(([id]) => id)
    : [];

  entries.push({
    name: state.nick,
    isPlayer: true,
    score: getPlayerScore(state),
    completed: playerCompleted.length,
    challengesCompleted: playerChallengesCompleted.length,
    hardest: getHardestCompleted(playerCompleted, state)?.name ?? '—',
    completedList: playerCompleted,
    progressMap: Object.fromEntries(
      Object.entries(state.playerLevels).map(([id, pl]) => [id, pl.status === 'complete' ? 100 : (pl.bestPercent || 0)])
    )
  });

  GI.NPCS.forEach(npcDef => {
    const npc = state.npcs[npcDef.name];
    const chalCount = npc.challenges ? Object.values(npc.challenges).filter(Boolean).length : 0;
    entries.push({
      name: npcDef.name,
      isPlayer: false,
      score: getNPCScore(npc),
      completed: npc.completed.length,
      challengesCompleted: chalCount,
      hardest: getHardestCompleted(npc.completed, state)?.name ?? '—',
      completedList: npc.completed,
      progressMap: npc.progress
    });
  });

  entries.sort((a, b) => b.score - a.score || b.completed - a.completed);
  return entries;
}

// ─────────────────────────────────────────────────────────
//  NPC TURN LOGIC (Faster & More Competitive)
// ─────────────────────────────────────────────────────────

function processNPCTurn(state, turnNum) {
  const events = [];
  const available = GI.LEVELS.filter(l =>
    state.playerLevels[l.id].status !== 'locked'
  );

  GI.NPCS.forEach(npcDef => {
    const npc = state.npcs[npcDef.name];
    const skillFactor = npcDef.skill / 10;

    // 1. Progression on Main Levels (Top players: 25-40% gain per turn)
    available.forEach(level => {
      if (npc.completed.includes(level.id)) return;

      const oldProg = npc.progress[level.id] || 0;
      const gain    = rand(25, 40) * skillFactor;
      const newProg = Math.min(99, oldProg + gain);
      npc.progress[level.id] = newProg;

      // Event for reaching 51% (record threshold)
      if (oldProg < 51 && newProg >= 51) {
        events.push({
          type: 'npc_record',
          text: `📊 ${npcDef.name} got a ${Math.round(newProg)}% record on ${level.name}!`
        });
      }

      // Completion check when >= 75%
      if (newProg >= 75 && Math.random() < skillFactor * 0.32) {
        npc.completed.push(level.id);
        npc.progress[level.id] = 100;
        const attBase = Math.round(rand(20, 320) * (10 / npcDef.skill) * (0.5 + level.rank * 0.3));
        npc.attempts[level.id] = Math.max(1, attBase);
        events.push({
          type: 'npc_complete',
          text: `🏆 ${npcDef.name} beat ${level.name}! (${npc.attempts[level.id].toLocaleString()} attempts)`
        });
      }
    });

    // 2. Progression on Challenges
    if (!npc.challenges) npc.challenges = {};
    GI.CHALLENGES.forEach(c => {
      if (npc.challenges[c.id]) return;
      // NPCs attempt challenges each turn (higher skill = higher chance)
      if (Math.random() < skillFactor * 0.12) {
        npc.challenges[c.id] = true;
        events.push({
          type: 'npc_complete',
          text: `⚡ ${npcDef.name} beat the challenge "${c.name}"!`
        });
      }
    });
  });

  return events;
}

// ─────────────────────────────────────────────────────────
//  ADVANCE TURN
// ─────────────────────────────────────────────────────────

function advanceTurn(state) {
  if (state.gameOver) return { events: [] };

  const processedTurn = state.currentTurn;
  const events = [];

  // NPCs progress on currently visible levels and challenges
  events.push(...processNPCTurn(state, processedTurn));

  // Move to next turn
  const newTurn = processedTurn + 1;
  state.currentTurn = newTurn;

  // Turn 27 special event: Can't Let Go considered harder than Jumper!
  if (newTurn === 27 && !state.cantLetGoTop1) {
    state.cantLetGoTop1 = true;
    events.unshift({
      type: 'list_shift',
      text: `🔥 LIST RE-EVALUATION: "Can't Let Go" has been voted harder than "Jumper"! Can't Let Go moves to #1 on the Demonlist!`
    });
  }

  // Unlock scheduled levels
  GI.LEVELS.forEach(level => {
    if (level.unlockTurn === newTurn) {
      const pl = state.playerLevels[level.id];
      if (pl.status === 'locked') {
        pl.status = 'progress';
        events.push({ type: 'level_unlock', text: `🆕 ${level.name} added to the list!` });
      } else if (pl.playerVerified) {
        events.push({ type: 'level_unlock', text: `🆕 ${level.name} officially enters the list — already verified by you!` });
      }
      // Original verifier NPC completes it
      const verNpc = state.npcs[level.verifier];
      if (verNpc && !verNpc.completed.includes(level.id)) {
        verNpc.completed.push(level.id);
        verNpc.progress[level.id] = 100;
        verNpc.attempts[level.id] = randInt(10, 200);
        if (!pl.playerVerified) {
          events.push({ type: 'npc_verify', text: `⭐ ${level.verifier} verified ${level.name}!` });
        }
      }
    }
  });

  // Log
  state.eventLog.unshift({
    turn: processedTurn,
    events: events.length > 0
      ? events
      : [{ type: 'quiet', text: 'A quiet session — everyone grinding in silence...' }]
  });
  if (state.eventLog.length > 12) state.eventLog = state.eventLog.slice(0, 12);

  if (newTurn > GI.MAX_TURNS) state.gameOver = true;

  saveState(state);
  return { events };
}

// ─────────────────────────────────────────────────────────
//  TAB SWITCHING
// ─────────────────────────────────────────────────────────

function switchTab(tabId, btn) {
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + tabId).classList.add('active');
  if (btn) btn.classList.add('active');

  if (tabId === 'challenges') {
    loadLevelIds().then(() => renderChallengeTab());
  }
  if (tabId === 'stats')      renderStatsTab();
  if (tabId === 'season')     renderSeasonTab();
}

// ─────────────────────────────────────────────────────────
//  RENDERING — MAIN LIST TAB
// ─────────────────────────────────────────────────────────

let gameState = null;

function renderAll() {
  if (!gameState) return;
  renderTurnInfo();
  renderLevelList();
  renderProfile();
  if (document.getElementById('tab-challenges')?.classList.contains('active')) {
    renderChallengeTab();
  }
}

function renderTurnInfo() {
  const turnEl  = document.getElementById('turn-display');
  const nickEl  = document.getElementById('nick-display');
  const advBtn  = document.getElementById('advance-btn');
  const barFill = document.getElementById('turn-progress');

  if (nickEl) nickEl.textContent = gameState.nick;
  if (turnEl) turnEl.textContent = `Turn ${gameState.currentTurn} / ${GI.MAX_TURNS}`;

  if (advBtn) {
    if (gameState.gameOver) {
      advBtn.textContent = '🏁 Season Over';
      advBtn.disabled = true;
    } else {
      const next = gameState.currentTurn + 1;
      advBtn.textContent = next > GI.MAX_TURNS
        ? '→ End Season (Turn 30)'
        : `→ Advance to Turn ${next}`;
      advBtn.disabled = false;
    }
  }

  if (barFill) {
    barFill.style.width = Math.min(100, ((gameState.currentTurn - 1) / GI.MAX_TURNS) * 100) + '%';
  }
}

function renderLevelList() {
  const container = document.getElementById('level-list');
  if (!container) return;

  const visible = getVisibleLevelsSorted(gameState);

  if (visible.length === 0) {
    container.innerHTML = `<div class="list-empty">
      No levels on the list yet.<br>
      <span style="font-size:0.8rem;color:#bbb">Advance a turn to unlock Stereo Madness!</span>
    </div>`;
    return;
  }

  container.innerHTML = '';
  visible.forEach((level, idx) => {
    const displayPos = idx + 1; // hardest = 1
    const pl = gameState.playerLevels[level.id];
    const isDone = pl.status === 'complete';
    const has51Record = !isDone && (pl.bestPercent >= 51);

    let cardClass = 'level-card';
    if (isDone && pl.playerVerified) cardClass += ' player-verified';
    else if (isDone) cardClass += ' complete';

    const thumbHtml = `
      <div class="level-thumb" style="background:${level.gradient}">
        <img src="assets/levels/${level.id}.png"
             onerror="this.src='assets/levels/${level.id}.jpg';this.onerror=function(){this.src='assets/levels/${level.id}.jpeg';this.onerror=function(){this.style.display='none'}}"
             alt="${level.name}" class="level-thumb-img">
        <div class="diff-badge">${level.diffLabel}</div>
      </div>`;

    const verifierLine = pl.playerVerified
      ? `<div class="level-verifier">verified by <span class="verifier-name" style="color:#f5a623;font-weight:700">⭐ ${gameState.nick} (you)</span></div>`
      : `<div class="level-verifier">verified by <span class="verifier-name">${level.verifier}</span></div>`;

    let statusHtml = '';
    if (isDone) {
      statusHtml = `<div class="level-status-row">
        <span class="status-complete">✅ COMPLETE</span>
        <span style="color:#999">${pl.completedAttempts?.toLocaleString()} attempts</span>
        <div class="level-action">
          <button class="btn btn-ghost btn-sm" onclick="openProgressModal('${level.id}')">Update</button>
        </div>
      </div>`;
    } else {
      const pct = pl.bestPercent || 0;
      const attStr = pl.attempts > 0 ? `${pl.attempts.toLocaleString()} attempts` : '';
      statusHtml = `<div class="level-status-row">
        ${pct > 0
          ? `<div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
             <span>${pct}%${attStr ? ' — ' + attStr : ''}</span>`
          : `<span style="color:#bbb;font-size:0.78rem">Not started yet</span>`
        }
        ${has51Record ? `<span class="status-record">51%+ Record (+${Math.round(level.points * 0.5)} pts)</span>` : ''}
      </div>
      <div class="level-action" style="margin-top:4px">
        <button class="btn btn-primary btn-sm" onclick="openProgressModal('${level.id}')">Log Progress</button>
      </div>`;
    }

    const npcProg = getNPCProgressOnLevel(level.id);
    let npcHtml = '';
    if (npcProg.length > 0) {
      const shown = npcProg.slice(0, 5);
      const extra = npcProg.length - shown.length;
      npcHtml = `<div class="npc-progress-row">
        ${shown.map(n => `<span class="npc-tag ${n.completed ? 'npc-done' : 'npc-wip'}"
          title="${n.name}: ${n.completed ? 'Complete' : Math.round(n.progress) + '%'}">
          ${n.name} ${n.completed ? '✓' : Math.round(n.progress) + '%'}
        </span>`).join('')}
        ${extra > 0 ? `<span class="npc-more">+${extra}</span>` : ''}
      </div>`;
    }

    const inGameId = getLevelInGameId(level.name);
    const idTagHtml = inGameId ? `<span class="level-id-tag">ID: ${inGameId}</span>` : '';

    const card = document.createElement('div');
    card.className = cardClass;
    card.innerHTML = `
      ${thumbHtml}
      <div class="level-info">
        <div class="level-rank-name">
          <span>#${displayPos} – ${level.name}</span>
          ${idTagHtml}
        </div>
        ${verifierLine}
        ${statusHtml}
        ${npcHtml}
      </div>`;
    container.appendChild(card);
  });
}

function getNPCProgressOnLevel(levelId) {
  const results = [];
  GI.NPCS.forEach(npcDef => {
    const npc  = gameState.npcs[npcDef.name];
    const done = npc.completed.includes(levelId);
    const prog = npc.progress[levelId] || 0;
    if (done || prog > 0) results.push({ name: npcDef.name, completed: done, progress: prog });
  });
  results.sort((a, b) => (a.completed === b.completed ? b.progress - a.progress : a.completed ? -1 : 1));
  return results;
}

function renderProfile() {
  const container = document.getElementById('player-profile');
  if (!container) return;

  const completed = Object.entries(gameState.playerLevels)
    .filter(([, v]) => v.status === 'complete').map(([id]) => id);
  const score   = getPlayerScore(gameState);
  const hardest = getHardestCompleted(completed, gameState);
  const ranking = buildRanking(gameState);
  const rank    = ranking.findIndex(e => e.isPlayer) + 1;

  const completedTagsHtml = completed.map(id => {
    const lvl = getLevelById(id);
    const pl  = gameState.playerLevels[id];
    return `<span class="completed-tag">${lvl.name} (${pl.completedAttempts?.toLocaleString()} att)</span>`;
  }).join('');

  const challengeTagsHtml = gameState.playerChallenges
    ? Object.entries(gameState.playerChallenges).filter(([, pc]) => pc.completed).map(([id, pc]) => {
        const c = getChallengeById(id);
        return `<span class="completed-tag" style="background:#e8f5e9;border-color:#a5d6a7;color:#1b5e20">⚡ ${c.name} (${pc.attempts || 0} att)</span>`;
      }).join('')
    : '';

  container.innerHTML = `
    <div class="profile-stat">
      <span class="profile-label">Global Rank</span>
      <span class="profile-value profile-rank">#${rank}</span>
    </div>
    <div class="profile-stat">
      <span class="profile-label">Score</span>
      <span class="profile-value">${score.toLocaleString()} pts</span>
    </div>
    <div class="profile-stat">
      <span class="profile-label">Completed</span>
      <span class="profile-value">${completed.length} / ${GI.LEVELS.length}</span>
    </div>
    <div class="profile-stat">
      <span class="profile-label">Hardest</span>
      <span class="profile-value" style="font-size:0.78rem">${hardest ? hardest.name : '—'}</span>
    </div>
    ${(completedTagsHtml || challengeTagsHtml) ? `<div class="completed-tags" style="margin-top:8px">${completedTagsHtml}${challengeTagsHtml}</div>` : ''}
  `;
}

// ─────────────────────────────────────────────────────────
//  RENDERING — CHALLENGE LIST TAB
// ─────────────────────────────────────────────────────────

function renderChallengeTab() {
  const container = document.getElementById('challenge-list');
  if (!container) return;

  container.innerHTML = '';
  GI.CHALLENGES.forEach((c, idx) => {
    const pc = (gameState.playerChallenges && gameState.playerChallenges[c.id]) || { completed: false, attempts: 0 };
    const isDone = pc.completed;

    let cardClass = 'level-card';
    if (isDone) cardClass += ' complete';

    const thumbHtml = `
      <div class="level-thumb" style="background:${c.gradient}">
        <img src="assets/levels/${c.id}.png"
             onerror="this.src='assets/levels/${c.id}.jpg';this.onerror=function(){this.src='assets/levels/${c.id}.jpeg';this.onerror=function(){this.style.display='none'}}"
             alt="${c.name}" class="level-thumb-img">
        <div class="diff-badge" style="background:#004d40">${c.diffLabel}</div>
      </div>`;

    let statusHtml = '';
    if (isDone) {
      statusHtml = `<div class="level-status-row">
        <span class="status-complete">✅ COMPLETED</span>
        <span style="color:#999">${pc.attempts?.toLocaleString()} attempts</span>
        <div class="level-action">
          <button class="btn btn-ghost btn-sm" onclick="openChallengeModal('${c.id}')">Update</button>
        </div>
      </div>`;
    } else {
      statusHtml = `<div class="level-status-row">
        <span style="color:#666;font-size:0.8rem">Worth <strong>${c.points} pts</strong> (Same as Polargeist)</span>
      </div>
      <div class="level-action" style="margin-top:4px">
        <button class="btn btn-primary btn-sm" onclick="openChallengeModal('${c.id}')">Log Completion</button>
      </div>`;
    }

    // NPC challenge completions
    const npcDone = [];
    GI.NPCS.forEach(npcDef => {
      const npc = gameState.npcs[npcDef.name];
      if (npc && npc.challenges && npc.challenges[c.id]) {
        npcDone.push(npcDef.name);
      }
    });

    let npcHtml = '';
    if (npcDone.length > 0) {
      const shown = npcDone.slice(0, 6);
      const extra = npcDone.length - shown.length;
      npcHtml = `<div class="npc-progress-row">
        ${shown.map(name => `<span class="npc-tag npc-done">${name} ✓</span>`).join('')}
        ${extra > 0 ? `<span class="npc-more">+${extra}</span>` : ''}
      </div>`;
    }

    const inGameId = getLevelInGameId(c.name);
    const idTagHtml = inGameId ? `<span class="level-id-tag">ID: ${inGameId}</span>` : '';

    const card = document.createElement('div');
    card.className = cardClass;
    card.innerHTML = `
      ${thumbHtml}
      <div class="level-info">
        <div class="level-rank-name">
          <span>#${idx + 1} – ${c.name}</span>
          ${idTagHtml}
        </div>
        <div class="level-verifier">Short Challenge · <strong style="color:var(--accent)">${c.points} pts</strong></div>
        ${statusHtml}
        ${npcHtml}
      </div>`;
    container.appendChild(card);
  });
}

let _activeChallengeId = null;

function openChallengeModal(challengeId) {
  _activeChallengeId = challengeId;
  const c = getChallengeById(challengeId);
  if (!c) return;
  const pc = (gameState.playerChallenges && gameState.playerChallenges[challengeId]) || { completed: false, attempts: 0 };

  const titleEl = document.getElementById('challenge-modal-title');
  if (titleEl) titleEl.textContent = `Challenge: ${c.name}`;

  const attInput = document.getElementById('challenge-modal-attempts');
  if (attInput) attInput.value = pc.attempts || '';

  const modal = document.getElementById('challenge-modal');
  if (modal) modal.classList.add('active');
}

function closeChallengeModal() {
  const modal = document.getElementById('challenge-modal');
  if (modal) modal.classList.remove('active');
  _activeChallengeId = null;
}

function saveChallengeProgress() {
  if (!_activeChallengeId) return;
  const c = getChallengeById(_activeChallengeId);
  if (!c) return;

  const attInput = document.getElementById('challenge-modal-attempts');
  const attempts = parseInt(attInput?.value) || 0;

  if (attempts <= 0) {
    attInput?.focus();
    attInput?.classList.add('input-shake');
    setTimeout(() => attInput?.classList.remove('input-shake'), 500);
    return;
  }

  if (!gameState.playerChallenges) gameState.playerChallenges = {};
  const isFirstTime = !gameState.playerChallenges[_activeChallengeId] || !gameState.playerChallenges[_activeChallengeId].completed;

  gameState.playerChallenges[_activeChallengeId] = {
    completed: true,
    attempts: attempts
  };

  closeChallengeModal();
  saveState(gameState);
  renderAll();
  renderChallengeTab();

  if (isFirstTime) {
    showToast(`⚡ You beat the challenge "${c.name}"! (+${c.points} pts)`);
  } else {
    showToast(`⚡ Challenge "${c.name}" updated! (${attempts} attempts)`);
  }
}

// ─────────────────────────────────────────────────────────
//  RENDERING — STATS VIEWER TAB
// ─────────────────────────────────────────────────────────

let _selectedStatsPlayer = null;

function renderStatsTab() {
  const listEl = document.getElementById('stats-ranking-list');
  if (!listEl) return;

  const ranking = buildRanking(gameState);
  listEl.innerHTML = '';

  ranking.forEach((entry, i) => {
    const row = document.createElement('div');
    const numClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
    row.className = `stats-row${entry.isPlayer ? ' player-row' : ''}${_selectedStatsPlayer === entry.name ? ' selected' : ''}`;
    row.innerHTML = `
      <span class="stats-row-num ${numClass}">#${i + 1}</span>
      <span class="stats-row-name">${entry.isPlayer ? '⭐ ' : ''}${entry.name}</span>
      <span class="stats-row-score">${entry.score.toLocaleString()}</span>`;
    row.onclick = () => {
      _selectedStatsPlayer = entry.name;
      document.querySelectorAll('.stats-row').forEach(r => r.classList.remove('selected'));
      row.classList.add('selected');
      renderStatsProfile(entry, i + 1);
    };
    listEl.appendChild(row);
  });

  if (!_selectedStatsPlayer) {
    const playerEntry = ranking.find(e => e.isPlayer);
    if (playerEntry) {
      _selectedStatsPlayer = playerEntry.name;
      const playerRow = listEl.querySelector('.player-row');
      if (playerRow) { playerRow.classList.add('selected'); playerRow.click(); }
    }
  }
}

function renderStatsProfile(entry, rank) {
  const panel = document.getElementById('stats-profile-panel');
  if (!panel) return;

  const completedLevels = entry.completedList
    .map(id => getLevelById(id))
    .filter(Boolean)
    .sort((a, b) => getLevelRank(b.id, gameState) - getLevelRank(a.id, gameState));

  const completedNamesHtml = completedLevels.length > 0
    ? completedLevels.map(l => `<strong>${l.name}</strong>`).join(' · ')
    : '<span style="color:#bbb">No level completions yet</span>';

  const hardest = getHardestCompleted(entry.completedList, gameState);

  panel.innerHTML = `
    <div class="stats-profile-name">${entry.isPlayer ? '⭐ ' : ''}${entry.name}</div>
    <div class="stats-profile-meta">
      <div class="stats-meta-box">
        <div class="stats-meta-label">Demonlist rank</div>
        <div class="stats-meta-value accent">#${rank}</div>
      </div>
      <div class="stats-meta-box">
        <div class="stats-meta-label">Demonlist score</div>
        <div class="stats-meta-value">${entry.score.toLocaleString()}</div>
      </div>
      <div class="stats-meta-box">
        <div class="stats-meta-label">Levels completed</div>
        <div class="stats-meta-value">${entry.completed}</div>
      </div>
      <div class="stats-meta-box">
        <div class="stats-meta-label">Hardest demon</div>
        <div class="stats-meta-value" style="font-size:0.85rem">${hardest ? hardest.name : '—'}</div>
      </div>
    </div>
    <div class="stats-completed-title">Demons completed</div>
    <div class="stats-completed-list">${completedNamesHtml}</div>
    ${entry.challengesCompleted > 0 ? `
      <div class="stats-completed-title" style="margin-top:14px">Challenges Completed</div>
      <div class="stats-completed-list"><strong>level easy</strong></div>
    ` : ''}
  `;
}

// ─────────────────────────────────────────────────────────
//  RENDERING — SEASON TAB
// ─────────────────────────────────────────────────────────

function renderSeasonTab() {
  const listEl  = document.getElementById('upcoming-list');
  const emptyEl = document.getElementById('upcoming-empty');
  if (!listEl) return;

  const locked = getLockedLevels(gameState);

  if (locked.length === 0) {
    listEl.innerHTML  = '';
    if (emptyEl) emptyEl.style.display = 'block';
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';

  listEl.innerHTML = locked.map(level => `
    <div class="upcoming-card">
      <div class="upcoming-thumb" style="background:${level.gradient}">
        <img src="assets/levels/${level.id}.png"
             onerror="this.src='assets/levels/${level.id}.jpg';this.onerror=function(){this.src='assets/levels/${level.id}.jpeg';this.onerror=function(){this.style.display='none'}}"
             alt="${level.name}">
      </div>
      <div class="upcoming-info">
        <div class="upcoming-name">${level.name}</div>
        <div class="upcoming-meta">Turn ${level.unlockTurn} · by <strong>${level.verifier}</strong></div>
      </div>
      <div>
        <button class="btn btn-primary btn-sm" onclick="openVerifyModal('${level.id}')">⭐ Verify</button>
      </div>
    </div>`).join('');
}

// ─────────────────────────────────────────────────────────
//  PROGRESS MODAL
// ─────────────────────────────────────────────────────────

let _modalLevelId = null;

function openProgressModal(levelId) {
  _modalLevelId = levelId;
  const level = getLevelById(levelId);
  const pl    = gameState.playerLevels[levelId];

  document.getElementById('modal-level-name').textContent = level.name;
  document.getElementById('modal-percent').value           = pl.bestPercent || '';
  document.getElementById('modal-attempts').value          = pl.attempts    || '';
  const chk = document.getElementById('modal-complete');
  chk.checked = pl.status === 'complete';
  document.getElementById('complete-attempts-row').style.display = chk.checked ? 'block' : 'none';
  document.getElementById('modal-complete-attempts').value = pl.completedAttempts || '';

  document.getElementById('progress-modal').classList.add('active');
}

function closeProgressModal() {
  document.getElementById('progress-modal')?.classList.remove('active');
  _modalLevelId = null;
}

function onCompleteToggle() {
  const chk = document.getElementById('modal-complete');
  document.getElementById('complete-attempts-row').style.display = chk?.checked ? 'block' : 'none';
}

function saveProgress() {
  if (!_modalLevelId) return;
  const pct     = parseInt(document.getElementById('modal-percent')?.value)            || 0;
  const att     = parseInt(document.getElementById('modal-attempts')?.value)           || 0;
  const isDone  = document.getElementById('modal-complete')?.checked                  || false;
  const doneAtt = parseInt(document.getElementById('modal-complete-attempts')?.value) || att;

  const pl = gameState.playerLevels[_modalLevelId];
  const oldPct = pl.bestPercent || 0;
  if (pct > 0) pl.bestPercent = Math.max(pl.bestPercent, Math.min(pct, 100));
  if (att > 0) pl.attempts    = att;

  const lvl = getLevelById(_modalLevelId);

  if (isDone) {
    pl.status            = 'complete';
    pl.bestPercent       = 100;
    pl.completedAttempts = doneAtt > 0 ? doneAtt : att;
    showToast(`🎉 You beat ${lvl.name}! (${pl.completedAttempts.toLocaleString()} attempts)`);
  } else {
    if (pl.status !== 'complete') pl.status = 'progress';
    if (oldPct < 51 && pl.bestPercent >= 51) {
      showToast(`📊 51%+ Record on ${lvl.name}! (+${Math.round(lvl.points * 0.5)} points awarded)`);
    }
  }

  saveState(gameState);
  closeProgressModal();
  renderAll();
}

// ─────────────────────────────────────────────────────────
//  VERIFY MODAL
// ─────────────────────────────────────────────────────────

let _verifyLevelId = null;

function openVerifyModal(levelId) {
  _verifyLevelId = levelId;
  const level = getLevelById(levelId);
  document.getElementById('verify-level-name').textContent = level.name;
  document.getElementById('verify-attempts').value = '';
  document.getElementById('verify-modal').classList.add('active');
}

function closeVerifyModal() {
  document.getElementById('verify-modal')?.classList.remove('active');
  _verifyLevelId = null;
}

function saveVerification() {
  if (!_verifyLevelId) return;
  const attInput = document.getElementById('verify-attempts');
  const attempts = parseInt(attInput?.value) || 0;

  if (attempts <= 0) {
    attInput?.focus();
    attInput?.classList.add('input-shake');
    setTimeout(() => attInput?.classList.remove('input-shake'), 500);
    return;
  }

  const level = getLevelById(_verifyLevelId);
  const pl    = gameState.playerLevels[_verifyLevelId];

  pl.status            = 'complete';
  pl.playerVerified    = true;
  pl.completedAttempts = attempts;
  pl.bestPercent       = 100;
  pl.attempts          = attempts;

  gameState.eventLog.unshift({
    turn: gameState.currentTurn,
    events: [{
      type: 'player_verify',
      text: `🌟 ${gameState.nick} verified ${level.name}! (${attempts.toLocaleString()} att) — it enters the list now!`
    }]
  });
  if (gameState.eventLog.length > 12) gameState.eventLog = gameState.eventLog.slice(0, 12);

  saveState(gameState);
  closeVerifyModal();
  showToast(`🌟 You verified ${level.name}! It's now on the list!`);
  renderAll();
}

// ─────────────────────────────────────────────────────────
//  ADVANCE TURN
// ─────────────────────────────────────────────────────────

function doAdvanceTurn() {
  if (!gameState || gameState.gameOver) return;

  const { events } = advanceTurn(gameState);

  const eventsEl = document.getElementById('turn-events');
  const titleEl  = document.getElementById('turn-modal-title');
  if (titleEl) titleEl.textContent = `Turn ${gameState.currentTurn - 1} → ${gameState.currentTurn}`;
  if (eventsEl) {
    if (events.length > 0) {
      eventsEl.innerHTML = events.map(e =>
        `<div class="turn-event turn-event-${e.type}">${e.text}</div>`
      ).join('');
    } else {
      eventsEl.innerHTML = '<div class="turn-event turn-event-quiet">A quiet session — everyone grinding in silence...</div>';
    }
  }

  document.getElementById('turn-modal')?.classList.add('active');

  if (gameState.gameOver) setTimeout(() => { closeTurnModal(); showGameOver(); }, 1800);
}

function closeTurnModal() {
  document.getElementById('turn-modal')?.classList.remove('active');
  renderAll();
}

// ─────────────────────────────────────────────────────────
//  GAME OVER
// ─────────────────────────────────────────────────────────

function showGameOver() {
  const modal   = document.getElementById('gameover-modal');
  if (!modal) return;
  const ranking = buildRanking(gameState);
  const rank    = ranking.findIndex(e => e.isPlayer) + 1;
  const score   = getPlayerScore(gameState);
  const completed = Object.entries(gameState.playerLevels)
    .filter(([, v]) => v.status === 'complete').map(([id]) => id);
  const hardest = getHardestCompleted(completed, gameState);

  const msgs = {1:'🥇 LEGENDARY! You topped the global rankings!',3:'🏆 Elite! Top 3!',5:'🔥 Top 5!',10:'💪 Top 10!',15:'📈 Mid-table.',21:'🎮 Keep grinding!'};
  const msg  = Object.keys(msgs).reverse().find(k => rank <= parseInt(k));

  document.getElementById('go-message').textContent   = msgs[msg] || '🎮 Season over!';
  document.getElementById('go-rank').textContent      = `#${rank}`;
  document.getElementById('go-score').textContent     = `${score.toLocaleString()} pts`;
  document.getElementById('go-hardest').textContent   = hardest ? hardest.name : 'None';
  document.getElementById('go-completed').textContent = `${completed.length}/${GI.LEVELS.length}`;
  document.getElementById('go-ranking').innerHTML     = ranking.slice(0, 10).map((e, i) => `
    <div class="go-rank-row ${e.isPlayer ? 'go-player-row' : ''}">
      <span class="go-rank">#${i + 1}</span>
      <span class="go-name">${e.isPlayer ? '⭐ ' : ''}${e.name}</span>
      <span class="go-score">${e.score.toLocaleString()} pts</span>
      <span class="go-levels">${e.completed} lvl</span>
    </div>`).join('');

  modal.classList.add('active');
}

// ─────────────────────────────────────────────────────────
//  RESET
// ─────────────────────────────────────────────────────────

function openResetConfirm()  { document.getElementById('reset-modal')?.classList.add('active'); }
function closeResetConfirm() { document.getElementById('reset-modal')?.classList.remove('active'); }
function doReset()           { resetState(); window.location.href = 'index.html'; }

// ─────────────────────────────────────────────────────────
//  TOAST
// ─────────────────────────────────────────────────────────

function showToast(msg, duration = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className  = 'toast';
  toast.textContent = msg;
  container.appendChild(toast);
  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('toast-show')));
  setTimeout(() => {
    toast.classList.remove('toast-show');
    setTimeout(() => toast.remove(), 320);
  }, duration);
}

// ─────────────────────────────────────────────────────────
//  INDEX PAGE
// ─────────────────────────────────────────────────────────

function initIndexPage() {
  const existing = loadState();
  const section  = document.getElementById('continue-section');
  if (existing && section) {
    section.style.display = 'flex';
    document.getElementById('continue-nick').textContent = existing.nick;
    document.getElementById('continue-turn').textContent = existing.currentTurn;
  }
  document.getElementById('nick-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') startNewGame();
  });
}

function startNewGame() {
  const nickInput = document.getElementById('nick-input');
  const nick      = nickInput?.value.trim() || '';
  if (!nick)         { showIndexError('Please enter your Geometry Dash username!'); return; }
  if (nick.length < 2) { showIndexError('Username must be at least 2 characters!'); return; }
  if (nick.length > 20) { showIndexError('Username is too long (max 20 characters)!'); return; }

  resetState();
  const state = createInitialState(nick);

  // Turn 1 initial unlock: Stereo Madness
  GI.LEVELS.forEach(lvl => {
    if (lvl.unlockTurn === 1) {
      state.playerLevels[lvl.id].status = 'progress';
      const verNpc = state.npcs[lvl.verifier];
      if (verNpc) {
        verNpc.completed.push(lvl.id);
        verNpc.progress[lvl.id] = 100;
        verNpc.attempts[lvl.id] = randInt(10, 80);
      }
    }
  });

  // Top 10 NPCs start with progress or completions on Stereo Madness
  // This guarantees the player starts in LAST place (#21) at 0 pts
  const top10Names = ['Zoink', 'SpaceUK', 'Trick', 'Wwase', 'Cyclic', 'Doggie', 'Combined', 'SrGuillester', 'Shaggy23'];
  top10Names.forEach((name, i) => {
    const npc = state.npcs[name];
    if (!npc) return;
    if (i < 5) {
      // Top 5 NPCs already beat Stereo Madness
      npc.completed.push('stereo_madness');
      npc.progress['stereo_madness'] = 100;
      npc.attempts['stereo_madness'] = randInt(25, 140);
    } else {
      // 6-10 have a 51%+ record (gaining partial record points)
      npc.progress['stereo_madness'] = randInt(55, 92);
    }
  });

  state.eventLog.push({
    turn: 1,
    events: [
      { type: 'season_start', text: `🎮 Season started! Good luck, ${nick}!` },
      { type: 'level_unlock', text: '🆕 Stereo Madness added to the list!' },
      { type: 'npc_verify',   text: '⭐ Riot verified Stereo Madness!' }
    ]
  });

  saveState(state);
  window.location.href = 'game.html';
}

function continueGame()   { window.location.href = 'game.html'; }

function confirmNewGame() {
  if (confirm('Start a new season? Your current progress will be lost.')) {
    resetState();
    location.reload();
  }
}

function showIndexError(msg) {
  const el = document.getElementById('nick-error');
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
  clearTimeout(el._timer);
  el._timer = setTimeout(() => { el.style.display = 'none'; }, 3500);
}

// ─────────────────────────────────────────────────────────
//  GAME PAGE
// ─────────────────────────────────────────────────────────

function initGamePage() {
  gameState = loadState();
  if (!gameState) { window.location.href = 'index.html'; return; }
  loadLevelIds().then(() => {
    renderAll();
    if (document.getElementById('tab-challenges')?.classList.contains('active')) {
      renderChallengeTab();
    }
  });
  renderAll();
  if (gameState.gameOver) setTimeout(showGameOver, 600);
}

// ─────────────────────────────────────────────────────────
//  BOOTSTRAP
// ─────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  if      (page === 'index') initIndexPage();
  else if (page === 'game')  initGamePage();
});
