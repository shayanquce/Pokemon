/**
 * Save a generated canvas texture from the running game as a PNG.
 * Usage: node scripts/dump-texture.mjs <textureKey> [scale]
 * Output: %TEMP%/tex-<key>.png (nearest-neighbor upscaled for inspection)
 */
const PORT = process.env.CDP_PORT ?? 9223;
const key = process.argv[2];
const scale = Number(process.argv[3] ?? 8);
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
const expr = `(() => {
  const src = window.game.textures.get('${key}').getSourceImage();
  const c = document.createElement('canvas');
  c.width = src.width * ${scale};
  c.height = src.height * ${scale};
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(src, 0, 0, c.width, c.height);
  return c.toDataURL();
})()`;
const res = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
const dataUrl = res.result?.result?.value;
const { writeFileSync } = await import('node:fs');
writeFileSync(`${process.env.TEMP}/tex-${key}.png`, Buffer.from(dataUrl.split(',')[1], 'base64'));
console.log(`saved %TEMP%/tex-${key}.png`);
process.exit(0);
