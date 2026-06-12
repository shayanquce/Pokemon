/**
 * BattleEngine — pure battle math, no rendering. BattleScene calls into this
 * for type effectiveness, damage, stat stages, experience, and capture rolls.
 *
 * The type chart below covers the types in play through the Ashfen Lowlands;
 * unlisted matchups default to 1x. The full balanced 18x18 chart replaces
 * this table in the "first 30 Luminary" phase without changing the API.
 */

/** TYPE_CHART[attacking][defending] = multiplier (missing = 1). */
const TYPE_CHART = {
  Flame: { Verdant: 2, Frost: 2, Tide: 0.5, Stone: 0.5, Flame: 0.5 },
  Tide: { Flame: 2, Stone: 2, Verdant: 0.5, Tide: 0.5 },
  Verdant: { Tide: 2, Stone: 2, Flame: 0.5, Wind: 0.5, Verdant: 0.5 },
  Stone: { Flame: 2, Wind: 2, Verdant: 0.5, Tide: 0.5 },
  Wind: { Verdant: 2, Beast: 2, Stone: 0.5, Volt: 0.5 },
  Light: { Shadow: 2, Void: 2, Light: 0.5 },
  Shadow: { Psyche: 2, Light: 0.5, Shadow: 0.5 },
  Psyche: { Venom: 2, Beast: 2, Psyche: 0.5, Shadow: 0 },
  Beast: { Psyche: 0.5, Iron: 0.5 },
  Spirit: { Psyche: 2, Spirit: 2, Beast: 0 },
  Frost: { Verdant: 2, Wind: 2, Beast: 2, Flame: 0.5, Tide: 0.5, Frost: 0.5 },
};

function typeMultiplier(moveType, defenderTypes) {
  return defenderTypes.reduce((m, t) => m * (TYPE_CHART[moveType]?.[t] ?? 1), 1);
}

/** Stat-stage multiplier: each stage is ±50%, clamped to ±4 stages. */
function stageMultiplier(stage) {
  const s = Math.max(-4, Math.min(4, stage));
  return s >= 0 ? 1 + 0.5 * s : 1 / (1 + 0.5 * -s);
}

/**
 * Damage for one move use. `stages` are the in-battle stat stages of each
 * side ({atk, def, spa, spd, spe}). Returns 0-damage results for support
 * moves. `opts.surgeMult` is the Echo Surge multiplier (Bond 10 signature).
 */
function computeDamage(attacker, defender, move, attackerStages, defenderStages, opts = {}) {
  if (!move.power) return { damage: 0, typeMult: 1, crit: false, stab: false };
  const species = LUMINARY_SPECIES[attacker.speciesId];
  const defSpecies = LUMINARY_SPECIES[defender.speciesId];

  const physical = move.category === 'physical';
  const atkStat = (physical ? attacker.stats.atk : attacker.stats.spa) * stageMultiplier(physical ? attackerStages.atk : attackerStages.spa);
  const defStat = (physical ? defender.stats.def : defender.stats.spd) * stageMultiplier(physical ? defenderStages.def : defenderStages.spd);

  const typeMult = typeMultiplier(move.type, defSpecies.types);
  const stab = species.types.includes(move.type);
  const crit = Math.random() < 1 / 16;
  const rand = 0.85 + Math.random() * 0.15;

  // Status conditions bend the math: burns sap physical force, a Hollowed
  // spirit strikes dimly, Shattered armor and Echoed wards crack open.
  let statusMult = 1;
  if (attacker.status?.id === 'burn' && physical) statusMult *= 0.75;
  if (attacker.status?.id === 'hollowed') statusMult *= 0.7;
  if (defender.status?.id === 'shattered' && physical) statusMult *= 1.3;
  if (defender.status?.id === 'echoed' && !physical) statusMult *= 1.3;

  let damage = (((2 * attacker.level) / 5 + 2) * move.power * (atkStat / Math.max(1, defStat))) / 50 + 2;
  damage *= typeMult * (stab ? 1.5 : 1) * (crit ? 1.5 : 1) * rand * statusMult * (opts.surgeMult ?? 1);
  return { damage: Math.max(1, Math.floor(damage)), typeMult, crit, stab };
}

// ----------------------------------------------------------------- status --

/**
 * Status conditions. Classic burn/sleep plus the spec's own three:
 * Shattered (armor cracked: +30% physical damage taken), Echoed (wards rung
 * hollow: +30% special damage taken), Hollowed (spirit dimmed: -30% damage
 * dealt). One condition at a time; shrine rests and blackouts clear them.
 */
const STATUSES = {
  burn: { id: 'burn', name: 'Burned', tag: 'BRN', color: '#e0703a', applied: 'was burned!' },
  sleep: { id: 'sleep', name: 'Asleep', tag: 'SLP', color: '#9fd8ff', applied: 'fell fast asleep!' },
  shattered: { id: 'shattered', name: 'Shattered', tag: 'SHT', color: '#9a8a66', applied: "was Shattered — its armor cracks!" },
  echoed: { id: 'echoed', name: 'Echoed', tag: 'ECH', color: '#d4af37', applied: 'was Echoed — its wards ring hollow!' },
  hollowed: { id: 'hollowed', name: 'Hollowed', tag: 'HLW', color: '#6a5a8a', applied: 'was Hollowed — its light dims!' },
};

/**
 * Roll a move's `inflicts: { id, chance }` against the defender. Returns the
 * STATUSES entry when a new condition lands, else null.
 */
function tryInflictStatus(move, defender, rng = Math.random) {
  if (!move.inflicts || defender.status || defender.currentHp <= 0) return null;
  if (rng() * 100 >= move.inflicts.chance) return null;
  const id = move.inflicts.id;
  defender.status = { id, turns: id === 'sleep' ? 1 + Math.floor(rng() * 3) : -1 };
  return STATUSES[id];
}

/** Sleep gate: skips the turn while `turns` remain, then wakes. */
function statusCanAct(mon) {
  if (mon.status?.id !== 'sleep') return { act: true, message: null };
  if (mon.status.turns > 0) {
    mon.status.turns--;
    return { act: false, message: 'is fast asleep.' };
  }
  mon.status = null;
  return { act: true, message: 'woke up!' };
}

/** End-of-turn chip damage (burn only, 1/12 max HP). */
function statusEndOfTurn(mon) {
  if (mon.status?.id !== 'burn' || mon.currentHp <= 0) return null;
  return { damage: Math.max(1, Math.floor(mon.stats.hp / 12)), message: 'is seared by its burn!' };
}

/** Support-move effects: 'raise_<stat>_<n>' on self. Returns a message part. */
function applySupportEffect(move, userStages) {
  const m = /^raise_(\w+)_(\d)$/.exec(move.effect ?? '');
  if (!m) return null;
  const stat = m[1], amount = Number(m[2]);
  const label = { atk: 'Attack', def: 'Defense', spa: 'Sp. Attack', spd: 'Sp. Defense', spe: 'Speed' }[stat] ?? stat;
  if (userStages[stat] >= 4) return `${label} can't go any higher!`;
  userStages[stat] += amount;
  return `${label} rose!`;
}

// ------------------------------------------------------------- experience --

/** Total exp required to go from `level` to `level + 1`. */
function expToNext(level) {
  return level * level * 5 + 15;
}

/** Exp awarded for defeating (or capturing) a wild Luminary. */
function expReward(defeated) {
  const base = LUMINARY_SPECIES[defeated.speciesId].baseExp ?? 50;
  return Math.max(1, Math.floor((base * defeated.level) / 6));
}

/**
 * Apply exp to a Luminary, leveling up as many times as earned.
 * Returns the list of levels gained (empty when none).
 */
function grantExp(mon, amount) {
  mon.exp += amount;
  const levelsGained = [];
  while (mon.exp >= expToNext(mon.level) && mon.level < 100) {
    mon.exp -= expToNext(mon.level);
    mon.level++;
    const species = LUMINARY_SPECIES[mon.speciesId];
    const before = mon.stats;
    mon.stats = calcStats(species, mon.level);
    // Keep current damage taken: heal by exactly the max-HP gain.
    mon.currentHp = Math.min(mon.stats.hp, mon.currentHp + (mon.stats.hp - before.hp));
    levelsGained.push(mon.level);
  }
  return levelsGained;
}

/** Learnset moves unlocked exactly at `level` that the mon doesn't know. */
function movesLearnedAt(mon, level) {
  const species = LUMINARY_SPECIES[mon.speciesId];
  return species.learnset
    .filter((e) => e.level === level && !mon.moves.some((m) => m.id === e.id))
    .map((e) => e.id);
}

/** Teach a move in place (assumes a free slot or that the caller replaced one). */
function learnMove(mon, moveId, replaceIndex = -1) {
  const slot = { id: moveId, pp: MOVES[moveId].pp, maxPp: MOVES[moveId].pp };
  if (replaceIndex >= 0) mon.moves[replaceIndex] = slot;
  else mon.moves.push(slot);
}

// -------------------------------------------------------------- evolution --

/** The evolution this mon qualifies for right now, or null. */
function evolutionFor(mon) {
  const evo = LUMINARY_SPECIES[mon.speciesId].evolution;
  if (!evo?.toId || !LUMINARY_SPECIES[evo.toId]) return null;
  return mon.level >= evo.level ? evo : null;
}

/** Transform in place; stats recalc and the max-HP gain is added as healing. */
function evolve(mon) {
  const evo = evolutionFor(mon);
  if (!evo) return null;
  const to = LUMINARY_SPECIES[evo.toId];
  const before = mon.stats;
  mon.speciesId = to.id;
  mon.name = to.name;
  mon.stats = calcStats(to, mon.level);
  mon.currentHp = Math.min(mon.stats.hp, mon.currentHp + (mon.stats.hp - before.hp));
  return to;
}

// ------------------------------------------------------------------- bond --

const SIGNATURE_BOND = 8;

/**
 * Post-victory bond growth for the active mon (~40% chance, cap 10).
 * Returns { gained, unlockedSignature } — the signature move unlocks at
 * Bond 8 when a move slot is free (Echo Surge at Bond 10 is a later phase).
 */
function gainBond(mon) {
  const out = { gained: false, unlockedSignature: null };
  if (mon.bond < 10 && Math.random() < 0.4) {
    mon.bond++;
    out.gained = true;
  }
  const sig = LUMINARY_SPECIES[mon.speciesId].signatureMove;
  if (sig && mon.bond >= SIGNATURE_BOND && !mon.moves.some((m) => m.id === sig) && mon.moves.length < 4) {
    learnMove(mon, sig);
    out.unlockedSignature = MOVES[sig].name;
  }
  return out;
}

// ---------------------------------------------------------------- capture --

/**
 * One Capture Orb throw. Lower HP and status raise the odds; species
 * captureRate (out of 255) sets the ceiling. Returns shakes (0-3) + caught.
 */
function rollCapture(wild) {
  const species = LUMINARY_SPECIES[wild.speciesId];
  const hpFrac = wild.currentHp / wild.stats.hp;
  const statusBonus = wild.status ? 1.4 : 1;
  const chance = Math.min(0.95, ((species.captureRate ?? 100) / 255) * (1 - 0.65 * hpFrac) * statusBonus + 0.05);

  if (Math.random() < chance) return { caught: true, shakes: 3 };
  // Near-misses shake more — the classic heartbreak curve.
  const closeness = Math.random() * chance * 1.4;
  const shakes = closeness > chance ? 2 : closeness > chance / 2 ? 1 : 0;
  return { caught: false, shakes };
}

/** Flee check: faster Luminary always escape; slower ones usually do. */
function rollEscape(player, wild, attempts) {
  if (player.stats.spe >= wild.stats.spe) return true;
  return Math.random() < 0.5 + 0.2 * attempts;
}
