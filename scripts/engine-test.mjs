/**
 * Headless engine tests — loads the classic-script data/engine files into one
 * scope and asserts battle math, learnsets, evolution, bond, capture and
 * encounter behavior. No Electron or Phaser required.
 *
 *   npm run engine-test
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
// Game files use top-level const/function (classic scripts), which stay in
// the script's lexical scope — the shim line copies them onto the context.
const exported = [
  'MAPS', 'MOVES', 'LUMINARY_SPECIES', 'ITEMS', 'TRAINERS', 'makeLuminary', 'calcStats', 'rollEncounter',
  'typeMultiplier', 'stageMultiplier', 'computeDamage', 'applySupportEffect', 'expToNext',
  'expReward', 'grantExp', 'movesLearnedAt', 'learnMove', 'evolutionFor', 'evolve', 'gainBond',
  'rollCapture', 'rollEscape', 'STATUSES', 'tryInflictStatus', 'statusCanAct', 'statusEndOfTurn',
];
const source =
  ['src/data/starters.js', 'src/data/items.js', 'src/data/maps.js', 'src/data/trainers.js', 'src/systems/BattleEngine.js']
    .map((f) => readFileSync(join(root, f), 'utf8'))
    .join('\n') + `\n;${JSON.stringify(exported)}.forEach((n) => { globalThis[n] = eval(n); });\n`;
const ctx = vm.createContext({ console });
vm.runInContext(source, ctx);
const G = ctx; // globals defined by the game scripts

let fail = 0;
const check = (name, cond, extra = '') => {
  console.log(`${cond ? 'PASS' : 'FAIL'} — ${name}${extra ? ` (${extra})` : ''}`);
  if (!cond) fail++;
};

// --- data integrity -------------------------------------------------------
for (const m of Object.values(G.MAPS)) {
  if (!m.encounters) continue;
  for (const e of m.encounters.table) check(`species exists: ${e.speciesId}`, !!G.LUMINARY_SPECIES[e.speciesId]);
}
for (const sp of Object.values(G.LUMINARY_SPECIES)) {
  for (const e of sp.learnset) check(`move exists: ${sp.id}/${e.id}`, !!G.MOVES[e.id]);
  if (sp.evolution?.toId) check(`evolution target exists: ${sp.id} -> ${sp.evolution.toId}`, !!G.LUMINARY_SPECIES[sp.evolution.toId]);
  if (sp.signatureMove) check(`signature move exists: ${sp.id}`, !!G.MOVES[sp.signatureMove]);
}

// --- makeLuminary + leveled learnsets --------------------------------------
const low = G.makeLuminary('embrik', 5);
check('Lv5 Embrik knows 2 moves (flame_burst is Lv9)', low.moves.length === 2);
const high = G.makeLuminary('embrik', 10);
check('Lv10 Embrik knows flame_burst', high.moves.some((m) => m.id === 'flame_burst'));

// --- type chart / damage ----------------------------------------------------
check('Flame vs Verdant = 2', G.typeMultiplier('Flame', ['Verdant']) === 2);
check('Tide vs Verdant = 0.5', G.typeMultiplier('Tide', ['Verdant']) === 0.5);
check('unlisted matchup defaults to 1', G.typeMultiplier('Beast', ['Wind', 'Light']) === 1);
const stages = { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
const wild = G.makeLuminary('sprigling', 3);
const dmg = G.computeDamage(low, wild, G.MOVES.cinder_snap, stages, { ...stages });
check(`damage in sane range: ${dmg.damage}`, dmg.damage >= 1 && dmg.damage <= 60);

// --- support effects --------------------------------------------------------
const st = { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
const msg = G.applySupportEffect(G.MOVES.rootbrace, st);
check('rootbrace raises def', st.def === 1 && /Defense rose/.test(msg));

// --- exp / level / move learning --------------------------------------------
const mon = G.makeLuminary('embrik', 8);
const levels = G.grantExp(mon, G.expToNext(8) + 1);
check('level up to 9', mon.level === 9 && levels.length === 1);
const learned = G.movesLearnedAt(mon, 9);
check('flame_burst learnable at Lv9', learned.includes('flame_burst'));
G.learnMove(mon, 'flame_burst');
check('learnMove appends', mon.moves.some((m) => m.id === 'flame_burst'));
check('already-known move not re-offered', G.movesLearnedAt(mon, 9).length === 0);

// --- evolution ---------------------------------------------------------------
const evoMon = G.makeLuminary('embrik', 15);
check('no evolution before level', G.evolutionFor(evoMon) === null);
G.grantExp(evoMon, G.expToNext(15) + 1);
check('evolution available at Lv16', !!G.evolutionFor(evoMon));
const hpBefore = evoMon.currentHp;
const to = G.evolve(evoMon);
check('evolved into Embrath', to.name === 'Embrath' && evoMon.speciesId === 'embrath' && evoMon.name === 'Embrath');
check('evolution heals by HP delta', evoMon.currentHp > hpBefore && evoMon.currentHp <= evoMon.stats.hp);
check('evolved keeps level', evoMon.level === 16);
check('wild evolutions defined', ['spriggrove', 'cindervole', 'lumenmoth'].every((id) => !!G.LUMINARY_SPECIES[id]));

// --- bond / signature move ----------------------------------------------------
const bondMon = G.makeLuminary('embrik', 10);
bondMon.bond = 8;
const res = G.gainBond(bondMon);
check('signature move unlocks at bond 8', bondMon.moves.some((m) => m.id === 'cindershroud') && res.unlockedSignature === 'Cindershroud');
let gains = 0;
for (let i = 0; i < 2000; i++) {
  const b = G.makeLuminary('embrik', 5);
  if (G.gainBond(b).gained) gains++;
}
check(`bond gain rate ~40% (${gains}/2000)`, gains > 600 && gains < 1000);
const maxBond = G.makeLuminary('embrik', 5);
maxBond.bond = 10;
for (let i = 0; i < 50; i++) G.gainBond(maxBond);
check('bond capped at 10', maxBond.bond === 10);

// --- status conditions ----------------------------------------------------------
for (const [moveId, statusId] of [['cinder_snap', 'burn'], ['glowpulse', 'sleep'], ['pebble_toss', 'shattered'], ['wisp_flare', 'echoed'], ['gloom_fang', 'hollowed']]) {
  check(`${moveId} inflicts ${statusId}`, G.MOVES[moveId].inflicts?.id === statusId && !!G.STATUSES[statusId]);
}
const victim = G.makeLuminary('sprigling', 5);
const landed = G.tryInflictStatus({ inflicts: { id: 'burn', chance: 100 } }, victim, () => 0);
check('status lands at 100% chance', landed?.id === 'burn' && victim.status?.id === 'burn');
check('existing status not overwritten', G.tryInflictStatus({ inflicts: { id: 'sleep', chance: 100 } }, victim, () => 0) === null && victim.status.id === 'burn');
const chip = G.statusEndOfTurn(victim);
check('burn chips 1/12 max HP', chip.damage === Math.max(1, Math.floor(victim.stats.hp / 12)));

const sleeper = G.makeLuminary('ashvole', 5);
sleeper.status = { id: 'sleep', turns: 2 };
check('sleeping mon skips its turn', G.statusCanAct(sleeper).act === false);
G.statusCanAct(sleeper); // second skipped turn
const wake = G.statusCanAct(sleeper);
check('wakes after its sleep turns', wake.act === true && /woke/.test(wake.message) && sleeper.status === null);

// Status multipliers, statistically (damage rolls carry crit/range variance).
const avgDamage = (atkStatus, defStatus, move, n = 800) => {
  const atk = G.makeLuminary('embrik', 20);
  const def = G.makeLuminary('pebblump', 12);
  const st = { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
  let total = 0;
  for (let i = 0; i < n; i++) {
    atk.status = atkStatus ? { id: atkStatus, turns: -1 } : null;
    def.status = defStatus ? { id: defStatus, turns: -1 } : null;
    total += G.computeDamage(atk, def, G.MOVES[move], st, { ...st }).damage;
  }
  return total / n;
};
check('burn weakens physical damage', avgDamage('burn', null, 'cinder_snap') < avgDamage(null, null, 'cinder_snap') * 0.9);
check('hollowed weakens all damage', avgDamage('hollowed', null, 'flame_burst') < avgDamage(null, null, 'flame_burst') * 0.85);
check('shattered amplifies physical taken', avgDamage(null, 'shattered', 'cinder_snap') > avgDamage(null, null, 'cinder_snap') * 1.15);
check('echoed amplifies special taken', avgDamage(null, 'echoed', 'flame_burst') > avgDamage(null, null, 'flame_burst') * 1.15);

// --- Echo Surge -------------------------------------------------------------------
const surgeAtk = G.makeLuminary('embrik', 30);
const surgeDef = G.makeLuminary('pebblump', 15);
const stg = { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
let surged = 0, plain = 0;
for (let i = 0; i < 800; i++) {
  surged += G.computeDamage(surgeAtk, surgeDef, G.MOVES.cindershroud, stg, { ...stg }, { surgeMult: 1.5 }).damage;
  plain += G.computeDamage(surgeAtk, surgeDef, G.MOVES.cindershroud, stg, { ...stg }).damage;
}
check('Echo Surge multiplies signature damage ~1.5x', surged > plain * 1.35 && surged < plain * 1.65);

// --- capture / escape ----------------------------------------------------------
let loHp = 0, hiHp = 0;
const N = 4000;
for (let i = 0; i < N; i++) {
  const w = G.makeLuminary('ashvole', 3);
  w.currentHp = 1;
  if (G.rollCapture(w).caught) loHp++;
}
for (let i = 0; i < N; i++) {
  const w = G.makeLuminary('ashvole', 3);
  if (G.rollCapture(w).caught) hiHp++;
}
check(`capture easier at low HP (${loHp} vs ${hiHp})`, loHp > hiHp);
check('faster mon always escapes', G.rollEscape(G.makeLuminary('embrik', 10), G.makeLuminary('sprigling', 3), 1) === true);

// --- encounters -----------------------------------------------------------------
let boundsOk = true;
for (let i = 0; i < 500; i++) {
  const r = G.rollEncounter(G.MAPS.ashfen_grove.encounters);
  const e = G.MAPS.ashfen_grove.encounters.table.find((t) => t.speciesId === r.speciesId);
  if (r.level < e.min || r.level > e.max) boundsOk = false;
}
check('encounter level bounds', boundsOk);

// --- items ------------------------------------------------------------------------
check('ember_tonic heals 40', G.ITEMS.ember_tonic.heal === 40);
check('capture_orb is battle-only', G.ITEMS.capture_orb.battleOnly === true);

// --- trainers ----------------------------------------------------------------------
for (const [starter, expected] of [['embrik', 'tidalink'], ['tidalink', 'thornpaw'], ['thornpaw', 'embrik']]) {
  const party = G.TRAINERS.lyra1.buildParty({ starterId: starter });
  check(`lyra1 counter-picks ${expected} vs ${starter}`, party[0].speciesId === expected && party.length === 2);
}
check('lyra1 reward defined', G.TRAINERS.lyra1.reward > 0);
const wardenParty = G.TRAINERS.warden_thane.buildParty({});
check('warden_thane fields 3 mons', wardenParty.length === 3 && wardenParty.every((m) => m.currentHp > 0));
check('warden_thane has the Oath', G.TRAINERS.warden_thane.wardenOath === true);
check('warden_thane grants the badge flag', G.TRAINERS.warden_thane.setFlags.badge_lowlands === true);
check('acolyte parties valid', G.TRAINERS.acolyte_vren.buildParty({}).length === 2 && G.TRAINERS.acolyte_sila.buildParty({}).length === 2);
check('chain_scout fields 2 mons', G.TRAINERS.chain_scout.buildParty({}).length === 2);
check('chain_scout advances the chapter', G.TRAINERS.chain_scout.setFlags.chapter === 2);
for (const [starter, expected] of [['embrik', 'tidarune'], ['tidalink', 'thorngrove'], ['thornpaw', 'embrath']]) {
  const party = G.TRAINERS.lyra2.buildParty({ starterId: starter });
  check(`lyra2 counter-picks evolved ${expected} vs ${starter}`, party[2].speciesId === expected && party.length === 3);
}

// --- shop stock + NPC battle refs resolve --------------------------------------------
for (const m of Object.values(G.MAPS)) {
  for (const npc of m.npcs ?? []) {
    if (npc.shop) for (const s of npc.shop) check(`shop item exists: ${npc.id}/${s.itemId}`, !!G.ITEMS[s.itemId]);
    if (npc.battle) check(`trainer exists: ${npc.id} -> ${npc.battle.trainerId}`, !!G.TRAINERS[npc.battle.trainerId]);
  }
}

// --- map integrity --------------------------------------------------------------------
for (const m of Object.values(G.MAPS)) {
  check(`map ${m.id} rows are 30 wide x 17 tall`, m.rows.length === 17 && m.rows.every((r) => r.length === 30));
  for (const e of m.exits ?? []) {
    check(`exit target exists: ${m.id} -> ${e.to}`, !!G.MAPS[e.to]);
    if (G.MAPS[e.to]) {
      const landing = G.MAPS[e.to].rows[e.toY]?.[e.toX];
      check(`exit landing walkable: ${m.id} -> ${e.to} (${e.toX},${e.toY})`, !'TWSBRDC'.includes(landing));
    }
  }
}

console.log(fail === 0 ? 'RESULT: ALL PASS' : `RESULT: ${fail} FAILURES`);
process.exit(fail === 0 ? 0 : 1);
