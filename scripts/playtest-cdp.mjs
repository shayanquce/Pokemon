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
await sleep(1500);
check('town map loaded after warp', (await eval_(`window.game.scene.getScene('WorldScene').map.id`)) === 'ashfen_town');
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
  // Move cursor down to Capture and select.
  await eval_(`(() => { const b = window.game.scene.getScene('BattleScene'); if (b?.menu) { b.menu.index = 1; b.menu.refresh(); b.menu.select(); } return true; })()`);
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

// 9. Save record on disk reflects the run.
const saveOk = await eval_(`window.LuminaryNative.saves.read('slot_3').then(r => r.ok && r.record.data.storyFlags.met_lyra === true)`);
check('slot_3 save on disk has story flags', saveOk);

// Clean up the test slot.
await eval_(`window.LuminaryNative.saves.delete('slot_3').then(() => true)`);
console.log(failures === 0 ? '[playtest] RESULT: ALL PASS' : `[playtest] RESULT: ${failures} FAILURES`);
ws.close();
process.exit(failures === 0 ? 0 : 1);
