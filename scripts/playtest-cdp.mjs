/**
 * Automated playtest — drives a running game instance over the Chrome
 * DevTools Protocol (launch with: npx electron . --remote-debugging-port=9223).
 *
 * Walks the real Phase-2 content: new game -> Whispergrove -> warp to Ashfen
 * Town -> NPC dialogue (npcStates + flags persisted) -> door text -> forced
 * wild battle -> win via moves -> capture a second wild -> verify save state.
 *
 *   node scripts/playtest-cdp.mjs
 */
const PORT = process.env.CDP_PORT ?? 9223;
let failures = 0;

function check(name, cond, extra = '') {
  console.log(`[playtest] ${cond ? 'PASS' : 'FAIL'} — ${name}${extra ? ` (${extra})` : ''}`);
  if (!cond) failures++;
}

async function connect() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const targets = await res.json();
      const page = targets.find((t) => t.type === 'page');
      if (page) return new WebSocket(page.webSocketDebuggerUrl);
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('Could not reach CDP endpoint — is the game running with --remote-debugging-port?');
}

const ws = await connect();
await new Promise((r) => (ws.onopen = r));
let msgId = 0;
const pending = new Map();
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
  }
};

function send(method, params = {}) {
  const id = ++msgId;
  ws.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve) => pending.set(id, resolve));
}

/** Evaluate an async expression in the page and return its JSON value. */
async function eval_(expr) {
  const res = await send('Runtime.evaluate', {
    expression: `(async () => (${expr}))()`,
    awaitPromise: true,
    returnByValue: true,
  });
  if (res.result?.exceptionDetails || res.result?.result?.subtype === 'error') {
    throw new Error('Page error: ' + JSON.stringify(res.result, null, 2).slice(0, 800));
  }
  return res.result?.result?.value;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Poll an expression until truthy (map warps include async save + fade). */
async function waitFor(expr, timeout = 10000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) {
    try {
      if (await eval_(expr)) return true;
    } catch {}
    await sleep(300);
  }
  return false;
}
const pressZ = () => eval_(`(window.game.scene.getScenes(true)[0].input.keyboard.emit('keydown-Z'), true)`);

// ----------------------------------------------------------------- flow --

// 1. Title screen up?
await eval_(`new Promise((res) => { const t = setInterval(() => { if (window.game?.scene?.isActive('TitleScene')) { clearInterval(t); res(true); } }, 200); })`);
check('TitleScene active', true);

// 2. New game straight into the world (slot 3 so real saves are less disturbed).
await eval_(`(Save.newGame({ playerName: 'Kael', starterId: 'embrik', slotId: 'slot_3' }), window.game.scene.getScene('TitleScene').scene.start('WorldScene', { fresh: true }), true)`);
await sleep(1200);
check('WorldScene active', await eval_(`window.game.scene.isActive('WorldScene')`));
check('grove map loaded', (await eval_(`window.game.scene.getScene('WorldScene').map.id`)) === 'ashfen_grove');
check('grove NPC spawned', (await eval_(`window.game.scene.getScene('WorldScene').npcs.length`)) === 1);

// 3. Collision sanity: tree solid, path walkable, NPC tile solid.
check('tree is solid', await eval_(`window.game.scene.getScene('WorldScene').isSolid(0, 0)`));
check('path is walkable', !(await eval_(`window.game.scene.getScene('WorldScene').isSolid(14, 5)`)));
check('NPC tile is solid', await eval_(`window.game.scene.getScene('WorldScene').isSolid(12, 8)`));

// 4. Warp north to Ashfen Town.
await eval_(`(window.game.scene.getScene('WorldScene').warpTo({ x: 14, y: 0, to: 'ashfen_town', toX: 14, toY: 15, facing: 'up' }), true)`);
check('town map loaded after warp', await waitFor(`Boolean(window.game.scene.isActive('WorldScene') && window.game.scene.getScene('WorldScene').map.id === 'ashfen_town' && window.game.scene.getScene('WorldScene').npcs)`));
await sleep(500);
check('town discovered', await eval_(`Save.state.discoveredLocations.includes('ashfen_town')`));
check('4 town NPCs spawned', (await eval_(`window.game.scene.getScene('WorldScene').npcs.length`)) === 4);

// 5. Talk to Lyra: open dialogue, advance through all pages, flag set after.
await eval_(`(() => { const w = window.game.scene.getScene('WorldScene'); w.facing = 'down'; w.talkTo(w.npcs.find(n => n.def.id === 'lyra')); return true; })()`);
await sleep(300);
for (let i = 0; i < 8; i++) { await pressZ(); await sleep(250); }
await sleep(600);
check('Lyra dialogue completed + flag set', await eval_(`Save.state.storyFlags.met_lyra === true`));
check('Lyra npcState persisted', await eval_(`Save.state.npcStates.lyra?.talked === true`));
check('uiLock released after dialogue', !(await eval_(`window.game.scene.getScene('WorldScene').uiLock`)));

// 6. Door flavor text opens and closes.
await eval_(`(() => { const w = window.game.scene.getScene('WorldScene'); w.tileX = 14; w.tileY = 4; w.facing = 'up'; w.interact(); return true; })()`);
await sleep(300);
check('door dialogue locks UI', await eval_(`window.game.scene.getScene('WorldScene').uiLock`));
await pressZ(); await sleep(200); await pressZ(); await sleep(300);
check('door dialogue closes', !(await eval_(`window.game.scene.getScene('WorldScene').uiLock`)));

// 6b. Party panel from the world: opens, reorders, closes.
await eval_(`(window.game.scene.getScene('WorldScene').openParty(), true)`);
await sleep(300);
check('party panel locks UI', await eval_(`window.game.scene.getScene('WorldScene').uiLock`));
await eval_(`(window.game.scene.getScene('WorldScene').input.keyboard.emit('keydown-X'), true)`);
await sleep(300);
check('party panel closes', !(await eval_(`window.game.scene.getScene('WorldScene').uiLock`)));

// 6c. Ember Tonic heals a damaged lead from the Items menu.
await eval_(`(Save.state.party[0].currentHp = Math.max(1, Save.state.party[0].currentHp - 10), true)`);
const tonicsBefore = await eval_(`Save.state.inventory.ember_tonic`);
const hpBeforeTonic = await eval_(`Save.state.party[0].currentHp`);
await eval_(`(window.game.scene.getScene('WorldScene').openItems(), true)`);
await sleep(300);
await pressZ(); // choose Ember Tonic
await sleep(300);
await pressZ(); // target the lead
await sleep(600);
check('tonic healed the lead', (await eval_(`Save.state.party[0].currentHp`)) > hpBeforeTonic);
check('tonic consumed', (await eval_(`Save.state.inventory.ember_tonic`)) === tonicsBefore - 1);
check('uiLock released after item use', !(await eval_(`window.game.scene.getScene('WorldScene').uiLock`)));

// 7. Forced wild battle: win with moves.
await eval_(`(window.game.scene.getScene('WorldScene').scene.start('BattleScene', { wild: makeLuminary('sprigling', 2) }), true)`);
await sleep(1000);
check('BattleScene active', await eval_(`window.game.scene.isActive('BattleScene')`));
await pressZ(); await sleep(300); await pressZ(); await sleep(500); // intro messages

const expBefore = await eval_(`Save.state.party[0].exp + Save.state.party[0].level * 1000`);
for (let round = 0; round < 12; round++) {
  const scene = await eval_(`window.game.scene.getScenes(true)[0].scene.key`);
  if (scene !== 'BattleScene') break;
  // If the command menu is open, choose Fight -> first move; otherwise advance messages.
  const menuOpen = await eval_(`Boolean(window.game.scene.getScene('BattleScene')?.menu)`);
  await pressZ();
  await sleep(menuOpen ? 400 : 350);
  if (menuOpen) { await pressZ(); await sleep(400); }
  // Drain any result messages.
  for (let i = 0; i < 6; i++) { await pressZ(); await sleep(300); }
}
await sleep(1500);
check('battle won, back in world', await eval_(`window.game.scene.isActive('WorldScene')`));
const expAfter = await eval_(`Save.state.party[0].exp + Save.state.party[0].level * 1000`);
check('exp/level gained', expAfter > expBefore, `${expBefore} -> ${expAfter}`);
check('dex recorded sprigling as seen', await eval_(`Save.state.dex.seen.includes('sprigling')`));

// 8. Capture: weaken nothing, just throw orbs at a fresh low-level wild until caught or out.
await eval_(`(window.game.scene.getScene('WorldScene').scene.start('BattleScene', { wild: makeLuminary('ashvole', 2) }), true)`);
await sleep(1000);
await pressZ(); await sleep(300); await pressZ(); await sleep(500);
const orbsBefore = await eval_(`Save.state.inventory.capture_orb`);
for (let attempt = 0; attempt < 5; attempt++) {
  const scene = await eval_(`window.game.scene.getScenes(true)[0].scene.key`);
  if (scene !== 'BattleScene') break;
  // If a submenu (e.g. the move list) is open from drain presses, back out first.
  await eval_(`(() => { const b = window.game.scene.getScene('BattleScene'); if (b?.menu && b.menu.items.length < 5) b.menu.cancel(); return true; })()`);
  await sleep(250);
  // Move cursor down to Capture (Fight / Item / Switch / Capture / Run) and select.
  await eval_(`(() => { const b = window.game.scene.getScene('BattleScene'); if (b?.menu && b.menu.items.length === 5) { b.menu.index = 3; b.menu.refresh(); b.menu.select(); } return true; })()`);
  await sleep(2500); // orb arc + shakes
  for (let i = 0; i < 8; i++) { await pressZ(); await sleep(300); }
}
await sleep(1500);
const orbsAfter = await eval_(`Save.state.inventory.capture_orb`);
check('orbs consumed', orbsAfter < orbsBefore, `${orbsBefore} -> ${orbsAfter}`);
const caught = await eval_(`Save.state.dex.caught.includes('ashvole')`);
const partySize = await eval_(`Save.state.party.length`);
check('capture flow completed (caught or out of orbs/fled)', caught || orbsAfter === 0 || (await eval_(`window.game.scene.isActive('WorldScene')`)));
if (caught) check('captured ashvole joined party', partySize === 2, `party=${partySize}`);

// 8b. With 2 party members: in-battle Switch keeps the turn.
if (partySize >= 2) {
  await eval_(`(window.game.scene.getScene('WorldScene').scene.start('BattleScene', { wild: makeLuminary('sprigling', 2) }), true)`);
  await sleep(1000);
  await pressZ(); await sleep(300); await pressZ(); await sleep(500); // intro
  const leadBefore = await eval_(`window.game.scene.getScene('BattleScene').playerMon.speciesId`);
  // Select Switch (index 2), then pick the other party member in the panel.
  await eval_(`(() => { const b = window.game.scene.getScene('BattleScene'); if (b?.menu && b.menu.items.length === 5) { b.menu.index = 2; b.menu.refresh(); b.menu.select(); } return true; })()`);
  await sleep(400);
  await eval_(`(window.game.scene.getScene('BattleScene').input.keyboard.emit('keydown-DOWN'), true)`);
  await sleep(150);
  await pressZ(); // choose
  await sleep(300);
  await pressZ(); await sleep(300); await pressZ(); await sleep(500); // come back / go messages
  const leadAfter = await eval_(`window.game.scene.getScene('BattleScene').playerMon.speciesId`);
  check('switch changed the active mon', leadAfter !== leadBefore, `${leadBefore} -> ${leadAfter}`);
  check('switch kept the turn (command menu reopen)', await eval_(`Boolean(window.game.scene.getScene('BattleScene')?.menu)`));
  // Flee to clean up (Run is index 4).
  for (let i = 0; i < 6; i++) {
    const inBattle = await eval_(`window.game.scene.isActive('BattleScene')`);
    if (!inBattle) break;
    await eval_(`(() => { const b = window.game.scene.getScene('BattleScene'); if (b?.menu && b.menu.items.length < 5) b.menu.cancel(); return true; })()`);
    await sleep(250);
    await eval_(`(() => { const b = window.game.scene.getScene('BattleScene'); if (b?.menu && b.menu.items.length === 5) { b.menu.index = 4; b.menu.refresh(); b.menu.select(); } return true; })()`);
    await sleep(500);
    for (let j = 0; j < 6; j++) { await pressZ(); await sleep(250); }
  }
  await sleep(800);
  check('escaped follow-up battle', await eval_(`window.game.scene.isActive('WorldScene')`));
}

// 8c. North Road: warp out the east gate, beat Lyra's trainer battle.
await eval_(`(Save.state.party[0] = makeLuminary(Save.state.starterId ?? 'embrik', 20), true)`); // deterministic rival win (counter-pick + Oath are real threats at low levels)
await eval_(`(window.game.scene.getScene('WorldScene').warpTo({ x: 29, y: 9, to: 'north_road', toX: 1, toY: 9, facing: 'right' }), true)`);
check('north road loaded', await waitFor(`Boolean(window.game.scene.isActive('WorldScene') && window.game.scene.getScene('WorldScene').map.id === 'north_road' && window.game.scene.getScene('WorldScene').npcs)`));
await sleep(500);
check('north road discovered', await eval_(`Save.state.discoveredLocations.includes('north_road')`));

const shardsBefore = await eval_(`Save.state.shards`);
await eval_(`(() => { const w = window.game.scene.getScene('WorldScene'); w.facing = 'up'; w.talkTo(w.npcs.find(n => n.def.id === 'lyra_road')); return true; })()`);
await sleep(300);
for (let i = 0; i < 6; i++) { await pressZ(); await sleep(250); } // challenge dialogue
check('trainer battle started', await waitFor(`window.game.scene.isActive('BattleScene')`));
await sleep(500);
check('battle is trainer mode', await eval_(`Boolean(window.game.scene.getScene('BattleScene').trainer)`));
for (let i = 0; i < 5; i++) { await pressZ(); await sleep(250); } // trainer intro messages

for (let round = 0; round < 25; round++) {
  const scene = await eval_(`window.game.scene.getScenes(true)[0].scene.key`);
  if (scene !== 'BattleScene') break;
  const menuOpen = await eval_(`Boolean(window.game.scene.getScene('BattleScene')?.menu)`);
  await pressZ();
  await sleep(menuOpen ? 400 : 350);
  if (menuOpen) { await pressZ(); await sleep(400); }
  for (let i = 0; i < 6; i++) { await pressZ(); await sleep(250); }
}
await sleep(1500);
check('rival battle won, back in world', await eval_(`window.game.scene.isActive('WorldScene')`));
check('rival1_won flag set', await eval_(`Save.state.storyFlags.rival1_won === true`));
check('shard reward paid', (await eval_(`Save.state.shards`)) >= shardsBefore + 300, `${shardsBefore} -> ${await eval_(`Save.state.shards`)}`);

// 8c-2. Hollow Cave: enter, deterministic Warden's Oath unit check, full Warden fight.
await eval_(`(window.game.scene.getScene('WorldScene').warpTo({ x: 22, y: 0, to: 'hollow_cave', toX: 22, toY: 15, facing: 'up' }), true)`);
check('hollow cave loaded', await waitFor(`Boolean(window.game.scene.isActive('WorldScene') && window.game.scene.getScene('WorldScene').map.id === 'hollow_cave' && window.game.scene.getScene('WorldScene').npcs)`));
check('3 cave NPCs spawned', (await eval_(`window.game.scene.getScene('WorldScene').npcs.length`)) === 3);
check('cave rock is solid', await eval_(`window.game.scene.getScene('WorldScene').isSolid(0, 0)`));
check('cave floor is walkable', !(await eval_(`window.game.scene.getScene('WorldScene').isSolid(22, 15)`)));

// Oath unit check inside a real warden battle, then bail out.
await eval_(`(window.game.scene.getScene('WorldScene').scene.start('BattleScene', { trainer: buildTrainer('warden_thane'), flag: 'warden1_won' }), true)`);
check('warden battle starts', await waitFor(`window.game.scene.isActive('BattleScene')`));
await sleep(800);
const oathOk = await eval_(`(async () => {
  const b = window.game.scene.getScene('BattleScene');
  b.enemyIndex = b.trainer.party.length - 1;
  b.wild = b.trainer.party[b.enemyIndex];
  b.setPanelMon(b.wildPanel, b.wild);
  b.wild.currentHp = Math.max(1, Math.floor(b.wild.stats.hp * 0.2));
  const sayOrig = b.say.bind(b); b.say = () => Promise.resolve(); // skip message waits
  await b.maybeWardenOath();
  b.say = sayOrig;
  return b.oathUsed && b.wild.currentHp === b.wild.stats.hp;
})()`);
check('Warden\'s Oath fully restores the last mon once', oathOk === true);
const oathTwice = await eval_(`(async () => {
  const b = window.game.scene.getScene('BattleScene');
  b.wild.currentHp = 1;
  await b.maybeWardenOath();
  return b.wild.currentHp === 1; // second invocation must NOT heal
})()`);
check('Oath does not fire twice', oathTwice === true);
await eval_(`(window.game.scene.getScene('BattleScene').scene.start('WorldScene', {}), true)`);
check('back in cave', await waitFor(`Boolean(window.game.scene.isActive('WorldScene') && window.game.scene.getScene('WorldScene').npcs)`));

// Full Warden fight through dialogue, driven to victory.
await eval_(`(Save.state.party[0] = makeLuminary(Save.state.starterId ?? 'embrik', 25), true)`); // strong enough to out-damage the Oath heal
const shardsPreWarden = await eval_(`Save.state.shards`);
await eval_(`(() => { const w = window.game.scene.getScene('WorldScene'); w.facing = 'up'; w.talkTo(w.npcs.find(n => n.def.id === 'warden_thane')); return true; })()`);
await sleep(300);
for (let i = 0; i < 8; i++) { await pressZ(); await sleep(250); }
check('warden battle started via dialogue', await waitFor(`window.game.scene.isActive('BattleScene')`));
await sleep(500);
for (let i = 0; i < 6; i++) { await pressZ(); await sleep(250); }
for (let round = 0; round < 40; round++) {
  const scene = await eval_(`window.game.scene.getScenes(true)[0].scene.key`);
  if (scene !== 'BattleScene') break;
  const menuOpen = await eval_(`Boolean(window.game.scene.getScene('BattleScene')?.menu)`);
  await pressZ();
  await sleep(menuOpen ? 400 : 350);
  if (menuOpen) { await pressZ(); await sleep(400); }
  for (let i = 0; i < 6; i++) { await pressZ(); await sleep(250); }
}
await sleep(1500);
check('warden defeated, back in world', await eval_(`window.game.scene.isActive('WorldScene')`));
check('warden1_won flag set', await eval_(`Save.state.storyFlags.warden1_won === true`));
check('badge_lowlands flag set', await eval_(`Save.state.storyFlags.badge_lowlands === true`));
check('warden reward paid', (await eval_(`Save.state.shards`)) >= shardsPreWarden + 600, `${shardsPreWarden} -> ${await eval_(`Save.state.shards`)}`);

// 8c-3. Echo Vault: deposit / last-companion rule / withdraw.
await eval_(`(Save.state.party = [makeLuminary(Save.state.starterId ?? 'embrik', 25), makeLuminary('ashvole', 5)], Save.state.vault = [], true)`);
await eval_(`(window.game.scene.getScene('WorldScene').openVault(), true)`);
await sleep(300);
check('vault panel opens and locks UI', await eval_(`Boolean(window.game.scene.getScene('WorldScene').vaultPanel) && window.game.scene.getScene('WorldScene').uiLock`));
await eval_(`(() => { const v = window.game.scene.getScene('WorldScene').vaultPanel; v.col = 0; v.index = 1; v.transfer(); return true; })()`);
await sleep(200);
check('deposit moved mon to vault', (await eval_(`Save.state.party.length`)) === 1 && (await eval_(`Save.state.vault.length`)) === 1);
await eval_(`(() => { const v = window.game.scene.getScene('WorldScene').vaultPanel; v.col = 0; v.index = 0; v.transfer(); return true; })()`);
await sleep(200);
check('last companion cannot be vaulted', (await eval_(`Save.state.party.length`)) === 1);
await eval_(`(() => { const v = window.game.scene.getScene('WorldScene').vaultPanel; v.setCol(1); v.index = 0; v.transfer(); return true; })()`);
await sleep(200);
check('withdraw returned mon to party', (await eval_(`Save.state.party.length`)) === 2 && (await eval_(`Save.state.vault.length`)) === 0);
await eval_(`(window.game.scene.getScene('WorldScene').input.keyboard.emit('keydown-X'), true)`);
await sleep(500);
check('vault closes, UI unlocked', !(await eval_(`window.game.scene.getScene('WorldScene').uiLock`)));

// 8c-4. Keldrath Gate: the pass-warden blocks, then steps aside for the Sigil.
await eval_(`(window.game.scene.getScene('WorldScene').warpTo({ x: 29, y: 9, to: 'keldrath_gate', toX: 1, toY: 9, facing: 'right' }), true)`);
check('keldrath gate loaded', await waitFor(`Boolean(window.game.scene.isActive('WorldScene') && window.game.scene.getScene('WorldScene').map.id === 'keldrath_gate' && window.game.scene.getScene('WorldScene').npcs)`));
await sleep(500);
check('pass-warden blocks the road', await eval_(`window.game.scene.getScene('WorldScene').isSolid(19, 9)`));
await eval_(`(() => { const w = window.game.scene.getScene('WorldScene'); w.facing = 'right'; w.talkTo(w.npcs.find(n => n.def.id === 'pass_warden_hale')); return true; })()`);
await sleep(300);
for (let i = 0; i < 5; i++) { await pressZ(); await sleep(300); }
await sleep(600);
check('coast pass granted', await eval_(`Save.state.storyFlags.coast_pass_granted === true`));
check('pass-warden stepped aside', !(await eval_(`window.game.scene.getScene('WorldScene').isSolid(19, 9)`)) && (await eval_(`window.game.scene.getScene('WorldScene').isSolid(18, 8)`)));

// 8c-5. Keldrath town: NPCs, rumor flag, and a coast wild we can flee.
await eval_(`(window.game.scene.getScene('WorldScene').warpTo({ x: 29, y: 9, to: 'keldrath_town', toX: 1, toY: 9, facing: 'right' }), true)`);
check('keldrath town loaded', await waitFor(`Boolean(window.game.scene.isActive('WorldScene') && window.game.scene.getScene('WorldScene').map.id === 'keldrath_town' && window.game.scene.getScene('WorldScene').npcs)`));
await sleep(500);
check('keldrath town discovered', await eval_(`Save.state.discoveredLocations.includes('keldrath_town')`));
check('4 coast NPCs spawned', (await eval_(`window.game.scene.getScene('WorldScene').npcs.length`)) === 4);
await eval_(`(() => { const w = window.game.scene.getScene('WorldScene'); w.facing = 'up'; w.talkTo(w.npcs.find(n => n.def.id === 'dockmaster_orla')); return true; })()`);
await sleep(300);
for (let i = 0; i < 5; i++) { await pressZ(); await sleep(300); }
await sleep(400);
check('Hollowed Chain rumor heard', await eval_(`Save.state.storyFlags.heard_chain_rumor === true`));

await eval_(`(window.game.scene.getScene('WorldScene').scene.start('BattleScene', { wild: makeLuminary('brinepup', 9) }), true)`);
await sleep(1000);
check('coast wild battle starts', await eval_(`window.game.scene.isActive('BattleScene')`));
await pressZ(); await sleep(300); await pressZ(); await sleep(500); // intro
for (let i = 0; i < 6; i++) {
  const inBattle = await eval_(`window.game.scene.isActive('BattleScene')`);
  if (!inBattle) break;
  await eval_(`(() => { const b = window.game.scene.getScene('BattleScene'); if (b?.menu && b.menu.items.length < 5) b.menu.cancel(); return true; })()`);
  await sleep(250);
  await eval_(`(() => { const b = window.game.scene.getScene('BattleScene'); if (b?.menu && b.menu.items.length === 5) { b.menu.index = 4; b.menu.refresh(); b.menu.select(); } return true; })()`);
  await sleep(500);
  for (let j = 0; j < 6; j++) { await pressZ(); await sleep(250); }
}
await sleep(800);
check('escaped coast battle', await eval_(`window.game.scene.isActive('WorldScene')`));

// 8c-5b. Maeve's free heal and the Brine Salve status cure.
await eval_(`(Save.state.party[0].currentHp = 5, Save.state.party[0].status = { id: 'burn', turns: -1 }, true)`);
await eval_(`(() => { const w = window.game.scene.getScene('WorldScene'); w.facing = 'right'; w.talkTo(w.npcs.find(n => n.def.id === 'dockside_maeve')); return true; })()`);
await sleep(300);
for (let i = 0; i < 5; i++) { await pressZ(); await sleep(250); }
await sleep(500);
check('Maeve fully healed the party', await eval_(`Save.state.party[0].currentHp === Save.state.party[0].stats.hp && Save.state.party[0].status === null`));
check('uiLock released after healer', !(await eval_(`window.game.scene.getScene('WorldScene').uiLock`)));

await eval_(`(Save.state.inventory.brine_salve = (Save.state.inventory.brine_salve ?? 0) + 1, Save.state.party[0].status = { id: 'shattered', turns: -1 }, true)`);
await eval_(`(window.game.scene.getScene('WorldScene').openItems(), true)`);
await sleep(300);
await eval_(`(window.game.scene.getScene('WorldScene').input.keyboard.emit('keydown-DOWN'), true)`);
await sleep(150);
await pressZ(); // choose Brine Salve
await sleep(300);
await pressZ(); // target the afflicted lead
await sleep(600);
check('brine salve cured the status', (await eval_(`Save.state.party[0].status`)) === null);
check('salve consumed', (await eval_(`Save.state.inventory.brine_salve`)) === 0);
check('uiLock released after salve', !(await eval_(`window.game.scene.getScene('WorldScene').uiLock`)));

// 8c-6. Chapter 1 closer: the rumor summons a Hollowed Chain scout to the gate shore.
await eval_(`(window.game.scene.getScene('WorldScene').warpTo({ x: 0, y: 9, to: 'keldrath_gate', toX: 28, toY: 9, facing: 'left' }), true)`);
check('back at the gate', await waitFor(`Boolean(window.game.scene.isActive('WorldScene') && window.game.scene.getScene('WorldScene').map.id === 'keldrath_gate' && window.game.scene.getScene('WorldScene').npcs)`));
await sleep(500);
check('chain scout appears after the rumor', (await eval_(`window.game.scene.getScene('WorldScene').npcs.length`)) === 2);
const shardsPreScout = await eval_(`Save.state.shards`);
await eval_(`(() => { const w = window.game.scene.getScene('WorldScene'); w.facing = 'up'; w.talkTo(w.npcs.find(n => n.def.id === 'chain_scout')); return true; })()`);
await sleep(300);
for (let i = 0; i < 6; i++) { await pressZ(); await sleep(250); }
check('scout battle started', await waitFor(`window.game.scene.isActive('BattleScene')`));
await sleep(500);
for (let i = 0; i < 5; i++) { await pressZ(); await sleep(250); }
for (let round = 0; round < 25; round++) {
  const scene = await eval_(`window.game.scene.getScenes(true)[0].scene.key`);
  if (scene !== 'BattleScene') break;
  const menuOpen = await eval_(`Boolean(window.game.scene.getScene('BattleScene')?.menu)`);
  await pressZ();
  await sleep(menuOpen ? 400 : 350);
  if (menuOpen) { await pressZ(); await sleep(400); }
  for (let i = 0; i < 6; i++) { await pressZ(); await sleep(250); }
}
await sleep(1500);
check('scout driven off, back in world', await eval_(`window.game.scene.isActive('WorldScene')`));
check('chain_scout_beaten flag set', await eval_(`Save.state.storyFlags.chain_scout_beaten === true`));
check('chapter advanced to 2', (await eval_(`Save.state.storyFlags.chapter`)) === 2);
check('scout reward paid', (await eval_(`Save.state.shards`)) >= shardsPreScout + 400, `${shardsPreScout} -> ${await eval_(`Save.state.shards`)}`);
await sleep(500);
check('scout gone after the rout', (await eval_(`window.game.scene.getScene('WorldScene').npcs.length`)) === 1);

// 8c-7. Keldrath Cliffs: Chapter 2 route + the Lyra rematch.
await eval_(`(window.game.scene.getScene('WorldScene').warpTo({ x: 29, y: 9, to: 'keldrath_town', toX: 1, toY: 9, facing: 'right' }), true)`);
await waitFor(`Boolean(window.game.scene.isActive('WorldScene') && window.game.scene.getScene('WorldScene').map.id === 'keldrath_town' && window.game.scene.getScene('WorldScene').npcs)`);
await eval_(`(window.game.scene.getScene('WorldScene').warpTo({ x: 21, y: 0, to: 'keldrath_cliffs', toX: 21, toY: 15, facing: 'up' }), true)`);
check('keldrath cliffs loaded', await waitFor(`Boolean(window.game.scene.isActive('WorldScene') && window.game.scene.getScene('WorldScene').map.id === 'keldrath_cliffs' && window.game.scene.getScene('WorldScene').npcs)`));
await sleep(500);
check('cliffs discovered', await eval_(`Save.state.discoveredLocations.includes('keldrath_cliffs')`));
check('2 cliff NPCs spawned', (await eval_(`window.game.scene.getScene('WorldScene').npcs.length`)) === 2);

// Deterministic rematch win: at Lv 30 the evolved counter-pick (super-
// effective ~30/turn) makes this a coin flip — 38 puts it out of reach.
await eval_(`(Save.state.party[0] = makeLuminary(Save.state.starterId ?? 'embrik', 38), true)`);
const shardsPreLyra2 = await eval_(`Save.state.shards`);
await eval_(`(() => { const w = window.game.scene.getScene('WorldScene'); w.facing = 'up'; w.talkTo(w.npcs.find(n => n.def.id === 'lyra_cliffs')); return true; })()`);
await sleep(300);
for (let i = 0; i < 6; i++) { await pressZ(); await sleep(250); }
check('rematch battle started', await waitFor(`window.game.scene.isActive('BattleScene')`));
await sleep(500);
for (let i = 0; i < 5; i++) { await pressZ(); await sleep(250); }
for (let round = 0; round < 35; round++) {
  const scene = await eval_(`window.game.scene.getScenes(true)[0].scene.key`);
  if (scene !== 'BattleScene') break;
  const menuOpen = await eval_(`Boolean(window.game.scene.getScene('BattleScene')?.menu)`);
  await pressZ();
  await sleep(menuOpen ? 400 : 350);
  if (menuOpen) { await pressZ(); await sleep(400); }
  for (let i = 0; i < 6; i++) { await pressZ(); await sleep(250); }
}
await sleep(1500);
check('rematch won, back in world', await eval_(`window.game.scene.isActive('WorldScene')`));
check('rival2_won flag set', await eval_(`Save.state.storyFlags.rival2_won === true`));
check('rematch reward paid', (await eval_(`Save.state.shards`)) >= shardsPreLyra2 + 500, `${shardsPreLyra2} -> ${await eval_(`Save.state.shards`)}`);

// 8d. Beaten Lyra hides in town; Bram's shop sells with shards.
await eval_(`(window.game.scene.getScene('WorldScene').warpTo({ x: 0, y: 9, to: 'ashfen_town', toX: 28, toY: 9, facing: 'left' }), true)`);
check('back in town after rival win', await waitFor(`Boolean(window.game.scene.isActive('WorldScene') && window.game.scene.getScene('WorldScene').map.id === 'ashfen_town' && window.game.scene.getScene('WorldScene').npcs)`));
await sleep(500);
check('town Lyra hidden after rival win', (await eval_(`window.game.scene.getScene('WorldScene').npcs.length`)) === 3);

await eval_(`(() => { const w = window.game.scene.getScene('WorldScene'); w.facing = 'down'; w.talkTo(w.npcs.find(n => n.def.id === 'merchant_bram')); return true; })()`);
await sleep(300);
// Advance dialogue only until the shop appears (extra Z presses would buy).
for (let i = 0; i < 8; i++) {
  if (await eval_(`Boolean(window.game.scene.getScene('WorldScene').shopPanel)`)) break;
  await pressZ();
  await sleep(300);
}
check('shop opened after dialogue', await eval_(`Boolean(window.game.scene.getScene('WorldScene').shopPanel)`));
const orbsPreShop = await eval_(`Save.state.inventory.capture_orb ?? 0`);
const shardsPreShop = await eval_(`Save.state.shards`);
await pressZ(); // buy one capture orb
await sleep(400);
check('orb purchased', (await eval_(`Save.state.inventory.capture_orb`)) === orbsPreShop + 1, `${orbsPreShop} -> ${await eval_(`Save.state.inventory.capture_orb`)}`);
check('shards spent', (await eval_(`Save.state.shards`)) === shardsPreShop - 200, `${shardsPreShop} -> ${await eval_(`Save.state.shards`)}`);
await eval_(`(window.game.scene.getScene('WorldScene').input.keyboard.emit('keydown-X'), true)`);
await sleep(500);
check('shop closed, UI unlocked', !(await eval_(`window.game.scene.getScene('WorldScene').uiLock`)));

// 8e. Dex screen opens from the pause menu path.
await eval_(`(window.game.scene.getScene('WorldScene').openDex(), true)`);
await sleep(300);
check('dex panel locks UI', await eval_(`window.game.scene.getScene('WorldScene').uiLock`));
await eval_(`(window.game.scene.getScene('WorldScene').input.keyboard.emit('keydown-X'), true)`);
await sleep(300);
check('dex panel closes', !(await eval_(`window.game.scene.getScene('WorldScene').uiLock`)));

// 8f. Elder Maren's counsel changes after the badge (conditionalDialogue).
await eval_(`(() => { const w = window.game.scene.getScene('WorldScene'); w.facing = 'down'; w.talkTo(w.npcs.find(n => n.def.id === 'elder_maren')); return true; })()`);
await sleep(300);
for (let i = 0; i < 6; i++) { await pressZ(); await sleep(250); }
await sleep(400);
check('Maren post-badge counsel recorded', await eval_(`Save.state.npcStates.elder_maren?.postBadge === true`));
check('uiLock released after Maren', !(await eval_(`window.game.scene.getScene('WorldScene').uiLock`)));

// 9. Save record on disk reflects the run.
const saveOk = await eval_(`window.LuminaryNative.saves.read('slot_3').then(r => r.ok && r.record.data.storyFlags.met_lyra === true)`);
check('slot_3 save on disk has story flags', saveOk);

// Clean up the test slot.
await eval_(`window.LuminaryNative.saves.delete('slot_3').then(() => true)`);
console.log(failures === 0 ? '[playtest] RESULT: ALL PASS' : `[playtest] RESULT: ${failures} FAILURES`);
ws.close();
process.exit(failures === 0 ? 0 : 1);
