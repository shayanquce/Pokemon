/**
 * Hold a real key in the running game (CDP Input domain) — unlike
 * keyboard.emit(), this drives Phaser's isDown state, so it exercises the
 * held-movement path. Usage: node scripts/cdp-press.mjs ArrowLeft 600
 */
const PORT = process.env.CDP_PORT ?? 9223;
const key = process.argv[2] ?? 'ArrowDown';
const holdMs = Number(process.argv[3] ?? 500);
const CODES = { ArrowLeft: 37, ArrowRight: 39, ArrowUp: 38, ArrowDown: 40 };
const targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
const page = targets.find((t) => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0;
const pend = new Map();
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pend.has(m.id)) {
    pend.get(m.id)(m);
    pend.delete(m.id);
  }
};
const send = (method, params = {}) => {
  const i = ++id;
  ws.send(JSON.stringify({ id: i, method, params }));
  return new Promise((r) => pend.set(i, r));
};
const base = { key, code: key, windowsVirtualKeyCode: CODES[key], nativeVirtualKeyCode: CODES[key] };
await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', ...base });
await new Promise((r) => setTimeout(r, holdMs));
await send('Input.dispatchKeyEvent', { type: 'keyUp', ...base });
console.log(`held ${key} for ${holdMs}ms`);
ws.close();
process.exit(0);
