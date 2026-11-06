// Capture the Town's upcoming Meetings & Events list from the live homepage, in the visible
// port-9222 Chrome (never a hidden browser on the G6). Writes snapshot/events.html: the
// un-initialised list the Town's own RZRenderMini() turns into its carousel.
// node tools/capture-events.mjs
import fs from 'node:fs';
import path from 'node:path';
const base = 'http://127.0.0.1:9222';
const out = path.join(path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/, '$1'), '..', 'snapshot', 'events.html');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const t = await (await fetch(base + '/json/new?https://www.townofdelafield.org/', { method: 'PUT' })).json();
const sock = new WebSocket(t.webSocketDebuggerUrl);
await new Promise((r, j) => { sock.onopen = r; sock.onerror = j; });
let n = 0; const pend = new Map();
sock.onmessage = m => { const d = JSON.parse(m.data); if (pend.has(d.id)) { pend.get(d.id)(d); pend.delete(d.id); } };
const send = (method, params = {}) => new Promise(r => { const i = ++n; pend.set(i, r); sock.send(JSON.stringify({ id: i, method, params })); });
const expr = `(() => {
  const items = [...document.querySelectorAll('#mini-events .mini-events-list .cal-event')];
  if (!items.length) return null;
  const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
  return '<div class="mini-events-list" data-calendar="1">' + items.map(ev => {
    const c = ev.querySelector('.cal-content');
    const clone = c.cloneNode(true);
    const more = clone.querySelector('.cal-more');
    if (more) more.outerHTML = '<a class="cal-more" href="https://www.townofdelafield.org/calendar.php">View Event</a>';
    clone.removeAttribute('data-click-event');
    return '<div class="cal-event">' + clone.outerHTML + '</div>';
  }).join('') + '</div>';
})()`;
let html = null;
for (let i = 0; i < 30 && !html; i++) {
  await sleep(1000);
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
  html = r.result?.result?.value;
}
sock.close();
await fetch(base + '/json/close/' + t.id);
if (!html) { console.error('FAIL: no events found on the live page'); process.exit(1); }
fs.writeFileSync(out, html);
console.log('events.html written,', (html.match(/class="cal-event"/g) || []).length, 'events');
