/**
 * Grab a PNG of the running game (CDP port 9223). Optionally evaluates
 * SCREENSHOT_SETUP first. Output: %TEMP%/luminary-shot.png
 */
const PORT = process.env.CDP_PORT ?? 9223;
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

if (process.env.SCREENSHOT_SETUP) {
  await send('Runtime.evaluate', { expression: process.env.SCREENSHOT_SETUP, awaitPromise: false });
  await new Promise((r) => setTimeout(r, 2500));
}
const res = await send('Page.captureScreenshot', { format: 'png' });
const { writeFileSync } = await import('node:fs');
writeFileSync(`${process.env.TEMP}/luminary-shot.png`, Buffer.from(res.result.data, 'base64'));
console.log('saved to %TEMP%/luminary-shot.png');
process.exit(0);
