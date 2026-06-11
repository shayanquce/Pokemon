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
 * side ({atk, def, spa, spd, spe}). Returns 0-damage results for support moves.
 */
function computeDamage(attacker, defender, move, attackerStages, defenderStages) {
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

  let damage = (((2 * attacker.level) / 5 + 2) * move.power * (atkStat / Math.max(1, defStat))) / 50 + 2;
  damage *= typeMult * (stab ? 1.5 : 1) * (crit ? 1.5 : 1) * rand;
  return { damage: Math.max(1, Math.floor(damage)), typeMult, crit, stab };
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
