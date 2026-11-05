// ╔═══════════════════════════════════════════════════════════════════════╗
// ║              GEOMETRY INFINITY — game.js                             ║
// ║              made by asafgamery (asaf)                               ║
// ╠═══════════════════════════════════════════════════════════════════════╣
// ║                                                                       ║
// ║  asafgamery: this whole project took me like 2 weeks to build        ║
// ║  asafgamery: i'm not the most experienced dev so it took a while     ║
// ║  asafgamery: but i'm really happy with how it turned out             ║
// ║                                                                       ║
// ╠═══════════════════════════════════════════════════════════════════════╣
// ║  HOW THE ENGINE WORKS                                                 ║
// ╠═══════════════════════════════════════════════════════════════════════╣
// ║                                                                       ║
// ║  asafgamery: NO build system, NO framework, NO npm.                  ║
// ║  asafgamery: pure vanilla JS + HTML + CSS. one file each.            ║
// ║                                                                       ║
// ║  asafgamery: STATE — everything is stored in one big object called   ║
// ║  asafgamery: `gameState`. it gets serialized to JSON and saved in    ║
// ║  asafgamery: localStorage so the game persists between sessions.     ║
// ║                                                                       ║
// ║  asafgamery: TURNS — the game runs in turns (up to 30 per season).   ║
// ║  asafgamery: each turn, `advanceTurn()` is called. it handles:       ║
// ║  asafgamery:   - unlocking new levels from the schedule              ║
// ║  asafgamery:   - NPC players completing or progressing on levels     ║
// ║  asafgamery:   - inserting levels into the ranked list               ║
// ║  asafgamery:   - triggering special story events                     ║
// ║                                                                       ║
// ║  asafgamery: RANKING — levels are stored with a numeric `rank`       ║
// ║  asafgamery: value in `state.levelRanks`. higher rank = harder =     ║
// ║  asafgamery: higher on the list. `insertLevelAtPosition()` re-ranks  ║
// ║  asafgamery: ALL visible levels cleanly every time a new one enters. ║
// ║                                                                       ║
// ║  asafgamery: NPCS — each NPC is an object inside `gameState.npcs`.   ║
// ║  asafgamery: they have a `completed` array and `progress` on current ║
// ║  asafgamery: level. every turn they roll dice to decide if they beat ║
// ║  asafgamery: a level or just make progress. this makes the           ║
// ║  asafgamery: leaderboard feel alive and competitive.                 ║
// ║                                                                       ║
// ║  asafgamery: SEASONS — there are 2 seasons, each with their own      ║
// ║  asafgamery: level schedule. season 2 starts with all season 1       ║
// ║  asafgamery: levels already unlocked and verified, then adds new     ║
// ║  asafgamery: demons progressively. the player picks their season     ║
// ║  asafgamery: on the index page.                                      ║
// ║                                                                       ║
// ║  asafgamery: RENDERING — there's no virtual DOM or reactivity lib.   ║
// ║  asafgamery: `renderAll()` just rebuilds innerHTML from scratch each ║
// ║  asafgamery: time something changes. it's simple and it works.       ║
// ║                                                                       ║
// ║  asafgamery: ACHIEVEMENTS — defined in `GI.ACHIEVEMENTS[]`. each     ║
// ║  asafgamery: has an id, name, desc, svg icon, and optional rainbow   ║
// ║  asafgamery: flags. `checkAchievements()` runs after every action.   ║
// ║                                                                       ║
// ║  asafgamery: SAVE/LOAD — `saveState()` writes gameState to           ║
// ║  asafgamery: localStorage. `loadState()` reads it back. if nothing   ║
// ║  asafgamery: is saved, the game redirects to the index page.         ║
// ║                                                                       ║
// ║  asafgamery: ADMIN PANEL — debug panel for testing without resetting ║
// ║  asafgamery: the game. lets you jump turns, beat levels, unlock      ║
// ║  asafgamery: achievements and add score instantly.                   ║
// ║                                                                       ║
// ╚═══════════════════════════════════════════════════════════════════════╝

// =========================================================
//  asafgamery: GEOMETRY INFINITY — game.js
//  asafgamery: Single-player GD Top Player Simulator
// =========================================================
'use strict';

// asafgamery: ─────────────────────────────────────────────────────────
//  asafgamery: CONSTANTS
// asafgamery: ─────────────────────────────────────────────────────────

const GI = {
  SAVE_KEY:  'geometry_infinity_save',
  MAX_TURNS: 30,

  // asafgamery: ─────────────────────────────────────────────────────────
  //  asafgamery: LEVEL IDs (PUT GEOMETRY DASH IDs HERE)
  // asafgamery: ─────────────────────────────────────────────────────────
  LEVEL_IDS: {
    'Stereo Madness': '',
    'Back on Track':  '',
    'Polargeist':     '',
    'Dry Out':        '',
    'Base After Base':'',
    "Can't Let Go":   '',
    'Jumper':         '',
    'level easy':     '11940',
    'Dark Paradise':  '11280109',
    'Retray':         '6508283',
    'Dream Land':     '150245',
    'Golden Club':    '1446958',
    'goldenclub':     '1446958',
    'Flappy Hexagon': '1642022',
    'Stage IX':       '977287',
    'Stereo Madness II': '72462399',
    'Sonar':          '4454123',
    'Promises':       '26618473',
    'Promisses':      '26618473',
    'Let Me Go':      '151862414',
    'Time Machine':   '',
    'Amplification':  '20635816',
    'First Race':     '27483789'
  },

  // asafgamery: ── SEASON 1 LEVELS (Classic) ──
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
      gradient: 'linear-gradient(135deg, #880e4f, #d81b60, #ff4081)',
      diffLabel: 'Harder', diffColor: '#f48fb1'
    }
  ],

  // asafgamery: ── SEASON 1 CHALLENGES ──
  CHALLENGES: [
    {
      id: 'level_easy',
      name: 'level easy',
      points: 200,
      unlockTurn: 1,
      gradient: 'linear-gradient(135deg, #11998e, #38ef7d)',
      diffLabel: 'Challenge',
      diffColor: '#69f0ae'
    }
  ],

  // asafgamery: ── SEASON 2 LEVELS (All S1 unlocked at turn 1 + New Demons) ──
  SEASON_2_LEVELS: [
    // asafgamery: Original 7 levels (all unlocked and verified from Turn 1)
    {
      id: 'stereo_madness', name: 'Stereo Madness',
      rank: 1, unlockTurn: 1, verifier: 'Riot', points: 50,
      gradient: 'linear-gradient(135deg, #0d47a1, #42a5f5)',
      diffLabel: 'Auto', diffColor: '#90caf9'
    },
    {
      id: 'back_on_track', name: 'Back on Track',
      rank: 2, unlockTurn: 1, verifier: 'Zoink', points: 110,
      gradient: 'linear-gradient(135deg, #1b5e20, #66bb6a)',
      diffLabel: 'Easy', diffColor: '#a5d6a7'
    },
    {
      id: 'polargeist', name: 'Polargeist',
      rank: 3, unlockTurn: 1, verifier: 'Doggie', points: 200,
      gradient: 'linear-gradient(135deg, #bf360c, #ffa726)',
      diffLabel: 'Normal', diffColor: '#ffcc80'
    },
    {
      id: 'dry_out', name: 'Dry Out',
      rank: 4, unlockTurn: 1, verifier: 'Michigun', points: 320,
      gradient: 'linear-gradient(135deg, #b71c1c, #ef5350)',
      diffLabel: 'Hard', diffColor: '#ef9a9a'
    },
    {
      id: 'base_after_base', name: 'Base After Base',
      rank: 5, unlockTurn: 1, verifier: 'Cyclic', points: 470,
      gradient: 'linear-gradient(135deg, #880e4f, #e91e63)',
      diffLabel: 'Harder', diffColor: '#f48fb1'
    },
    {
      id: 'cant_let_go', name: "Can't Let Go",
      rank: 6, unlockTurn: 1, verifier: 'SpaceUK', points: 660,
      gradient: 'linear-gradient(135deg, #4a148c, #ab47bc)',
      diffLabel: 'Insane', diffColor: '#ce93d8'
    },
    {
      id: 'jumper', name: 'Jumper',
      rank: 7, unlockTurn: 1, verifier: 'Trick', points: 900,
      gradient: 'linear-gradient(135deg, #880e4f, #d81b60, #ff4081)',
      diffLabel: 'Harder', diffColor: '#f48fb1'
    },

    // asafgamery: New Season 2 Demons arriving on specific turns
    {
      id: 'promises', name: 'Promises',
      rank: 8, unlockTurn: 1, targetPos: 3, verifier: 'Zoink',
      points: 700,
      gradient: 'linear-gradient(135deg, #1b5e20, #00e676)',
      diffLabel: 'Harder', diffColor: '#69f0ae'
    },
    {
      id: 'amplification', name: 'Amplification',
      rank: 9, unlockTurn: 5, targetPos: 2, verifier: 'Doggie',
      points: 950,
      gradient: 'linear-gradient(135deg, #e65100, #ff9800)',
      diffLabel: 'Insane', diffColor: '#ffb74d'
    },
    {
      id: 'dream_land', name: 'Dream Land',
      rank: 10, unlockTurn: 9, targetPos: 5, verifier: 'SrGuillester',
      points: 600,
      gradient: 'linear-gradient(135deg, #4a148c, #8e24aa)',
      diffLabel: 'Hard', diffColor: '#ce93d8'
    },
    {
      id: 'golden_club', name: 'Golden Club',
      rank: 11, unlockTurn: 11, targetPos: 5, verifier: 'KrmaL',
      points: 650,
      gradient: 'linear-gradient(135deg, #f57f17, #fbc02d)',
      diffLabel: 'Harder', diffColor: '#fff59d'
    },
    {
      id: 'stereo_madness_ii', name: 'Stereo Madness II',
      rank: 12, unlockTurn: 13, targetPos: 2, verifier: 'Riot',
      points: 1300,
      gradient: 'linear-gradient(135deg, #b71c1c, #ff1744)',
      diffLabel: 'Extreme Demon', diffColor: '#ff1744'
    },
    {
      id: 'first_race', name: 'First Race',
      rank: 13, unlockTurn: 17, targetPos: 4, verifier: 'Cyclic',
      points: 820,
      gradient: 'linear-gradient(135deg, #0d47a1, #1e88e5)',
      diffLabel: 'Insane', diffColor: '#90caf9'
    },
    {
      id: 'time_machine', name: 'Time Machine',
      rank: 14, unlockTurn: 22, targetPos: 2, verifier: 'Trick',
      points: 1100,
      gradient: 'linear-gradient(135deg, #311b92, #651fff)',
      diffLabel: 'Insane', diffColor: '#b388ff'
    },
    {
      id: 'let_me_go', name: 'Let Me Go',
      rank: 15, unlockTurn: 25, targetPos: 1, verifier: 'SpaceUK',
      points: 1650,
      gradient: 'linear-gradient(135deg, #1a0022, #b71c1c)',
      diffLabel: 'Extreme Demon', diffColor: '#ff5252',
      specialNote: 'Recommended to use the NONG DomsYeah Remix for this level (optional)'
    }
  ],

  // asafgamery: ── SEASON 2 CHALLENGES (Includes S1 challenge + 5 new challenges) ──
  SEASON_2_CHALLENGES: [
    {
      id: 'level_easy',
      name: 'level easy',
      points: 200,
      unlockTurn: 1,
      gradient: 'linear-gradient(135deg, #11998e, #38ef7d)',
      diffLabel: 'Challenge',
      diffColor: '#69f0ae'
    },
    {
      id: 'retray',
      name: 'Retray',
      points: 150,
      unlockTurn: 2,
      gradient: 'linear-gradient(135deg, #004d40, #00bfa5)',
      diffLabel: 'Challenge',
      diffColor: '#80cbc4'
    },
    {
      id: 'dark_paradise',
      name: 'Dark Paradise',
      points: 220,
      unlockTurn: 6,
      gradient: 'linear-gradient(135deg, #263238, #607d8b)',
      diffLabel: 'Challenge',
      diffColor: '#b0bec5'
    },
    {
      id: 'flappy_hexagon',
      name: 'Flappy Hexagon',
      points: 280,
      unlockTurn: 17,
      gradient: 'linear-gradient(135deg, #4a148c, #ab47bc)',
      diffLabel: 'Challenge',
      diffColor: '#e1bee7'
    },
    {
      id: 'stage_ix',
      name: 'Stage IX',
      points: 340,
      unlockTurn: 20,
      gradient: 'linear-gradient(135deg, #bf360c, #ff7043)',
      diffLabel: 'Challenge',
      diffColor: '#ffccbc'
    },
    {
      id: 'sonar',
      name: 'Sonar',
      points: 400,
      unlockTurn: 27,
      gradient: 'linear-gradient(135deg, #01579b, #03a9f4)',
      diffLabel: 'Challenge',
      diffColor: '#b3e5fc'
    }
  ],

  // asafgamery: ── TROPHIES & ACHIEVEMENTS DEFINITIONS (IN ENGLISH) ──
  ACHIEVEMENTS: [
    {
      id: 'verify_top1',
      name: 'Top 1 Verifier',
      desc: 'Verify a level that enters as absolute TOP 1 on the Demonlist',
      svg: `<svg viewBox="0 0 24 24" fill="none" class="achievement-icon-svg"><path d="M7 4h10v3a5 5 0 0 1-10 0V4z" fill="#f59e0b"/><path d="M5 6H3a2 2 0 0 0-2 2v1a4 4 0 0 0 4 4h2M19 6h2a2 2 0 0 1 2 2v1a4 4 0 0 1-4 4h-2" stroke="#f59e0b" stroke-width="2"/><path d="M10 16h4v4h-4z" fill="#d97706"/><path d="M7 20h10v2H7z" fill="#b45309"/><circle cx="12" cy="7" r="2" fill="#fff"/></svg>`
    },
    {
      id: 'first_victor_top1',
      name: 'First Victor',
      desc: 'Be the first victor worldwide to conquer a TOP 1 before any NPC',
      svg: `<svg viewBox="0 0 24 24" fill="none" class="achievement-icon-svg"><path d="M3 18h18v3H3z" fill="#f59e0b"/><path d="M4 17l2-10 4.5 5L12 5l1.5 7L18 7l2 10H4z" fill="#fbbf24" stroke="#d97706" stroke-width="1.5"/><circle cx="4" cy="7" r="1.5" fill="#ef4444"/><circle cx="12" cy="5" r="1.5" fill="#3b82f6"/><circle cx="20" cy="7" r="1.5" fill="#10b981"/></svg>`
    },
    {
      id: 'top3_titans',
      name: 'Trio of Titans',
      desc: 'Conquer the 3 hardest levels on the current Demonlist (Top 1, Top 2, and Top 3)',
      svg: `<svg viewBox="0 0 24 24" fill="none" class="achievement-icon-svg"><path d="M12 2l2.4 5 5.6.8-4 4 1 5.6L12 15l-5 2.4 1-5.6-4-4 5.6-.8L12 2z" fill="#ff4081"/><path d="M5 13l1.2 2.5 2.8.4-2 2 .5 2.8-2.5-1.3-2.5 1.3.5-2.8-2-2 2.8-.4L5 13z" fill="#7c4dff"/><path d="M19 13l1.2 2.5 2.8.4-2 2 .5 2.8-2.5-1.3-2.5 1.3.5-2.8-2-2 2.8-.4L19 13z" fill="#00e5ff"/></svg>`
    },
    {
      id: 'first_level',
      name: 'First Step',
      desc: 'Complete your very first Demonlist level',
      svg: `<svg viewBox="0 0 24 24" fill="none" class="achievement-icon-svg"><rect x="3" y="3" width="18" height="18" rx="4" fill="#10b981"/><rect x="6" y="6" width="12" height="12" rx="2" fill="#059669"/><path d="M8 12l3 3 5-5" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
    },
    {
      id: 'first_challenge',
      name: 'Challenger',
      desc: 'Complete your very first challenge',
      svg: `<svg viewBox="0 0 24 24" fill="none" class="achievement-icon-svg"><path d="M13 2L3 14h8l-2 8 12-13h-8l2-7z" fill="#eab308" stroke="#ca8a04" stroke-width="1.5" stroke-linejoin="round"/></svg>`
    },
    {
      id: 'challenges_3',
      name: 'Challenge Master',
      desc: 'Complete 3 different challenges',
      svg: `<svg viewBox="0 0 24 24" fill="none" class="achievement-icon-svg"><path d="M12 2l8 4v6c0 5.5-3.5 10.7-8 12-4.5-1.3-8-6.5-8-12V6l8-4z" fill="#3b82f6"/><path d="M12 6l-3 5h3l-1 4 4-6h-3l2-3h-2z" fill="#fbbf24"/></svg>`
    },
    {
      id: 'alpha_trilogy',
      name: 'Alpha Trilogy Champion',
      desc: 'Beat the complete legendary Alpha Trilogy: Retray, Dark Paradise, and Sonar!',
      svg: `<svg viewBox="0 0 24 24" fill="none" class="achievement-icon-svg"><path d="M12 2L2 20h20L12 2zm0 4.5l6.5 11.5h-13L12 6.5z" fill="#00e5ff"/><circle cx="12" cy="13" r="3" fill="#ff4081"/><circle cx="6" cy="18" r="2" fill="#ffd700"/><circle cx="18" cy="18" r="2" fill="#76ff03"/></svg>`
    },
    {
      id: 'all_challenges',
      name: 'Challenge God',
      desc: 'Beat every single challenge in the season! Mythical achievement!',
      isRainbow: true,
      svg: `<svg viewBox="0 0 24 24" fill="none" class="achievement-icon-svg"><defs><linearGradient id="rgbGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ff0055"/><stop offset="33%" stop-color="#ffee00"/><stop offset="66%" stop-color="#00ff66"/><stop offset="100%" stop-color="#00bbff"/></linearGradient></defs><path d="M6 3h12l5 6-11 12L1 9l5-6z" fill="url(#rgbGrad)" stroke="#fff" stroke-width="1.2"/><path d="M1 9h22M6 3l6 18 6-18M12 3v18" stroke="rgba(255,255,255,0.7)" stroke-width="1"/></svg>`
    },
    {
      id: 'all_levels',
      name: 'Geometry Infinity',
      desc: 'Beat every single level on the main Demonlist! The ultimate and most difficult achievement!',
      isRainbowLegend: true,
      svg: `<svg viewBox="0 0 24 24" fill="none" class="achievement-icon-svg"><defs><linearGradient id="legendGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ff007f"/><stop offset="25%" stop-color="#ffaa00"/><stop offset="50%" stop-color="#00ffaa"/><stop offset="75%" stop-color="#00aaff"/><stop offset="100%" stop-color="#aa00ff"/></linearGradient></defs><path d="M18.178 8c-1.38 0-2.673.65-3.513 1.688L12 12.875l-2.665-3.187C8.495 8.65 7.202 8 5.822 8 3.163 8 1 10.238 1 13s2.163 5 4.822 5c1.38 0 2.673-.65 3.513-1.688L12 13.125l2.665 3.187c.84 1.038 2.133 1.688 3.513 1.688 2.659 0 4.822-2.238 4.822-5s-2.163-5-4.822-5zm-12.356 8c-1.554 0-2.822-1.343-2.822-3s1.268-3 2.822-3c.896 0 1.737.478 2.25 1.25L9.648 13l-1.576 1.75c-.513.772-1.354 1.25-2.25 1.25zm12.356 0c-.896 0-1.737-.478-2.25-1.25L14.352 13l1.576-1.75c.513-.772 1.354-1.25 2.25-1.25 1.554 0 2.822 1.343 2.822 3s-1.268 3-2.822 3z" fill="url(#legendGrad)"/><circle cx="12" cy="13" r="2" fill="#fff"/></svg>`
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

// asafgamery: ─────────────────────────────────────────────────────────
//  asafgamery: UTILITIES
// asafgamery: ─────────────────────────────────────────────────────────

function rand(min, max)    { return Math.random() * (max - min) + min; }
function randInt(min, max) { return Math.floor(rand(min, max + 1)); }

function getSeasonBaseLevels(season = 1) {
  return season === 2 ? GI.SEASON_2_LEVELS : GI.LEVELS;
}

function getSeasonBaseChallenges(season = 1) {
  return season === 2 ? GI.SEASON_2_CHALLENGES : GI.CHALLENGES;
}

function getAllLevels(state) {
  const curState = state || (typeof gameState !== 'undefined' ? gameState : null);
  const season = (curState && curState.season) || 1;
  const baseLevels = getSeasonBaseLevels(season);
  const custom = (curState && curState.customLevels) ? curState.customLevels : [];
  return [...baseLevels, ...custom];
}

function getLevelById(id, state) {
  if (!id) return null;
  const curState = state || (typeof gameState !== 'undefined' ? gameState : null);
  const season = (curState && curState.season) || 1;

  // asafgamery: Search current season first
  const currentBase = getSeasonBaseLevels(season);
  const found = currentBase.find(l => l.id === id);
  if (found) return found;

  // asafgamery: Search other season if not found
  const otherBase = season === 2 ? GI.LEVELS : GI.SEASON_2_LEVELS;
  const foundOther = otherBase.find(l => l.id === id);
  if (foundOther) return foundOther;

  // asafgamery: Search custom levels
  if (curState && curState.customLevels) {
    const custom = curState.customLevels.find(l => l.id === id);
    if (custom) return custom;
  }
  return null;
}

function getSeasonChallenges(state) {
  const curState = state || (typeof gameState !== 'undefined' ? gameState : null);
  const season = (curState && curState.season) || 1;
  return getSeasonBaseChallenges(season);
}

function getChallengeById(id, state) {
  if (!id) return null;
  const allChal = [...GI.CHALLENGES, ...GI.SEASON_2_CHALLENGES];
  return allChal.find(c => c.id === id) || null;
}

// asafgamery: Effective rank calculation (takes into account dynamic levelRanks and Turn 27 Can't Let Go swap)
function getLevelRank(levelId, state) {
  if (!levelId) return 0;
  const curState = state || (typeof gameState !== 'undefined' ? gameState : null);
  if (curState && curState.levelRanks && curState.levelRanks[levelId] != null) {
    return Number(curState.levelRanks[levelId]);
  }
  const lvl = getLevelById(levelId, curState);
  if (!lvl) return 0;
  if (curState && curState.season === 1 && curState.cantLetGoTop1) {
    if (levelId === 'cant_let_go') return 7.5; // Higher than Jumper (7)
    if (levelId === 'jumper')      return 7.0;
  }
  return Number(lvl.rank) || 0;
}

// asafgamery: Ensures all unlocked levels have properly indexed relative ranks
function ensureLevelRanks(state) {
  if (!state) return;
  if (!state.levelRanks) state.levelRanks = {};

  const unlocked = getAllLevels(state).filter(l => state.playerLevels[l.id] && state.playerLevels[l.id].status !== 'locked');
  const needsReindex = unlocked.some(l => state.levelRanks[l.id] == null);
  if (needsReindex) {
    unlocked.sort((a, b) => {
      let rA = state.levelRanks[a.id] != null ? state.levelRanks[a.id] : a.rank;
      let rB = state.levelRanks[b.id] != null ? state.levelRanks[b.id] : b.rank;
      if (state.cantLetGoTop1) {
        if (a.id === 'cant_let_go') rA = 9999;
        if (b.id === 'cant_let_go') rB = 9999;
      }
      return rB - rA;
    });

    const total = unlocked.length;
    unlocked.forEach((l, idx) => {
      const rankVal = (total - idx) * 10;
      state.levelRanks[l.id] = rankVal;
      if (l.isCustom) l.rank = rankVal;
    });
  }
}

// asafgamery: Inserts a level (official or custom) at a specific position (1 = Top 1, 2 = Top 2, etc.)
// asafgamery: and shifts all existing levels down accordingly!
function insertLevelAtPosition(state, levelId, targetPos) {
  if (!state || !levelId) return;
  ensureLevelRanks(state);

  // asafgamery: All unlocked levels except levelId, ordered hardest to easiest
  const unlocked = getAllLevels(state)
    .filter(l => l.id !== levelId && state.playerLevels[l.id] && state.playerLevels[l.id].status !== 'locked')
    .sort((a, b) => getLevelRank(b.id, state) - getLevelRank(a.id, state));

  const targetLevel = getLevelById(levelId, state);
  if (!targetLevel) return;

  const posIndex = Math.max(0, Math.min(unlocked.length, (targetPos || 1) - 1));
  unlocked.splice(posIndex, 0, targetLevel);

  // asafgamery: Re-rank all levels from bottom to top so positions are cleanly spaced
  const total = unlocked.length;
  unlocked.forEach((lvl, idx) => {
    const rankVal = (total - idx) * 10;
    if (!state.levelRanks) state.levelRanks = {};
    state.levelRanks[lvl.id] = rankVal;
    if (lvl.isCustom) lvl.rank = rankVal;
  });
}

// asafgamery: Returns visible levels sorted HARDEST FIRST (highest rank = #1 in list)
function getVisibleLevelsSorted(state) {
  ensureLevelRanks(state);
  return getAllLevels(state)
    .filter(l => state.playerLevels[l.id] && state.playerLevels[l.id].status !== 'locked')
    .sort((a, b) => getLevelRank(b.id, state) - getLevelRank(a.id, state));
}

function getLockedLevels(state) {
  return getAllLevels(state).filter(l => !state.playerLevels[l.id] || state.playerLevels[l.id].status === 'locked');
}

// asafgamery: ─────────────────────────────────────────────────────────
//  asafgamery: LEVEL IDS LOADER (from level_ids.txt)
// asafgamery: ─────────────────────────────────────────────────────────

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
    // asafgamery: Try fetch first
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
          // asafgamery: Fallback to XMLHttpRequest for file://
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
  // asafgamery: Check GI.LEVEL_IDS first
  if (GI.LEVEL_IDS) {
    for (const [key, val] of Object.entries(GI.LEVEL_IDS)) {
      if (key.trim().toLowerCase() === clean && val && val.trim() !== '') {
        return val.trim();
      }
    }
  }
  // asafgamery: Fallback to loaded txt map if present
  return _levelIdsMap[clean] || null;
}

// asafgamery: ─────────────────────────────────────────────────────────
//  asafgamery: STATE MANAGEMENT
// asafgamery: ─────────────────────────────────────────────────────────

function createInitialState(nick, season = 1) {
  const chosenSeason = parseInt(season) || 1;
  const npcs = {};
  GI.NPCS.forEach(npc => {
    npcs[npc.name] = {
      progress: {},
      completed: [],
      attempts: {},
      challenges: {}
    };
  });

  const baseLevels = getSeasonBaseLevels(chosenSeason);
  const playerLevels = {};
  const levelRanks = {};

  if (chosenSeason === 2) {
    // asafgamery: In Season 2: The 7 classic S1 levels are all already verified & unlocked for play!
    const s1Ids = ['stereo_madness', 'back_on_track', 'polargeist', 'dry_out', 'base_after_base', 'cant_let_go', 'jumper'];
    s1Ids.forEach((id, idx) => {
      const lvl = baseLevels.find(l => l.id === id);
      if (lvl) {
        playerLevels[id] = {
          status: 'progress', // Available for the player to play
          attempts: 0,
          bestPercent: 0,
          completedAttempts: null,
          playerVerified: false
        };
        levelRanks[id] = (idx + 1) * 10;
        // asafgamery: The original NPC verifier already beat it
        const verNpc = npcs[lvl.verifier];
        if (verNpc) {
          verNpc.completed.push(id);
          verNpc.progress[id] = 100;
          verNpc.attempts[id] = randInt(15, 95);
        }
      }
    });

    // asafgamery: The other Season 2 levels start locked
    baseLevels.forEach(lvl => {
      if (!playerLevels[lvl.id]) {
        playerLevels[lvl.id] = {
          status: 'locked',
          attempts: 0,
          bestPercent: 0,
          completedAttempts: null,
          playerVerified: false
        };
      }
    });

  } else {
    // asafgamery: Season 1: Standard initialization (all locked initially)
    baseLevels.forEach(lvl => {
      playerLevels[lvl.id] = {
        status: 'locked',
        attempts: 0,
        bestPercent: 0,
        completedAttempts: null,
        playerVerified: false
      };
    });
    levelRanks['stereo_madness'] = 10;
  }

  const baseChallenges = getSeasonBaseChallenges(chosenSeason);
  const playerChallenges = {};
  baseChallenges.forEach(c => {
    playerChallenges[c.id] = {
      completed: false,
      attempts: 0
    };
  });

  const state = {
    nick,
    season: chosenSeason,
    currentTurn: 1,
    gameOver: false,
    cantLetGoTop1: false,
    customLevels: [],
    levelRanks,
    playerLevels,
    playerChallenges,
    achievements: {},
    npcs,
    eventLog: []
  };

  return state;
}

function loadState() {
  try {
    const raw = localStorage.getItem(GI.SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.season == null) parsed.season = 1;
    if (!parsed.achievements) parsed.achievements = {};

    const curChallenges = getSeasonBaseChallenges(parsed.season);
    if (!parsed.playerChallenges) parsed.playerChallenges = {};
    curChallenges.forEach(c => {
      if (!parsed.playerChallenges[c.id]) {
        parsed.playerChallenges[c.id] = { completed: false, attempts: 0 };
      }
    });

    const curBaseLevels = getSeasonBaseLevels(parsed.season);
    curBaseLevels.forEach(lvl => {
      if (!parsed.playerLevels[lvl.id]) {
        parsed.playerLevels[lvl.id] = {
          status: lvl.unlockTurn <= parsed.currentTurn ? 'progress' : 'locked',
          attempts: 0,
          bestPercent: 0,
          completedAttempts: null,
          playerVerified: false
        };
      }
    });

    if (!parsed.customLevels) {
      parsed.customLevels = [];
    }
    // asafgamery: Ensure integrity for custom levels
    parsed.customLevels.forEach(cl => {
      if (!parsed.playerLevels[cl.id]) {
        parsed.playerLevels[cl.id] = {
          status: 'progress',
          attempts: 0,
          bestPercent: 0,
          completedAttempts: null,
          playerVerified: false
        };
      }
      GI.NPCS.forEach(npcDef => {
        const npc = parsed.npcs && parsed.npcs[npcDef.name];
        if (npc) {
          if (npc.progress[cl.id] === undefined) npc.progress[cl.id] = 0;
          if (npc.attempts[cl.id] === undefined) npc.attempts[cl.id] = 0;
        }
      });
    });
    ensureLevelRanks(parsed);
    return parsed;
  } catch (e) { return null; }
}

function saveState(state)  { localStorage.setItem(GI.SAVE_KEY, JSON.stringify(state)); }
function resetState()      { localStorage.removeItem(GI.SAVE_KEY); }

// asafgamery: ─────────────────────────────────────────────────────────
//  asafgamery: SCORE
// asafgamery: ─────────────────────────────────────────────────────────

function calcAttemptBonus(pts, att) {
  if (!att || att <= 0) return 0;
  if (att < 100)  return Math.round(pts * 0.70);
  if (att < 300)  return Math.round(pts * 0.40);
  if (att < 1000) return Math.round(pts * 0.20);
  return 0;
}

// asafgamery: Player score calculation:
// asafgamery: - 100% complete: lvl.points + attempt bonus
// asafgamery: - 51% to 99%: 50% base points (no attempt bonus yet)
// asafgamery: - Challenges: full challenge points
function getPlayerScore(state) {
  let score = 0;

  // asafgamery: Levels
  Object.entries(state.playerLevels).forEach(([id, pl]) => {
    const lvl = getLevelById(id);
    if (!lvl) return;
    if (pl.status === 'complete') {
      score += lvl.points + calcAttemptBonus(lvl.points, pl.completedAttempts || pl.attempts);
    } else if (pl.bestPercent >= 51) {
      score += Math.round(lvl.points * 0.50);
    }
  });

  // asafgamery: Challenges
  if (state.playerChallenges) {
    Object.entries(state.playerChallenges).forEach(([id, pc]) => {
      if (pc.completed) {
        const chal = getChallengeById(id);
        if (chal) score += chal.points + calcAttemptBonus(chal.points, pc.attempts);
      }
    });
  }

  score += (state.adminBonusScore || 0);

  return score;
}

// asafgamery: NPC score calculation:
// asafgamery: - Completed levels: lvl.points + attempt bonus
// asafgamery: - Incomplete with progress >= 51%: 50% base points
// asafgamery: - Challenges completed: challenge points
function getNPCScore(npc, state) {
  let score = 0;

  // asafgamery: Levels (officials + custom)
  getAllLevels(state).forEach(lvl => {
    if (npc.completed.includes(lvl.id)) {
      score += lvl.points + calcAttemptBonus(lvl.points, npc.attempts[lvl.id] || 0);
    } else if ((npc.progress[lvl.id] || 0) >= 51) {
      score += Math.round(lvl.points * 0.50);
    }
  });

  // asafgamery: Challenges
  if (npc.challenges) {
    getSeasonChallenges(state).forEach(c => {
      if (npc.challenges[c.id]) {
        score += c.points;
      }
    });
  }

  return score;
}

// asafgamery: ─────────────────────────────────────────────────────────
//  asafgamery: ACHIEVEMENTS SYSTEM
// asafgamery: ─────────────────────────────────────────────────────────

function checkAchievements(state) {
  if (!state) return [];
  if (!state.achievements) state.achievements = {};

  const newlyUnlocked = [];

  function unlock(id) {
    if (!state.achievements[id]) {
      state.achievements[id] = true;
      const ach = GI.ACHIEVEMENTS.find(a => a.id === id);
      if (ach) newlyUnlocked.push(ach);
    }
  }

  const visible = getVisibleLevelsSorted(state);
  const playerCompletedLevels = Object.entries(state.playerLevels)
    .filter(([, v]) => v.status === 'complete').map(([id]) => id);
  const playerCompletedChallenges = state.playerChallenges
    ? Object.entries(state.playerChallenges).filter(([, v]) => v.completed).map(([id]) => id)
    : [];

  // asafgamery: 1. first_level: "Consiga passar seu primeiro level"
  if (playerCompletedLevels.length >= 1) {
    unlock('first_level');
  }

  // asafgamery: 2. first_challenge: "Consiga passar seu primeiro challenge"
  if (playerCompletedChallenges.length >= 1) {
    unlock('first_challenge');
  }

  // asafgamery: 3. challenges_3: "Passe 3 challenges"
  if (playerCompletedChallenges.length >= 3) {
    unlock('challenges_3');
  }

  // asafgamery: 4. all_challenges: "Passe todos os challenges"
  const currentChallenges = getSeasonChallenges(state);
  if (currentChallenges.length > 0 && currentChallenges.every(c => state.playerChallenges && state.playerChallenges[c.id]?.completed)) {
    unlock('all_challenges');
  }

  // asafgamery: 5. all_levels: "Passe todos os leveis" (A mais difícil do jogo!)
  const allSeasonLevels = getAllLevels(state);
  if (allSeasonLevels.length > 0 && allSeasonLevels.every(l => state.playerLevels[l.id]?.status === 'complete')) {
    unlock('all_levels');
  }

  // asafgamery: 6. top3_titans: "Consiga passar os 3 leveis mais difíceis"
  if (visible.length >= 3) {
    const top3 = visible.slice(0, 3);
    const passedAllTop3 = top3.every(l => state.playerLevels[l.id]?.status === 'complete');
    if (passedAllTop3) {
      unlock('top3_titans');
    }
  }

  // asafgamery: 7. alpha_trilogy: "Alpha Trilogy Champion"
  if (state.playerChallenges) {
    const hasRetray = state.playerChallenges['retray']?.completed;
    const hasDarkParadise = state.playerChallenges['dark_paradise']?.completed;
    const hasSonar = state.playerChallenges['sonar']?.completed;
    if (hasRetray && hasDarkParadise && hasSonar) {
      unlock('alpha_trilogy');
    }
  }

  // asafgamery: 8. verify_top1: "Top 1 Verifier"
  if (visible.length > 0) {
    const top1 = visible[0];
    const pl1 = state.playerLevels[top1.id];
    if (pl1 && pl1.playerVerified) {
      unlock('verify_top1');
    }
  }

  // asafgamery: 9. first_victor_top1: "First Victor of a Top 1"
  if (visible.length > 0) {
    const top1 = visible[0];
    const pl1 = state.playerLevels[top1.id];
    if (pl1 && pl1.status === 'complete') {
      const anyNpcBeat = GI.NPCS.some(npcDef => {
        const npc = state.npcs[npcDef.name];
        return npc && npc.completed && npc.completed.includes(top1.id);
      });
      if (!anyNpcBeat || pl1.playerVerified) {
        unlock('first_victor_top1');
      }
    }
  }

  if (newlyUnlocked.length > 0) {
    saveState(state);
    newlyUnlocked.forEach(ach => {
      showToast(`🏆 Achievement Unlocked: ${ach.name}!`, 4500);
    });
  }

  return newlyUnlocked;
}

function getHardestCompleted(completedIds, state) {
  if (!completedIds || completedIds.length === 0) return null;
  return completedIds.reduce((best, id) => {
    const lvl = getLevelById(id, state);
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
      score: getNPCScore(npc, state),
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

// asafgamery: ─────────────────────────────────────────────────────────
//  asafgamery: NPC TURN LOGIC (Faster & More Competitive)
// asafgamery: ─────────────────────────────────────────────────────────

function processNPCTurn(state, turnNum) {
  const events = [];

  // asafgamery: 1. Get current ranking before turn to identify top 5 players
  const currentRanking = buildRanking(state);
  const top5Entries = currentRanking.slice(0, 5);
  // asafgamery: NPCs in the global Top 5 (excludes human player)
  const top5NpcNames = top5Entries.filter(e => !e.isPlayer).map(e => e.name);

  // asafgamery: 2. Identify visible/unlocked levels sorted by rank (Top 1 = hardest)
  const visibleSorted = getVisibleLevelsSorted(state);
  const top1Level = visibleSorted.length > 0 ? visibleSorted[0] : null;
  const top2Level = visibleSorted.length > 1 ? visibleSorted[1] : null;

  // asafgamery: Set to enforce rule: EACH NPC ONLY PROGRESSES ON AT MOST 1 LEVEL PER TURN!
  const actedNpcs = new Set();

  function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  // asafgamery: ─────────────────────────────────────────────────────────
  // asafgamery: A) ROULETTE LOGIC — TOP 1 LEVEL
  // asafgamery: Pick 2 of the top 5 players (Top 5 NPCs) and give 10% to 20% progression
  // asafgamery: ─────────────────────────────────────────────────────────
  if (top1Level) {
    const top1Candidates = top5NpcNames.filter(name => {
      const npc = state.npcs[name];
      return npc && !npc.completed.includes(top1Level.id);
    });

    const chosenTop1 = shuffle(top1Candidates).slice(0, 2);

    chosenTop1.forEach(name => {
      const npcDef = GI.NPCS.find(n => n.name === name);
      const npc = state.npcs[name];
      if (!npc || !npcDef) return;

      actedNpcs.add(name); // NPC used their action for this turn

      const oldProg = npc.progress[top1Level.id] || 0;
      // asafgamery: Progression between 10% and 20%
      const gain = Math.round(rand(10, 20));
      const newProg = Math.min(99, oldProg + gain);
      npc.progress[top1Level.id] = newProg;

      if (oldProg < 51 && newProg >= 51) {
        events.push({
          type: 'npc_record',
          text: `🔥 [TOP 1] ${name} reached a ${Math.round(newProg)}% record on ${top1Level.name}!`
        });
      } else {
        events.push({
          type: 'npc_record',
          text: `⚡ [TOP 1] ${name} progressed to ${Math.round(newProg)}% on ${top1Level.name} (+${gain}%)!`
        });
      }

      // asafgamery: Completion if high percentage is reached (chance proportional to skill)
      const skillFactor = npcDef.skill / 10;
      if (newProg >= 80 && Math.random() < skillFactor * 0.28) {
        npc.completed.push(top1Level.id);
        npc.progress[top1Level.id] = 100;
        const attBase = Math.round(rand(350, 2200) * (10 / npcDef.skill));
        npc.attempts[top1Level.id] = Math.max(1, attBase);
        events.push({
          type: 'npc_complete',
          text: `👑 [TOP 1 VICTORY] ${name} BEAT ${top1Level.name}! (${npc.attempts[top1Level.id].toLocaleString()} attempts)`
        });
      }
    });
  }

  // asafgamery: ─────────────────────────────────────────────────────────
  // asafgamery: B) ROULETTE LOGIC — TOP 2 LEVEL
  // asafgamery: Pick 3 of the top 5 players and give 17% to 27% progression
  // asafgamery: ─────────────────────────────────────────────────────────
  if (top2Level) {
    // asafgamery: Prioritize candidates from Top 5 who haven't completed it and haven't acted this turn
    let top2Candidates = top5NpcNames.filter(name => {
      const npc = state.npcs[name];
      return npc && !npc.completed.includes(top2Level.id) && !actedNpcs.has(name);
    });

    const chosenTop2 = shuffle(top2Candidates).slice(0, 3);

    chosenTop2.forEach(name => {
      const npcDef = GI.NPCS.find(n => n.name === name);
      const npc = state.npcs[name];
      if (!npc || !npcDef) return;

      actedNpcs.add(name); // Marked!

      const oldProg = npc.progress[top2Level.id] || 0;
      // asafgamery: Progression between 17% and 27%
      const gain = Math.round(rand(17, 27));
      const newProg = Math.min(99, oldProg + gain);
      npc.progress[top2Level.id] = newProg;

      if (oldProg < 51 && newProg >= 51) {
        events.push({
          type: 'npc_record',
          text: `🔥 [TOP 2] ${name} reached a ${Math.round(newProg)}% record on ${top2Level.name}!`
        });
      } else {
        events.push({
          type: 'npc_record',
          text: `⚡ [TOP 2] ${name} progressed to ${Math.round(newProg)}% on ${top2Level.name} (+${gain}%)!`
        });
      }

      const skillFactor = npcDef.skill / 10;
      if (newProg >= 75 && Math.random() < skillFactor * 0.30) {
        npc.completed.push(top2Level.id);
        npc.progress[top2Level.id] = 100;
        const attBase = Math.round(rand(200, 1400) * (10 / npcDef.skill));
        npc.attempts[top2Level.id] = Math.max(1, attBase);
        events.push({
          type: 'npc_complete',
          text: `🏆 [TOP 2] ${name} BEAT ${top2Level.name}! (${npc.attempts[top2Level.id].toLocaleString()} attempts)`
        });
      }
    });
  }

  // asafgamery: ─────────────────────────────────────────────────────────
  // asafgamery: C) OTHER NPCS — AT MOST 1 LEVEL PER TURN
  // asafgamery: Rule 1: Only Top 5 NPCs can play Top 1 and Top 2.
  // asafgamery: Rule 2: Each NPC only progresses on AT MOST 1 level per turn.
  // asafgamery: ─────────────────────────────────────────────────────────
  GI.NPCS.forEach(npcDef => {
    const name = npcDef.name;
    if (actedNpcs.has(name)) return; // Already acted this turn!

    const npc = state.npcs[name];
    if (!npc) return;

    const isTop5 = top5NpcNames.includes(name);

    // asafgamery: Filter levels allowed for this NPC
    const allowedLevels = visibleSorted.filter(lvl => {
      if (npc.completed.includes(lvl.id)) return false;
      // asafgamery: If NOT Top 5, cannot play Top 1 or Top 2!
      if (!isTop5) {
        if (top1Level && lvl.id === top1Level.id) return false;
        if (top2Level && lvl.id === top2Level.id) return false;
      }
      return true;
    });

    if (allowedLevels.length === 0) {
      // asafgamery: If no list levels are allowed, try a challenge
      if (GI.CHALLENGES && GI.CHALLENGES.length > 0) {
        if (!npc.challenges) npc.challenges = {};
        const openChallenge = GI.CHALLENGES.find(c => !npc.challenges[c.id]);
        if (openChallenge && Math.random() < (npcDef.skill / 10) * 0.14) {
          npc.challenges[openChallenge.id] = true;
          actedNpcs.add(name);
          events.push({
            type: 'npc_complete',
            text: `⚡ ${name} completed the "${openChallenge.name}" challenge!`
          });
        }
      }
      return;
    }

    // asafgamery: The NPC chooses EXACTLY 1 LEVEL to focus on for this turn!
    // asafgamery: Prioritizes levels with existing progress, or picks one from allowed
    const withProgress = allowedLevels.filter(lvl => (npc.progress[lvl.id] || 0) > 0);
    const targetLevel = withProgress.length > 0
      ? withProgress[Math.floor(Math.random() * withProgress.length)]
      : allowedLevels[Math.floor(Math.random() * allowedLevels.length)];

    actedNpcs.add(name); // Only 1 level per turn

    const skillFactor = npcDef.skill / 10;
    const oldProg = npc.progress[targetLevel.id] || 0;
    const gain = rand(22, 36) * skillFactor;
    const newProg = Math.min(99, oldProg + gain);
    npc.progress[targetLevel.id] = newProg;

    if (oldProg < 51 && newProg >= 51) {
      events.push({
        type: 'npc_record',
        text: `📊 ${name} scored ${Math.round(newProg)}% on ${targetLevel.name}!`
      });
    }

    if (newProg >= 75 && Math.random() < skillFactor * 0.32) {
      npc.completed.push(targetLevel.id);
      npc.progress[targetLevel.id] = 100;
      const attBase = Math.round(rand(20, 320) * (10 / npcDef.skill) * (0.5 + (targetLevel.rank || 1) * 0.3));
      npc.attempts[targetLevel.id] = Math.max(1, attBase);
      events.push({
        type: 'npc_complete',
        text: `🏆 ${name} beat ${targetLevel.name}! (${npc.attempts[targetLevel.id].toLocaleString()} attempts)`
      });
    }
  });

  return events;
}

// asafgamery: ─────────────────────────────────────────────────────────
//  asafgamery: ADVANCE TURN
// asafgamery: ─────────────────────────────────────────────────────────

function advanceTurn(state) {
  if (state.gameOver) return { events: [] };

  const processedTurn = state.currentTurn;
  const events = [];

  // asafgamery: NPCs progress on currently visible levels and challenges
  events.push(...processNPCTurn(state, processedTurn));

  // asafgamery: Move to next turn
  const newTurn = processedTurn + 1;
  state.currentTurn = newTurn;

  // asafgamery: ── SEASON 1 SPECIAL EVENT: Turn 27 Can't Let Go becomes Top 1 ──
  if (state.season === 1 && newTurn === 27 && !state.cantLetGoTop1) {
    state.cantLetGoTop1 = true;
    const prevVisible = getVisibleLevelsSorted(state);
    const prevTop1 = prevVisible.length > 0 ? prevVisible[0] : null;

    insertLevelAtPosition(state, 'cant_let_go', 1);

    events.unshift({
      type: 'list_shift',
      text: `🔥 LIST RE-EVALUATION: "Can't Let Go" has been voted harder than "Jumper"! Can't Let Go moves to #1 on the Demonlist!`
    });
    if (prevTop1 && prevTop1.id !== 'cant_let_go' && prevTop1.isCustom) {
      events.push({
        type: 'list_shift',
        text: `📉 Custom level "${prevTop1.name}" dropped to #2 on the list!`
      });
    }
  }

  // asafgamery: ── UNLOCK SCHEDULED LEVELS ──
  const baseLevels = getSeasonBaseLevels(state.season);
  baseLevels.forEach(level => {
    if (level.unlockTurn === newTurn) {
      const pl = state.playerLevels[level.id];
      if (!pl) return;
      const prevVisible = getVisibleLevelsSorted(state);
      const prevTop1 = prevVisible.length > 0 ? prevVisible[0] : null;
      const targetPos = level.targetPos || 1;

      if (pl.status === 'locked') {
        pl.status = 'progress';
        insertLevelAtPosition(state, level.id, targetPos);
        const topLabel = targetPos === 1 ? 'TOP 1' : `TOP ${targetPos}`;
        events.push({ type: 'level_unlock', text: `🆕 ${level.name} added as the new ${topLabel} on the list!` });
      } else if (pl.playerVerified) {
        insertLevelAtPosition(state, level.id, targetPos);
        const topLabel = targetPos === 1 ? 'TOP 1' : `TOP ${targetPos}`;
        events.push({ type: 'level_unlock', text: `🆕 ${level.name} officially enters the list as ${topLabel} — already verified by you!` });
      }

      if (targetPos === 1 && prevTop1 && prevTop1.id !== level.id && prevTop1.isCustom) {
        events.push({
          type: 'list_shift',
          text: `📉 Custom level "${prevTop1.name}" dropped to #2 on the list!`
        });
      }

      // asafgamery: Original verifier NPC completes it
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

  // asafgamery: ── SEASON 2 CHALLENGES & SPECIAL EVENTS ──
  if (state.season === 2) {
    GI.SEASON_2_CHALLENGES.forEach(c => {
      if (c.unlockTurn === newTurn) {
        events.push({
          type: 'level_unlock',
          text: `⚡ NEW CHALLENGE UNLOCKED: "${c.name}" (ID: ${getLevelInGameId(c.name) || c.inGameId || ''}) is now available to play!`
        });
      }
    });

    if (newTurn === 27) {
      events.push({
        type: 'list_shift',
        text: `👑 ALPHA TRILOGY COMPLETED! The historic trilogy (Retray, Dark Paradise, and Sonar) has been completed this season!`
      });
    }
  }

  // asafgamery: Check achievements after advance turn
  checkAchievements(state);

  // asafgamery: Log
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

// asafgamery: ─────────────────────────────────────────────────────────
//  asafgamery: TAB SWITCHING
// asafgamery: ─────────────────────────────────────────────────────────

function switchTab(tabId, btn) {
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + tabId).classList.add('active');
  if (btn) btn.classList.add('active');

  if (tabId === 'challenges') {
    loadLevelIds().then(() => renderChallengeTab());
  }
  if (tabId === 'stats')        renderStatsTab();
  if (tabId === 'achievements') renderAchievementsTab();
  if (tabId === 'season')       renderSeasonTab();
}

// asafgamery: ─────────────────────────────────────────────────────────
//  asafgamery: RENDERING — MAIN LIST TAB
// asafgamery: ─────────────────────────────────────────────────────────

let gameState = null;

function renderAll() {
  if (!gameState) return;
  checkAchievements(gameState);
  renderTurnInfo();
  renderLevelList();
  renderProfile();
  if (document.getElementById('tab-challenges')?.classList.contains('active')) {
    renderChallengeTab();
  }
  if (document.getElementById('tab-achievements')?.classList.contains('active')) {
    renderAchievementsTab();
  }
}

function renderTurnInfo() {
  const turnEl  = document.getElementById('turn-display');
  const nickEl  = document.getElementById('nick-display');
  const advBtn  = document.getElementById('advance-btn');
  const barFill = document.getElementById('turn-progress');
  const seasonBadgeEl = document.getElementById('header-season-badge');

  if (nickEl) nickEl.textContent = gameState.nick;
  if (turnEl) turnEl.textContent = `Turn ${gameState.currentTurn} / ${GI.MAX_TURNS}`;

  if (seasonBadgeEl) {
    const sNum = gameState.season || 1;
    seasonBadgeEl.textContent = `Season ${sNum}`;
    if (sNum === 2) {
      seasonBadgeEl.style.background = 'linear-gradient(135deg, #ff416c, #ff4b2b)';
    } else {
      seasonBadgeEl.style.background = 'var(--accent)';
    }
  }

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

    if (displayPos === 1) cardClass += ' top1-card';
    else if (displayPos === 2) cardClass += ' top2-card';

    const isCustomImg = Boolean(level.customImage);
    const thumbHtml = `
      <div class="level-thumb" style="background:${level.gradient || 'linear-gradient(135deg, #1a0022, #b71c1c)'}">
        ${isCustomImg
          ? `<img src="${level.customImage}" alt="${level.name}" class="level-thumb-img" onerror="this.style.display='none'">`
          : `<img src="assets/levels/${level.id}.png"
                 onerror="this.src='assets/levels/${level.id}.jpg';this.onerror=function(){this.src='assets/levels/${level.id}.jpeg';this.onerror=function(){this.style.display='none'}}"
                 alt="${level.name}" class="level-thumb-img">`
        }
        <div class="diff-badge" style="${level.diffColor ? 'border:1px solid ' + level.diffColor : ''}">${level.diffLabel}</div>
      </div>`;

    const verifierLine = pl.playerVerified
      ? `<div class="level-verifier">verified by <span class="verifier-name" style="color:#f5a623;font-weight:700">⭐ ${gameState.nick} (you)</span></div>`
      : `<div class="level-verifier">verified by <span class="verifier-name">${level.verifier}</span></div>`;

    const points51 = (level.points * 0.5).toFixed(2);
    const points100 = Number(level.points).toFixed(2);
    const pointsLine = `<div class="level-points-range">${points51} (51%) — ${points100} (100%) points</div>`;

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
    const somethingilikelol67 = displayPos === 1
      ? '<span class="custom-level-badge top1">👑 TOP 1</span>'
      : displayPos === 2
        ? '<span class="custom-level-badge top2">🥈 TOP 2</span>'
        : '';

    const noteHtml = level.specialNote
      ? `<div class="level-nong-note">🎵 ${level.specialNote}</div>`
      : '';

    const card = document.createElement('div');
    card.className = cardClass;
    card.innerHTML = `
      ${thumbHtml}
      <div class="level-info">
        <div class="level-rank-name">
          <span>#${displayPos} – ${level.name}</span>
          ${somethingilikelol67}
          ${idTagHtml}
        </div>
        ${verifierLine}
        ${pointsLine}
        ${statusHtml}
        ${npcHtml}
        ${noteHtml}
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

  // asafgamery: User Achievements in Profile
  const userAchs = gameState.achievements || {};
  const unlockedAchs = GI.ACHIEVEMENTS.filter(a => userAchs[a.id]);

  let achsHtml = '';
  if (unlockedAchs.length > 0) {
    achsHtml = `
      <div class="profile-achievements-wrap">
        <div class="profile-achievements-title">
          <span>🏆 Trophies</span>
          <span>${unlockedAchs.length}/${GI.ACHIEVEMENTS.length}</span>
        </div>
        <div class="profile-achievements-list">
          ${unlockedAchs.map(a => `
            <span class="profile-achievement-badge ${a.isRainbowLegend ? 'legend-badge' : a.isRainbow ? 'rainbow-badge' : ''}" title="${a.name}: ${a.desc}">
              ${a.svg}
            </span>
          `).join('')}
        </div>
      </div>
    `;
  }

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
      <span class="profile-value">${completed.length} / ${getAllLevels(gameState).length}</span>
    </div>
    <div class="profile-stat">
      <span class="profile-label">Hardest</span>
      <span class="profile-value" style="font-size:0.78rem">${hardest ? hardest.name : '—'}</span>
    </div>
    ${(completedTagsHtml || challengeTagsHtml) ? `<div class="completed-tags" style="margin-top:8px">${completedTagsHtml}${challengeTagsHtml}</div>` : ''}
    ${achsHtml}
  `;
}

// asafgamery: ─────────────────────────────────────────────────────────
//  asafgamery: RENDERING — CHALLENGE LIST TAB
// asafgamery: ─────────────────────────────────────────────────────────

function renderChallengeTab() {
  const container = document.getElementById('challenge-list');
  if (!container) return;

  const currentChallenges = getSeasonChallenges(gameState).filter(c => (c.unlockTurn || 1) <= gameState.currentTurn);

  if (currentChallenges.length === 0) {
    container.innerHTML = `
      <div class="list-empty">
        No challenges unlocked yet.<br>
        <span style="font-size:0.8rem;color:#bbb">Advance turns to unlock elite challenges (Turn 2, 6, 17, 20, 27)!</span>
      </div>`;
    return;
  }

  container.innerHTML = '';
  currentChallenges.forEach((c, idx) => {
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
        <span style="color:#666;font-size:0.8rem">Worth <strong>${c.points} pts</strong></span>
      </div>
      <div class="level-action" style="margin-top:4px">
        <button class="btn btn-primary btn-sm" onclick="openChallengeModal('${c.id}')">Log Completion</button>
      </div>`;
    }

    // asafgamery: NPC challenge completions
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

    const inGameId = getLevelInGameId(c.name) || c.inGameId;
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

// asafgamery: ─────────────────────────────────────────────────────────
//  asafgamery: RENDERING — ACHIEVEMENTS TAB
// asafgamery: ─────────────────────────────────────────────────────────

function renderAchievementsTab() {
  const grid = document.getElementById('achievements-grid');
  const counterEl = document.getElementById('achievements-counter');
  const barEl = document.getElementById('achievements-bar');
  if (!grid) return;

  const userAchs = gameState?.achievements || {};
  const total = GI.ACHIEVEMENTS.length;
  let unlockedCount = 0;

  grid.innerHTML = GI.ACHIEVEMENTS.map(ach => {
    const isUnlocked = Boolean(userAchs[ach.id]);
    if (isUnlocked) unlockedCount++;

    let cardExtraClass = isUnlocked ? 'unlocked' : 'locked';
    if (isUnlocked && ach.isRainbowLegend) cardExtraClass += ' achievement-rainbow-legend';
    else if (isUnlocked && ach.isRainbow) cardExtraClass += ' achievement-rainbow';

    return `
      <div class="achievement-card ${cardExtraClass}">
        <div class="achievement-icon-box">
          ${ach.svg}
        </div>
        <div class="achievement-info">
          <div class="achievement-name">
            <span>${ach.name}</span>
            <span class="achievement-status-tag ${isUnlocked ? 'unlocked-tag' : 'locked-tag'}">
              ${isUnlocked ? '✓ UNLOCKED' : '🔒 LOCKED'}
            </span>
          </div>
          <div class="achievement-desc">${ach.desc}</div>
        </div>
      </div>
    `;
  }).join('');

  if (counterEl) {
    counterEl.textContent = `${unlockedCount} / ${total} Unlocked`;
  }
  if (barEl) {
    barEl.style.width = `${Math.round((unlockedCount / total) * 100)}%`;
  }
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

// asafgamery: ─────────────────────────────────────────────────────────
//  asafgamery: RENDERING — STATS VIEWER TAB
// asafgamery: ─────────────────────────────────────────────────────────

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

  let chalsCompletedNames = [];
  if (entry.isPlayer) {
    if (gameState.playerChallenges) {
      Object.entries(gameState.playerChallenges).forEach(([cId, pc]) => {
        if (pc.completed) {
          const c = getChallengeById(cId, gameState);
          if (c) chalsCompletedNames.push(c.name);
        }
      });
    }
  } else {
    const npc = gameState.npcs[entry.name];
    if (npc && npc.challenges) {
      Object.keys(npc.challenges).forEach(cId => {
        if (npc.challenges[cId]) {
          const c = getChallengeById(cId, gameState);
          if (c) chalsCompletedNames.push(c.name);
        }
      });
    }
  }

  const chalHtml = chalsCompletedNames.length > 0 ? `
    <div class="stats-completed-title" style="margin-top:14px">Challenges Completed (${chalsCompletedNames.length})</div>
    <div class="stats-completed-list">${chalsCompletedNames.map(cn => `<strong>${cn}</strong>`).join(' · ')}</div>
  ` : '';

  let achsStatsHtml = '';
  if (entry.isPlayer) {
    const userAchs = gameState?.achievements || {};
    const unlocked = GI.ACHIEVEMENTS.filter(a => userAchs[a.id]);
    if (unlocked.length > 0) {
      achsStatsHtml = `
        <div class="stats-completed-title" style="margin-top:16px">🏆 Trophies & Achievements (${unlocked.length}/${GI.ACHIEVEMENTS.length})</div>
        <div class="stats-profile-achievements-grid">
          ${unlocked.map(a => `
            <div class="stats-ach-pill ${a.isRainbowLegend ? 'legend-badge' : a.isRainbow ? 'rainbow-badge' : ''}" title="${a.name}: ${a.desc}">
              <div class="stats-ach-icon">${a.svg}</div>
              <span class="stats-ach-name">${a.name}</span>
            </div>
          `).join('')}
        </div>
      `;
    } else {
      achsStatsHtml = `
        <div class="stats-completed-title" style="margin-top:16px">🏆 Trophies & Achievements (0/${GI.ACHIEVEMENTS.length})</div>
        <div style="font-size:0.75rem;color:#888;padding:4px 0">No achievements unlocked yet. Check the Achievements tab!</div>
      `;
    }
  } else {
    // asafgamery: For NPC, display achievements earned based on performance
    const npcAchs = [];
    if (entry.completed > 0) npcAchs.push(GI.ACHIEVEMENTS.find(a => a.id === 'first_level'));
    if (entry.challengesCompleted > 0) npcAchs.push(GI.ACHIEVEMENTS.find(a => a.id === 'first_challenge'));
    if (entry.challengesCompleted >= 3) npcAchs.push(GI.ACHIEVEMENTS.find(a => a.id === 'challenges_3'));
    const visible = getVisibleLevelsSorted(gameState);
    if (visible.length > 0 && entry.completedList.includes(visible[0].id)) {
      npcAchs.push(GI.ACHIEVEMENTS.find(a => a.id === 'first_victor_top1'));
    }
    const filteredAchs = npcAchs.filter(Boolean);
    if (filteredAchs.length > 0) {
      achsStatsHtml = `
        <div class="stats-completed-title" style="margin-top:16px">🏆 NPC Badges (${filteredAchs.length})</div>
        <div class="stats-profile-achievements-grid">
          ${filteredAchs.map(a => `
            <div class="stats-ach-pill" title="${a.name}: ${a.desc}">
              <div class="stats-ach-icon">${a.svg}</div>
              <span class="stats-ach-name">${a.name}</span>
            </div>
          `).join('')}
        </div>
      `;
    }
  }

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
    ${chalHtml}
    ${achsStatsHtml}
  `;
}

// asafgamery: ─────────────────────────────────────────────────────────
//  asafgamery: RENDERING — SEASON TAB
// asafgamery: ─────────────────────────────────────────────────────────

function renderSeasonTab() {
  const listEl  = document.getElementById('upcoming-list');
  const emptyEl = document.getElementById('upcoming-empty');
  renderCustomLevelsList();

  if (!listEl) return;

  const locked = getLockedLevels(gameState);

  if (locked.length === 0) {
    listEl.innerHTML  = '';
    if (emptyEl) emptyEl.style.display = 'block';
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';

  listEl.innerHTML = locked.map(level => {
    const inGameId = getLevelInGameId(level.name) || level.inGameId;
    const idHtml = inGameId
      ? `<span class="level-id-tag">ID: ${inGameId}</span>`
      : `<span class="level-id-tag official-tag">Official</span>`;

    return `
      <div class="upcoming-card">
        <div class="upcoming-thumb" style="background:${level.gradient}">
          <img src="assets/levels/${level.id}.png"
               onerror="this.src='assets/levels/${level.id}.jpg';this.onerror=function(){this.src='assets/levels/${level.id}.jpeg';this.onerror=function(){this.style.display='none'}}"
               alt="${level.name}">
        </div>
        <div class="upcoming-info">
          <div class="upcoming-name-row">
            <span class="upcoming-name">${level.name}</span>
            ${idHtml}
          </div>
          <div class="upcoming-meta">Unlocks Turn ${level.unlockTurn} · by <strong>${level.verifier}</strong> · Target: <strong>Top ${level.targetPos || 1}</strong></div>
        </div>
        <div>
          <button class="btn btn-primary btn-sm" onclick="openVerifyModal('${level.id}')">⭐ Verify</button>
        </div>
      </div>`;
  }).join('');
}

function renderCustomLevelsList() {
  const container = document.getElementById('custom-levels-list');
  if (!container) return;
  const customLevels = (gameState && gameState.customLevels) ? gameState.customLevels : [];
  if (customLevels.length === 0) {
    container.innerHTML = `<div style="font-size:0.8rem;color:#999;padding:6px 0">No custom levels created yet. Click the button above to create one!</div>`;
    return;
  }
  const visibleSorted = getVisibleLevelsSorted(gameState);
  container.innerHTML = customLevels.map(lvl => {
    const pos = visibleSorted.findIndex(l => l.id === lvl.id) + 1;
    const isTop1 = pos === 1;
    const isTop2 = pos === 2;
    const pl = gameState.playerLevels[lvl.id] || { status: 'progress', bestPercent: 0 };
    return `
      <div class="custom-level-item">
        <div class="custom-level-item-info">
          <span class="custom-level-badge ${isTop1 ? 'top1' : isTop2 ? 'top2' : ''}">
            ${isTop1 ? '👑 TOP 1' : isTop2 ? '🥈 TOP 2' : '#' + (pos || '?')}
          </span>
          <div>
            <strong style="color:var(--text);font-size:0.88rem">${lvl.name}</strong>
            <div style="font-size:0.72rem;color:var(--text-sub)">Position #${pos || '?'} on the list · ${lvl.diffLabel} · ${lvl.points} pts · by ${lvl.verifier}</div>
          </div>
        </div>
        <div style="font-size:0.78rem;font-weight:700;color:var(--accent)">
          ${pl.status === 'complete' ? '✅ Complete' : (pl.bestPercent || 0) + '%'}
        </div>
      </div>
    `;
  }).join('');
}

// asafgamery: ─────────────────────────────────────────────────────────
//  asafgamery: CUSTOM LEVEL MODAL & CREATION
// asafgamery: ─────────────────────────────────────────────────────────

let _customImgBase64 = null;

function openCustomLevelModal() {
  _customImgBase64 = null;
  const modal = document.getElementById('custom-level-modal');
  if (!modal) return;

  const nameInput = document.getElementById('cl-name');
  if (nameInput) nameInput.value = '';
  const diffSelect = document.getElementById('cl-diff');
  if (diffSelect) diffSelect.value = 'Demon';
  const posSelect = document.getElementById('cl-pos-mode');
  if (posSelect) posSelect.value = 'top1';
  const verInput = document.getElementById('cl-verifier');
  if (verInput) verInput.value = gameState?.nick || '';
  const gameIdInput = document.getElementById('cl-game-id');
  if (gameIdInput) gameIdInput.value = '';
  const urlInput = document.getElementById('cl-img-url');
  if (urlInput) urlInput.value = '';
  const fileInput = document.getElementById('cl-img-file');
  if (fileInput) fileInput.value = '';

  const previewImg = document.getElementById('cl-preview-img');
  if (previewImg) { previewImg.src = ''; previewImg.style.display = 'none'; }

  onCustomPosChange();
  updateCustomPreview();
  modal.classList.add('active');
}

function closeCustomLevelModal() {
  const modal = document.getElementById('custom-level-modal');
  if (modal) modal.classList.remove('active');
  _customImgBase64 = null;
}

function onCustomPosChange() {
  const mode = document.getElementById('cl-pos-mode')?.value || 'top1';
  const pointsInput = document.getElementById('cl-points');
  if (pointsInput) {
    if (mode === 'top1') pointsInput.value = 1200;
    else if (mode === 'top2') pointsInput.value = 850;
    else if (mode === 'top3') pointsInput.value = 650;
    else if (mode === 'bottom') pointsInput.value = 40;
  }
  updateCustomPreview();
}

function onCustomDiffChange() {
  updateCustomPreview();
}

function onCustomImgUrlChange() {
  const url = document.getElementById('cl-img-url')?.value.trim();
  const previewImg = document.getElementById('cl-preview-img');
  if (previewImg) {
    if (url) {
      previewImg.src = url;
      previewImg.style.display = 'block';
    } else if (!_customImgBase64) {
      previewImg.style.display = 'none';
    }
  }
}

function onCustomImgFileChange(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    _customImgBase64 = e.target.result;
    const previewImg = document.getElementById('cl-preview-img');
    if (previewImg) {
      previewImg.src = _customImgBase64;
      previewImg.style.display = 'block';
    }
  };
  reader.readAsDataURL(file);
}

function updateCustomPreview() {
  const name = document.getElementById('cl-name')?.value.trim() || 'My Level';
  const diff = document.getElementById('cl-diff')?.value || 'Demon';
  const pts = document.getElementById('cl-points')?.value || '1200';
  const posMode = document.getElementById('cl-pos-mode')?.value || 'top1';

  const titleEl = document.getElementById('cl-preview-title');
  const badgeEl = document.getElementById('cl-preview-badge');
  const metaEl = document.getElementById('cl-preview-meta');

  if (titleEl) titleEl.textContent = name;
  if (badgeEl) badgeEl.textContent = diff.toUpperCase();
  if (metaEl) {
    const posLabel = posMode === 'top1' ? 'Top 1' : posMode === 'top2' ? 'Top 2' : posMode === 'top3' ? 'Top 3' : 'Bottom of List';
    metaEl.textContent = `Position: ${posLabel} · ${pts} pts`;
  }
}

function saveCustomLevel() {
  const nameInput = document.getElementById('cl-name');
  const name = nameInput?.value.trim();
  if (!name) {
    nameInput?.focus();
    nameInput?.classList.add('input-shake');
    setTimeout(() => nameInput?.classList.remove('input-shake'), 450);
    return;
  }

  const diff = document.getElementById('cl-diff')?.value || 'Demon';
  const points = parseInt(document.getElementById('cl-points')?.value) || 500;
  const verifier = document.getElementById('cl-verifier')?.value.trim() || gameState.nick;
  const inGameId = document.getElementById('cl-game-id')?.value.trim();
  const imgUrl = document.getElementById('cl-img-url')?.value.trim();
  const finalImage = _customImgBase64 || imgUrl || null;

  const diffConfigs = {
    'Auto':          { color: '#90caf9', grad: 'linear-gradient(135deg, #0d47a1, #42a5f5)' },
    'Easy':          { color: '#a5d6a7', grad: 'linear-gradient(135deg, #1b5e20, #66bb6a)' },
    'Normal':        { color: '#ffcc80', grad: 'linear-gradient(135deg, #bf360c, #ffa726)' },
    'Hard':          { color: '#ef9a9a', grad: 'linear-gradient(135deg, #b71c1c, #ef5350)' },
    'Harder':        { color: '#f48fb1', grad: 'linear-gradient(135deg, #880e4f, #e91e63)' },
    'Insane':        { color: '#ce93d8', grad: 'linear-gradient(135deg, #4a148c, #ab47bc)' },
    'Demon':         { color: '#ff5252', grad: 'linear-gradient(135deg, #1a0022, #b71c1c, #e53935)' },
    'Extreme Demon': { color: '#ff1744', grad: 'linear-gradient(135deg, #000000, #880e4f, #ff1744)' }
  };
  const cfg = diffConfigs[diff] || diffConfigs['Demon'];

  const levelId = 'custom_' + Date.now();
  const newLevel = {
    id: levelId,
    name: name,
    rank: 10,
    unlockTurn: 1, // Already unlocked
    verifier: verifier,
    points: points,
    gradient: cfg.grad,
    diffLabel: diff,
    diffColor: cfg.color,
    customImage: finalImage,
    isCustom: true
  };

  if (!gameState.customLevels) gameState.customLevels = [];
  gameState.customLevels.push(newLevel);

  // asafgamery: Initialize player status
  gameState.playerLevels[levelId] = {
    status: 'progress',
    attempts: 0,
    bestPercent: 0,
    completedAttempts: null,
    playerVerified: verifier === gameState.nick
  };

  // asafgamery: Position level on list according to user choice (shifting other levels down)
  const posMode = document.getElementById('cl-pos-mode')?.value || 'top1';
  let targetPos = 1;
  if (posMode === 'top1') targetPos = 1;
  else if (posMode === 'top2') targetPos = 2;
  else if (posMode === 'top3') targetPos = 3;
  else if (posMode === 'bottom') targetPos = 999;

  insertLevelAtPosition(gameState, levelId, targetPos);

  if (inGameId) {
    if (!GI.LEVEL_IDS) GI.LEVEL_IDS = {};
    GI.LEVEL_IDS[name] = inGameId;
  }

  // asafgamery: Initialize in NPCs
  GI.NPCS.forEach(npcDef => {
    const npc = gameState.npcs[npcDef.name];
    if (npc) {
      if (npc.progress[levelId] === undefined) npc.progress[levelId] = 0;
      if (npc.attempts[levelId] === undefined) npc.attempts[levelId] = 0;
    }
  });

  saveState(gameState);
  closeCustomLevelModal();
  renderAll();
  renderSeasonTab();

  const visibleSorted = getVisibleLevelsSorted(gameState);
  const pos = visibleSorted.findIndex(l => l.id === levelId) + 1;
  showToast(`🎉 Level "${name}" added at position #${pos} on the list!`);
}

// asafgamery: ─────────────────────────────────────────────────────────
//  asafgamery: PROGRESS MODAL
// asafgamery: ─────────────────────────────────────────────────────────

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

// asafgamery: ─────────────────────────────────────────────────────────
//  asafgamery: VERIFY MODAL
// asafgamery: ─────────────────────────────────────────────────────────

let _verifyLevelId = null;

function openVerifyModal(levelId) {
  _verifyLevelId = levelId;
  const level = getLevelById(levelId);
  const nameEl = document.getElementById('verify-level-name');
  if (nameEl) nameEl.textContent = level ? level.name : '';
  const idDisplay = document.getElementById('verify-level-id-display');
  if (idDisplay && level) {
    const rawId = level.inGameId || (GI.LEVEL_IDS && GI.LEVEL_IDS[level.name]);
    if (rawId) {
      idDisplay.innerHTML = `<span class="level-id-tag-lg" title="Geometry Dash In-Game ID">GD ID: <strong>${rawId}</strong></span>`;
    } else {
      idDisplay.innerHTML = `<span class="level-id-tag-lg" style="background:#eef2f6;color:#555;" title="Official Level">Official Level</span>`;
    }
  }
  document.getElementById('verify-attempts').value = '';

  // asafgamery: Show position chooser only when no NPC has already verified this level
  const posGroup = document.getElementById('verify-pos-group');
  const posSel   = document.getElementById('verify-pos');
  if (posGroup && posSel && level) {
    const npcAlreadyVerified = level.isCustom ? false :
      gameState.npcs && Object.values(gameState.npcs).some(
        npc => npc.completed && npc.completed.includes(levelId)
      );
    if (npcAlreadyVerified) {
      // asafgamery: NPC beat it first — no choice, use scheduled targetPos
      posGroup.style.display = 'none';
    } else {
      posGroup.style.display = '';
      // asafgamery: Pre-select Top 1 by default; if targetPos is 2 or 3 pre-select that
      const tp = level.targetPos || 1;
      posSel.value = (tp === 2 || tp === 3) ? String(tp) : '1';
    }
  }

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

  // asafgamery: Determine entry position:
  // asafgamery: If NPC already verified → use scheduled targetPos (no chooser was shown)
  // asafgamery: If player verifies first → use the chooser selection (defaults Top 1)
  const posGroup = document.getElementById('verify-pos-group');
  let targetPos;
  if (posGroup && posGroup.style.display !== 'none') {
    // asafgamery: Player is first — use chooser
    const posVal = document.getElementById('verify-pos')?.value;
    if (posVal === 'target') {
      targetPos = level.targetPos || 1;
    } else {
      targetPos = parseInt(posVal) || 1;
    }
  } else {
    // asafgamery: NPC already verified — use scheduled targetPos
    targetPos = level.targetPos || 1;
  }
  insertLevelAtPosition(gameState, _verifyLevelId, targetPos);

  gameState.eventLog.unshift({
    turn: gameState.currentTurn,
    events: [{
      type: 'player_verify',
      text: `🌟 ${gameState.nick} verified ${level.name}! (${attempts.toLocaleString()} att) — it enters the list at #${targetPos}!`
    }]
  });
  if (gameState.eventLog.length > 12) gameState.eventLog = gameState.eventLog.slice(0, 12);

  checkAchievements(gameState);
  saveState(gameState);
  closeVerifyModal();
  showToast(`🌟 You verified ${level.name}! It's now #${targetPos} on the list!`);
  renderAll();
}

// asafgamery: ─────────────────────────────────────────────────────────
//  asafgamery: ADVANCE TURN
// asafgamery: ─────────────────────────────────────────────────────────

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

// asafgamery: ─────────────────────────────────────────────────────────
//  asafgamery: GAME OVER
// asafgamery: ─────────────────────────────────────────────────────────

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
  document.getElementById('go-completed').textContent = `${completed.length}/${getAllLevels(gameState).length}`;
  document.getElementById('go-ranking').innerHTML     = ranking.slice(0, 10).map((e, i) => `
    <div class="go-rank-row ${e.isPlayer ? 'go-player-row' : ''}">
      <span class="go-rank">#${i + 1}</span>
      <span class="go-name">${e.isPlayer ? '⭐ ' : ''}${e.name}</span>
      <span class="go-score">${e.score.toLocaleString()} pts</span>
      <span class="go-levels">${e.completed} lvl</span>
    </div>`).join('');

  modal.classList.add('active');
}

// asafgamery: ─────────────────────────────────────────────────────────
//  asafgamery: RESET
// asafgamery: ─────────────────────────────────────────────────────────

function openResetConfirm()  { document.getElementById('reset-modal')?.classList.add('active'); }
function closeResetConfirm() { document.getElementById('reset-modal')?.classList.remove('active'); }
function doReset()           { resetState(); window.location.href = 'index.html'; }

// asafgamery: ─────────────────────────────────────────────────────────
//  asafgamery: TOAST
// asafgamery: ─────────────────────────────────────────────────────────

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

// asafgamery: ─────────────────────────────────────────────────────────
//  asafgamery: INDEX PAGE & MENU IMAGE
// asafgamery: ─────────────────────────────────────────────────────────

function initMenuImage() {
  const saved = localStorage.getItem('gi_menu_image');
  const banner = document.getElementById('menu-banner-img');
  if (banner && saved) {
    banner.src = saved;
  }
}

function openMenuImageModal() {
  const modal = document.getElementById('menu-image-modal');
  if (!modal) return;
  const saved = localStorage.getItem('gi_menu_image') || 'assets/levels/stereo_madness.jpg';
  const preview = document.getElementById('menu-img-preview');
  const urlInput = document.getElementById('menu-img-url-input');
  if (preview) preview.src = saved;
  if (urlInput) urlInput.value = saved.startsWith('data:') ? '' : saved;
  modal.classList.add('active');
}

function closeMenuImageModal() {
  const modal = document.getElementById('menu-image-modal');
  if (modal) modal.classList.remove('active');
}

function previewMenuImageFile(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const preview = document.getElementById('menu-img-preview');
    if (preview) preview.src = e.target.result;
    const urlInput = document.getElementById('menu-img-url-input');
    if (urlInput) urlInput.value = '';
  };
  reader.readAsDataURL(file);
}

function saveMenuImage() {
  const preview = document.getElementById('menu-img-preview');
  const urlInput = document.getElementById('menu-img-url-input');
  const url = urlInput?.value.trim();
  let finalSrc = '';
  if (url) {
    finalSrc = url;
  } else if (preview && preview.src) {
    finalSrc = preview.src;
  }
  if (finalSrc) {
    localStorage.setItem('gi_menu_image', finalSrc);
    const banner = document.getElementById('menu-banner-img');
    if (banner) banner.src = finalSrc;
  }
  closeMenuImageModal();
}

function resetMenuImageDefault() {
  localStorage.removeItem('gi_menu_image');
  const banner = document.getElementById('menu-banner-img');
  if (banner) banner.src = 'assets/levels/stereo_madness.jpg';
  const preview = document.getElementById('menu-img-preview');
  if (preview) preview.src = 'assets/levels/stereo_madness.jpg';
  closeMenuImageModal();
}

function previewMenuImageUrl(url) {
  if (!url) return;
  const preview = document.getElementById('menu-img-preview');
  if (preview) preview.src = url;
}

function setPresetCover(path) {
  const preview = document.getElementById('menu-img-preview');
  if (preview) preview.src = path;
  const urlInput = document.getElementById('menu-img-url-input');
  if (urlInput) urlInput.value = path;
}

function randomizeNick() {
  const topNames = [
    'Zoink', 'Riot', 'Trick', 'SpaceUK', 'Doggie', 'Michigun', 'Cyclic',
    'Combined', 'npesta', 'Viprin', 'KrmaL', 'Diamond', 'Cursed', 'Technical',
    'Dorami', 'Sunix', 'Nexus', 'Gboy', 'Guitar'
  ];
  const chosen = topNames[Math.floor(Math.random() * topNames.length)];
  const input = document.getElementById('nick-input');
  if (input) {
    input.value = chosen;
    input.focus();
  }
}

let _selectedSeason = 1;

function setSeasonSelection(seasonNum) {
  _selectedSeason = parseInt(seasonNum) || 1;
  const card1 = document.getElementById('season-choice-1');
  const card2 = document.getElementById('season-choice-2');
  if (card1 && card2) {
    card1.classList.toggle('active', _selectedSeason === 1);
    card2.classList.toggle('active', _selectedSeason === 2);
  }
}

function initIndexPage() {
  initMenuImage();
  const existing = loadState();
  const section  = document.getElementById('continue-section');
  if (existing && section) {
    section.style.display = 'flex';
    document.getElementById('continue-nick').textContent = existing.nick;
    document.getElementById('continue-turn').textContent = existing.currentTurn;

    const seasonBadge = document.getElementById('continue-season-badge');
    if (seasonBadge) {
      const sNum = existing.season || 1;
      seasonBadge.textContent = `Season ${sNum}`;
      if (sNum === 2) {
        seasonBadge.className = 'continue-badge season-badge season-badge-s2';
      } else {
        seasonBadge.className = 'continue-badge season-badge';
      }
    }

    // asafgamery: Enhanced stats on continue card
    try {
      const score = getPlayerScore(existing);
      const scoreEl = document.getElementById('continue-score-badge');
      if (scoreEl) scoreEl.textContent = `${score.toLocaleString()} pts`;

      const ranking = buildRanking(existing);
      const playerRankIndex = ranking.findIndex(r => r.isPlayer);
      const rankEl = document.getElementById('continue-rank-badge');
      if (rankEl && playerRankIndex !== -1) {
        rankEl.textContent = `Rank #${playerRankIndex + 1}`;
      }

      const turnBar = document.getElementById('continue-turn-bar');
      if (turnBar) {
        const pct = Math.min(100, Math.max(3.3, (existing.currentTurn / GI.MAX_TURNS) * 100));
        turnBar.style.width = `${pct}%`;
      }
    } catch (err) {
      console.warn('Error loading continue card stats:', err);
    }
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
  const chosenSeason = _selectedSeason || 1;
  const state = createInitialState(nick, chosenSeason);

  if (chosenSeason === 1) {
    // asafgamery: Season 1: Turn 1 initial unlock: Stereo Madness
    GI.LEVELS.forEach(lvl => {
      if (lvl.unlockTurn === 1) {
        state.playerLevels[lvl.id].status = 'progress';
        insertLevelAtPosition(state, lvl.id, 1);
        const verNpc = state.npcs[lvl.verifier];
        if (verNpc) {
          verNpc.completed.push(lvl.id);
          verNpc.progress[lvl.id] = 100;
          verNpc.attempts[lvl.id] = randInt(10, 80);
        }
      }
    });

    // asafgamery: Top 10 NPCs start with progress or completions on Stereo Madness
    const top10Names = ['Zoink', 'SpaceUK', 'Trick', 'Wwase', 'Cyclic', 'Doggie', 'Combined', 'SrGuillester', 'Shaggy23'];
    top10Names.forEach((name, i) => {
      const npc = state.npcs[name];
      if (!npc) return;
      if (i < 5) {
        npc.completed.push('stereo_madness');
        npc.progress['stereo_madness'] = 100;
        npc.attempts['stereo_madness'] = randInt(25, 140);
      } else {
        npc.progress['stereo_madness'] = randInt(55, 92);
      }
    });

    state.eventLog.push({
      turn: 1,
      events: [
        { type: 'season_start', text: `🎮 Season 1 started! Good luck, ${nick}!` },
        { type: 'level_unlock', text: '🆕 Stereo Madness added to the list!' },
        { type: 'npc_verify',   text: '⭐ Riot verified Stereo Madness!' }
      ]
    });

  } else {
    // asafgamery: Season 2: All 7 Classic Levels are ALREADY verified and playable!
    // asafgamery: Setup initial positions for S1 levels
    const s1List = ['jumper', 'cant_let_go', 'base_after_base', 'dry_out', 'polargeist', 'back_on_track', 'stereo_madness'];
    s1List.forEach((id, idx) => {
      if (!state.levelRanks) state.levelRanks = {};
      state.levelRanks[id] = (s1List.length - idx) * 10;
    });

    // asafgamery: Turn 1 Demon of Season 2: Promises as TOP 3!
    const prom = GI.SEASON_2_LEVELS.find(l => l.id === 'promises');
    if (prom) {
      state.playerLevels['promises'].status = 'progress';
      insertLevelAtPosition(state, 'promises', 3);
      const verNpc = state.npcs[prom.verifier];
      if (verNpc) {
        verNpc.completed.push('promises');
        verNpc.progress['promises'] = 100;
        verNpc.attempts['promises'] = randInt(40, 180);
      }
    }

    // asafgamery: NPCs have diverse background progress across the 7 classic levels
    GI.NPCS.forEach(npcDef => {
      const npc = state.npcs[npcDef.name];
      if (!npc) return;
      // asafgamery: High skill NPCs beat several classic levels
      const levelsToBeat = npcDef.skill >= 8.5 ? 4 : npcDef.skill >= 7.0 ? 2 : 1;
      const s1EasyToHard = ['stereo_madness', 'back_on_track', 'polargeist', 'dry_out', 'base_after_base', 'cant_let_go'];
      for (let i = 0; i < levelsToBeat; i++) {
        const id = s1EasyToHard[i];
        if (!npc.completed.includes(id)) {
          npc.completed.push(id);
          npc.progress[id] = 100;
          npc.attempts[id] = randInt(20, 150);
        }
      }
    });

    state.eventLog.push({
      turn: 1,
      events: [
        { type: 'season_start', text: `🎮 Season 2 started! Welcome to the Expanded Frontier, ${nick}!` },
        { type: 'level_unlock', text: '✨ All 7 Classic S1 levels are unlocked and verified!' },
        { type: 'level_unlock', text: '🆕 Promises added as TOP 3 on the Demonlist!' },
        { type: 'npc_verify',   text: '⭐ Zoink verified Promises!' }
      ]
    });
  }

  checkAchievements(state);
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

// asafgamery: ─────────────────────────────────────────────────────────
//  asafgamery: ADMIN / DEV DEBUG PANEL
// asafgamery: ─────────────────────────────────────────────────────────

function openAdminModal() {
  const modal = document.getElementById('admin-modal');
  if (modal) modal.classList.add('active');
}

function closeAdminModal() {
  const modal = document.getElementById('admin-modal');
  if (modal) modal.classList.remove('active');
}

function adminNextTurn() {
  if (!gameState) return;
  doAdvanceTurn();
}

function adminJumpToTurn(targetTurn) {
  if (!gameState) return;
  targetTurn = parseInt(targetTurn);
  if (isNaN(targetTurn) || targetTurn < 1) return;
  const maxTurns = gameState.totalTurns || 30;
  if (targetTurn > maxTurns) targetTurn = maxTurns;

  if (gameState.currentTurn >= targetTurn) {
    gameState.currentTurn = targetTurn;
    gameState.gameOver = (gameState.currentTurn >= maxTurns);
  } else {
    while (gameState.currentTurn < targetTurn && !gameState.gameOver) {
      advanceTurn(gameState);
    }
  }
  checkAchievements(gameState);
  saveState(gameState);
  renderAll();
  showToast(`⏱️ Jumped to Turn ${gameState.currentTurn}!`);
}

function adminSetTurn() {
  const input = document.getElementById('admin-turn-input');
  const val = parseInt(input?.value);
  if (val && !isNaN(val)) {
    adminJumpToTurn(val);
  } else {
    showToast('⚠️ Please enter a valid turn number (1-30).');
  }
}

function adminBeatAllLevels() {
  if (!gameState) return;
  const all = getAllLevels(gameState);
  all.forEach(lvl => {
    gameState.playerLevels[lvl.id] = {
      status: 'complete',
      bestPercent: 100,
      attempts: 42,
      completedAttempts: 42,
      playerVerified: false
    };
  });
  checkAchievements(gameState);
  saveState(gameState);
  renderAll();
  showToast('🎮 Cleared all levels (100%)!');
}

function adminBeatCurrentTop1() {
  if (!gameState) return;
  const visible = getVisibleLevelsSorted(gameState);
  if (visible.length === 0) return;
  const top1 = visible[0];
  gameState.playerLevels[top1.id] = {
    status: 'complete',
    bestPercent: 100,
    attempts: 50,
    completedAttempts: 50,
    playerVerified: false
  };
  checkAchievements(gameState);
  saveState(gameState);
  renderAll();
  showToast(`🥇 Cleared Top 1: ${top1.name} (100%)!`);
}

function adminBeatCurrentTop3() {
  if (!gameState) return;
  const visible = getVisibleLevelsSorted(gameState);
  visible.slice(0, 3).forEach(lvl => {
    gameState.playerLevels[lvl.id] = {
      status: 'complete',
      bestPercent: 100,
      attempts: 50,
      completedAttempts: 50,
      playerVerified: false
    };
  });
  checkAchievements(gameState);
  saveState(gameState);
  renderAll();
  showToast('🏆 Cleared current Top 3 levels (100%)!');
}

function adminBeatAllChallenges() {
  if (!gameState) return;
  if (!gameState.playerChallenges) gameState.playerChallenges = {};
  const chals = getSeasonChallenges(gameState);
  chals.forEach(c => {
    gameState.playerChallenges[c.id] = {
      completed: true,
      attempts: 25
    };
  });
  checkAchievements(gameState);
  saveState(gameState);
  renderAll();
  showToast('⚡ Cleared all challenges!');
}

function adminBeatAlphaTrilogy() {
  if (!gameState) return;
  if (!gameState.playerChallenges) gameState.playerChallenges = {};
  ['retray', 'dark_paradise', 'sonar'].forEach(cid => {
    gameState.playerChallenges[cid] = {
      completed: true,
      attempts: 20
    };
  });
  checkAchievements(gameState);
  saveState(gameState);
  renderAll();
  showToast('🌟 Cleared the Alpha Trilogy (Retray, Dark Paradise, Sonar)!');
}

function adminUnlockAllAchievements() {
  if (!gameState) return;
  if (!gameState.achievements) gameState.achievements = {};
  (GI.ACHIEVEMENTS || []).forEach(a => {
    gameState.achievements[a.id] = true;
  });
  saveState(gameState);
  renderAll();
  showToast('🏆 Unlocked all 9 achievements!');
}

function adminResetAchievements() {
  if (!gameState) return;
  gameState.achievements = {};
  saveState(gameState);
  renderAll();
  showToast('🔄 Reset all achievements.');
}

function adminAddScore(pts) {
  if (!gameState) return;
  const num = parseInt(pts) || 0;
  gameState.adminBonusScore = (gameState.adminBonusScore || 0) + num;
  saveState(gameState);
  renderAll();
  showToast(`💰 Added +${num.toLocaleString()} score points!`);
}

// asafgamery: ─────────────────────────────────────────────────────────
//  asafgamery: GAME PAGE
// asafgamery: ─────────────────────────────────────────────────────────

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

// asafgamery: ─────────────────────────────────────────────────────────
//  asafgamery: BOOTSTRAP
// asafgamery: ─────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  if      (page === 'index') initIndexPage();
  else if (page === 'game')  initGamePage();
});

// ╔═══════════════════════════════════════════════════════════════════════╗
// ║  A NOTE FROM THE DEV                                                  ║
// ╠═══════════════════════════════════════════════════════════════════════╣
// ║                                                                       ║
// ║  asafgamery: i love Geometry Dash so much, it's genuinely one of     ║
// ║  asafgamery: the games that impacted me the most. the community,     ║
// ║  asafgamery: the music, the levels, the grind... it's all perfect.   ║
// ║  asafgamery: that's exactly why i decided to build this site —       ║
// ║  asafgamery: i wanted to make something that captured the feeling    ║
// ║  asafgamery: of being a top GD player, even if just in a browser.   ║
// ║                                                                       ║
// ║  asafgamery: i'm a brazilian dev (BR 🇧🇷) and this whole project     ║
// ║  asafgamery: was built solo, with a lot of patience and passion.     ║
// ║  asafgamery: not everything went smoothly but i kept going.          ║
// ║  asafgamery: if you're reading this, thanks for playing :)           ║
// ║                                                                       ║
// ║  asafgamery: — asaf (asafgamery)                                     ║
// ║                                                                       ║
// ╚═══════════════════════════════════════════════════════════════════════╝
