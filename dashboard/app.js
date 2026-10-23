(() => {
'use strict';
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = (v, d = 1) => v == null || isNaN(v) ? '-' : Number(v).toLocaleString('en-US', {maximumFractionDigits: d, minimumFractionDigits: 0});
const usd = v => v == null ? '-' : '$' + (v >= 100 ? fmt(v, 0) : v >= 1 ? Number(v).toFixed(2) : Number(v).toFixed(v === 0 ? 2 : 3));
const money = v => '$' + Number(v).toLocaleString('en-US', {minimumFractionDigits: v < 100 ? 2 : 0, maximumFractionDigits: v < 100 ? 2 : 0});
const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const dlabel = s => { if (!s) return '-'; const [y, m, d] = s.split('-'); return d ? `${MON[+m-1]} ${+d}, ${y}` : m ? `${MON[+m-1]} ${y}` : y; };
const tip = $('#tip');
function showTip(e, html) { tip.innerHTML = html; tip.hidden = false; const r = (e.target.getBoundingClientRect ? e.target.getBoundingClientRect() : null);
  let x = e.clientX ?? (r.left + r.width / 2), y = e.clientY ?? r.top; tip.style.left = Math.min(x + 12, innerWidth - 290) + 'px'; tip.style.top = (y + 14) + 'px'; }
const hideTip = () => { tip.hidden = true; };

let D, VAL = {}, NAME = id => D.models[id]?.name || id, VEND = id => D.models[id]?.vendor || '';
const II = () => D.key[0]?.metric, SPEED = () => (D.key.find(k => /speed/i.test(k.label)) || {}).metric;
const price = (id, kind) => { const p = D.prices[id]; if (!p || !p.input || !p.output) return null;
  return kind === 'input' ? p.input.usd : kind === 'output' ? p.output.usd : (3 * p.input.usd + p.output.usd) / 4; };
const score = (mid, id) => VAL[mid]?.[id];

// ---------- reusable controls ----------
function seg(el, opts, val, onChange) {
  el.innerHTML = opts.map(o => `<button role="radio" data-v="${esc(o.v)}" aria-checked="${o.v == val}" tabindex="${o.v == val ? 0 : -1}">${esc(o.l)}</button>`).join('');
  const btns = [...el.children];
  const pick = b => { btns.forEach(x => { x.setAttribute('aria-checked', x === b); x.tabIndex = x === b ? 0 : -1; }); onChange(b.dataset.v); };
  el.addEventListener('click', e => { const b = e.target.closest('button'); if (b) pick(b); });
  el.addEventListener('keydown', e => { const i = btns.indexOf(document.activeElement); if (i < 0) return;
    const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (d) { e.preventDefault(); const b = btns[(i + d + btns.length) % btns.length]; b.focus(); pick(b); } });
}
function combo(el, items, {selected = [], max = 99, single = false, onChange}) {
  // items: [{v, l, s}] ; multiselect chips with type-ahead and full keyboard support
  let sel = [...selected], open = false, act = 0, shown = [];
  const id = el.id + '-list';
  el.innerHTML = `<input class="combo-in" role="combobox" aria-expanded="false" aria-controls="${id}" aria-autocomplete="list" placeholder="${esc(el.dataset.placeholder || '')}" aria-label="${esc(el.dataset.placeholder || '')}"><ul class="list" id="${id}" role="listbox" hidden></ul>`;
  const inp = el.querySelector('input'), list = el.querySelector('ul');
  const byV = Object.fromEntries(items.map(i => [i.v, i]));
  function chips() { el.querySelectorAll('.chip').forEach(c => c.remove());
    sel.forEach(v => { const c = document.createElement('span'); c.className = 'chip'; c.innerHTML = `${esc(byV[v]?.l || v)}<button aria-label="Remove ${esc(byV[v]?.l || v)}">&times;</button>`;
      c.querySelector('button').onclick = e => { e.stopPropagation(); toggle(v); }; el.insertBefore(c, inp); });
    inp.placeholder = single && sel.length ? '' : (el.dataset.placeholder || ''); }
  function toggle(v) { if (sel.includes(v)) sel = sel.filter(x => x !== v); else if (single) sel = [v]; else if (sel.length < max) sel.push(v);
    chips(); onChange(sel); if (single) close(); else render(); }
  function render() { const q = inp.value.trim().toLowerCase();
    shown = items.filter(i => !q || (i.l + ' ' + (i.s || '')).toLowerCase().includes(q)).slice(0, 60);
    act = Math.min(act, Math.max(0, shown.length - 1));
    list.innerHTML = shown.length ? shown.map((i, k) => `<li role="option" id="${id}-${k}" aria-selected="${k === act}" class="${sel.includes(i.v) ? 'on' : ''}" data-v="${esc(i.v)}">${esc(i.l)}<small>${esc(i.s || '')}</small></li>`).join('') : '<li class="muted">No matches</li>';
    inp.setAttribute('aria-activedescendant', shown.length ? `${id}-${act}` : ''); }
  function openL() { open = true; list.hidden = false; inp.setAttribute('aria-expanded', 'true'); render(); }
  function close() { open = false; list.hidden = true; inp.setAttribute('aria-expanded', 'false'); inp.value = ''; }
  inp.addEventListener('focus', openL); inp.addEventListener('input', () => { act = 0; openL(); });
  inp.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (!open) openL(); act = Math.min(act + 1, shown.length - 1); render(); list.children[act]?.scrollIntoView({block: 'nearest'}); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); act = Math.max(act - 1, 0); render(); list.children[act]?.scrollIntoView({block: 'nearest'}); }
    else if (e.key === 'Enter') { e.preventDefault(); if (open && shown[act]) { toggle(shown[act].v); inp.value = ''; } }
    else if (e.key === 'Escape') { close(); inp.blur(); }
    else if (e.key === 'Backspace' && !inp.value && sel.length) toggle(sel[sel.length - 1]); });
  list.addEventListener('mousedown', e => { e.preventDefault(); const li = e.target.closest('li[data-v]'); if (li) { toggle(li.dataset.v); inp.value = ''; } });
  inp.addEventListener('blur', () => setTimeout(() => { if (document.activeElement !== inp) close(); }, 100));
  el.addEventListener('click', () => inp.focus());
  chips();
  return {get: () => sel};
}
function range(el, out, f, cb) { const u = () => { el.style.setProperty('--p', (el.value - el.min) / (el.max - el.min) * 100 + '%'); out.textContent = f(+el.value); cb && cb(+el.value); };
  el.addEventListener('input', u); u(); }
function bars(el, rows, {fmtV = v => fmt(v), sub = r => '', rank = true} = {}) {
  if (!rows.length) { el.innerHTML = '<p class="empty">No models match these filters.</p>'; return; }
  const mx = Math.max(...rows.map(r => r.v)) || 1;
  el.innerHTML = rows.map((r, i) => `<div class="bar" tabindex="0"><span class="nm">${rank ? `<span class="rk">${i + 1}</span>` : ''}${esc(r.l)}<small>${esc(sub(r))}</small></span><span class="tr"><span class="fl" style="width:${Math.max(1, r.v / mx * 100)}%"></span></span><span class="v">${fmtV(r.v)}</span></div>`).join('');
}
// generic scatter: pts [{x,y,l,s,id}]
function scatter(el, pts, {xl, yl, logX = false, fx = v => fmt(v), fy = v => fmt(v), label = 10, h = 360, tipf}) {
  const W = Math.max(320, el.clientWidth || 600), H = h, m = {l: 48, r: 16, t: 12, b: 40};
  if (!pts.length) { el.innerHTML = '<p class="empty">Not enough data.</p>'; return; }
  const tx = v => logX ? Math.log10(Math.max(v, 1e-3)) : v;
  const xs = pts.map(p => tx(p.x)), ys = pts.map(p => p.y);
  let x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const px = (x1 - x0) * .04 || 1, py = (y1 - y0) * .06 || 1; x0 -= px; x1 += px; y0 -= py; y1 += py;
  const X = v => m.l + (tx(v) - x0) / (x1 - x0) * (W - m.l - m.r), Y = v => H - m.b - (v - y0) / (y1 - y0) * (H - m.t - m.b);
  let g = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(yl)} vs ${esc(xl)}">`;
  for (let i = 0; i <= 4; i++) { const yv = y0 + (y1 - y0) * i / 4, yy = Y(yv); g += `<line class="gl" x1="${m.l}" x2="${W - m.r}" y1="${yy}" y2="${yy}"/><text x="${m.l - 6}" y="${yy + 4}" text-anchor="end">${fy(yv)}</text>`; }
  const ticks = logX ? [.01, .03, .1, .3, 1, 3, 10, 30, 100, 300, 1000].filter(v => Math.log10(v) >= x0 && Math.log10(v) <= x1) : [0, 1, 2, 3, 4].map(i => x0 + (x1 - x0) * i / 4);
  ticks.forEach(v => { const xx = logX ? m.l + (Math.log10(v) - x0) / (x1 - x0) * (W - m.l - m.r) : X(v); g += `<line class="gl" x1="${xx}" x2="${xx}" y1="${m.t}" y2="${H - m.b}"/><text x="${xx}" y="${H - m.b + 16}" text-anchor="middle">${fx(v)}</text>`; });
  g += `<line class="ax" x1="${m.l}" x2="${W - m.r}" y1="${H - m.b}" y2="${H - m.b}"/><text x="${(W + m.l) / 2}" y="${H - 6}" text-anchor="middle">${esc(xl)}</text><text transform="translate(12 ${(H - m.b) / 2}) rotate(-90)" text-anchor="middle">${esc(yl)}</text>`;
  const top = new Set([...pts].sort((a, b) => b.y - a.y).slice(0, label).map(p => p.id));
  const placed = [];
  pts.forEach((p, i) => { g += `<circle class="dot${top.has(p.id) ? ' hl' : ''}" data-i="${i}" cx="${X(p.x)}" cy="${Y(p.y)}" r="${top.has(p.id) ? 5.5 : 4.5}" tabindex="0" aria-label="${esc(p.l)}"/>`;
    if (top.has(p.id)) { const lx = X(p.x) + 7, ly = Y(p.y) + 3, short = p.l.replace(/\s*\(.*$/, '');
      if (!placed.some(q => Math.abs(q[1] - ly) < 12 && Math.abs(q[0] - lx) < 150)) { placed.push([lx, ly]); g += `<text class="lbl" x="${lx}" y="${ly}">${esc(short)}</text>`; } } });
  el.innerHTML = g + '</svg>';
  const on = e => { const c = e.target.closest('circle'); if (!c) return; const p = pts[c.dataset.i]; showTip(e, tipf ? tipf(p) : `<b>${esc(p.l)}</b>${esc(p.s || '')}<br>${esc(xl)}: ${fx(p.x)}<br>${esc(yl)}: ${fy(p.y)}`); };
  el.onmousemove = on; el.onmouseleave = hideTip; el.onfocusin = on; el.onfocusout = hideTip;
}
function table(el, cols, rows, state, rerender) {
  // cols: [{k,l,num,f,sort}] ; state: {sort,dir}
  el.innerHTML = `<table><thead><tr>${cols.map(c => `<th class="${c.num ? 'num ' : ''}${c.sort !== false ? 'sort' : ''}" ${c.sort !== false ? `tabindex="0" data-k="${c.k}"` : ''} ${state && state.sort === c.k ? `aria-sort="${state.dir > 0 ? 'ascending' : 'descending'}"` : ''}>${esc(c.l)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${cols.map(c => `<td class="${c.num ? 'num' : ''}">${c.f ? c.f(r) : esc(r[c.k] ?? '-')}</td>`).join('')}</tr>`).join('') || `<tr><td colspan="${cols.length}" class="muted">Nothing to show.</td></tr>`}</tbody></table>`;
  if (state) el.querySelectorAll('th.sort').forEach(th => { const go = () => { const k = th.dataset.k; state.dir = state.sort === k ? -state.dir : (cols.find(c => c.k === k).num ? -1 : 1); state.sort = k; rerender(); };
    th.onclick = go; th.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } }; });
}

// ---------- tabs ----------
const TABS = ['performance', 'economics', 'calendars', 'tools'], drawn = {};
function showTab(t, focus) { if (!TABS.includes(t)) t = 'performance';
  TABS.forEach(x => { const b = $('#tab-' + x); b.setAttribute('aria-selected', x === t); b.tabIndex = x === t ? 0 : -1; $('#' + x).hidden = x !== t; });
  if (focus) $('#tab-' + t).focus();
  if (!drawn[t]) { drawn[t] = true; ({performance: perf, economics: econ, calendars: cals, tools})[t](); } else (redraw[t] || (() => {}))(); }
const redraw = {};
document.querySelector('.tabs').addEventListener('click', e => { const b = e.target.closest('button'); if (b) location.hash = b.dataset.tab; });
document.querySelector('.tabs').addEventListener('keydown', e => { const i = TABS.findIndex(t => $('#tab-' + t) === document.activeElement); if (i < 0) return;
  const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (d) { e.preventDefault(); location.hash = TABS[(i + d + 4) % 4]; setTimeout(() => $('#tab-' + location.hash.slice(1)).focus()); } });
addEventListener('hashchange', () => showTab(location.hash.slice(1)));

// ---------- Performance ----------
function perf() {
  const caps = D.key.filter(k => k.metric !== SPEED());
  let metric = caps[0].metric, vend = [];
  const vendors = [...new Set(Object.keys(VAL[metric] || {}).map(VEND))];
  const allV = [...new Set(caps.flatMap(c => Object.keys(VAL[c.metric] || {}).map(VEND)))].sort().map(v => ({v, l: v}));
  const draw = () => { const n = +$('#lbN').value, priced = $('#lbPriced').checked, mt = D.metrics[metric];
    const rows = Object.entries(VAL[metric] || {}).filter(([id]) => (!priced || price(id)) && (!vend.length || vend.includes(VEND(id))))
      .map(([id, v]) => ({id, l: NAME(id), v, vendor: VEND(id)})).sort((a, b) => mt.hib ? b.v - a.v : a.v - b.v).slice(0, n);
    bars($('#lb'), rows, {sub: r => r.vendor, fmtV: v => fmt(v, v > 100 ? 0 : 1)}); };
  seg($('#lbMetric'), caps.map(k => ({v: k.metric, l: k.label})), metric, v => { metric = +v; draw(); });
  range($('#lbN'), $('#lbNOut'), v => v, draw); $('#lbPriced').onchange = draw;
  combo($('#lbVendors'), allV, {onChange: s => { vend = s; draw(); }});
  draw();
  const capSpeed = () => { const pts = Object.entries(VAL[II()] || {}).filter(([id]) => score(SPEED(), id) != null)
    .map(([id, y]) => ({id, y, x: score(SPEED(), id), l: NAME(id), s: ' · ' + VEND(id)}));
    scatter($('#capSpeed'), pts, {xl: 'Output tokens per second (log)', yl: 'Intelligence Index', logX: true, label: 8, h: 340, fx: v => fmt(v, 0)}); };
  capSpeed(); redraw.performance = capSpeed;
  let dir = 'all';
  const mv = () => { let r = D.movers.filter(m => D.metrics[m.metric]).map(m => { const hib = D.metrics[m.metric].hib; const d = m.to - m.from; return {...m, d, good: hib ? d > 0 : d < 0}; });
    if (dir !== 'all') r = r.filter(m => (dir === 'up') === m.good);
    table($('#movers'), [{k: 'model', l: 'Model', f: m => `${esc(NAME(m.model))}<br><small class="muted">${esc(VEND(m.model))}</small>`},
      {k: 'metric', l: 'Metric', f: m => esc(D.metrics[m.metric].label)},
      {k: 'from', l: 'Change', num: 1, f: m => `${fmt(m.from, 2)} &rarr; <b>${fmt(m.to, 2)}</b> <span class="${m.good ? 'up' : 'down'}">${m.d > 0 ? '+' : ''}${fmt(m.d, 2)}</span>`},
      {k: 'to_at', l: 'Date', f: m => dlabel(m.to_at)}], r.slice(0, 14)); };
  seg($('#mvDir'), [{v: 'all', l: 'All'}, {v: 'up', l: 'Improved'}, {v: 'down', l: 'Declined'}], dir, v => { dir = v; mv(); });
  mv();
}

// ---------- Economics ----------
function econ() {
  let basis = 'blend';
  const pc = () => { const pts = Object.entries(VAL[II()] || {}).filter(([id]) => price(id, basis) > 0)
    .map(([id, y]) => ({id, y, x: price(id, basis), l: NAME(id), s: ' · ' + VEND(id)}));
    scatter($('#priceCap'), pts, {xl: `USD per 1M tokens (${basis === 'blend' ? 'blended' : basis})`, yl: 'Intelligence Index', logX: $('#pvLog').checked, label: 12, h: 420, fx: v => '$' + (v < 1 ? v.toFixed(2) : fmt(v, 0))}); };
  seg($('#pvPrice'), [{v: 'blend', l: 'Blended'}, {v: 'input', l: 'Input'}, {v: 'output', l: 'Output'}], basis, v => { basis = v; pc(); });
  $('#pvLog').onchange = pc; pc(); redraw.economics = pc;
  const tiers = [[50, 100, 'Frontier', '50+'], [40, 50, 'High', '40 to 50'], [30, 40, 'Mid', '30 to 40'], [20, 30, 'Light', '20 to 30'], [0, 20, 'Basic', 'under 20']];
  $('#tiers').innerHTML = '<p class="note">Lowest blended price per 1M tokens within each Intelligence Index band.</p>' + tiers.map(([lo, hi, n, r]) => {
    const rows = Object.entries(VAL[II()] || {}).filter(([id, v]) => v >= lo && v < hi && price(id) != null && price(id) > 0).sort((a, b) => price(a[0]) - price(b[0])).slice(0, 3);
    return `<div class="tier"><h3>${n}<small>Index ${r}</small></h3><ol>${rows.length ? rows.map(([id, v]) => `<li><span>${esc(NAME(id))} <small class="muted">${fmt(v, 1)}</small></span><b>${usd(price(id))}</b></li>`).join('') : '<li class="muted">No priced models</li>'}</ol></div>`; }).join('');
  table($('#gaps'), [{k: 'model', l: 'Model', f: g => esc(NAME(g.model))}, {k: 'unit', l: 'Type'},
    {k: 'list', l: 'List', num: 1, f: g => usd(g.list.usd)}, {k: 'market', l: 'Market', num: 1, f: g => usd(g.market.usd)},
    {k: 'd', l: 'Gap', num: 1, f: g => { const d = g.market.usd - g.list.usd; return `<span class="${d > 0 ? 'down' : 'up'}">${d > 0 ? '+' : ''}${usd(d).replace('$-', '-$')}</span>`; }}], D.price_gaps);
  // price history
  const priced = Object.keys(D.price_obs).map(id => ({v: id, l: NAME(id), s: VEND(id)})).sort((a, b) => a.l.localeCompare(b.l));
  const ph = sel => { const el = $('#priceHist'); if (!sel) { // aggregate view
      const by = {}; D.price_timeline.forEach(t => { by[t.at] = by[t.at] || {list: 0, market: 0}; by[t.at][t.kind] += t.n; });
      const ks = Object.keys(by).sort(), mx = Math.max(...ks.map(k => by[k].list + by[k].market)); const W = Math.max(320, el.clientWidth || 600), H = 240, bw = (W - 60) / ks.length;
      let g = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Price checks by date">`;
      ks.forEach((k, i) => { const x = 40 + i * bw, hl = by[k].list / mx * 180, hm = by[k].market / mx * 180;
        g += `<rect x="${x + bw * .15}" y="${200 - hl - hm}" width="${bw * .7}" height="${hm}" rx="3" fill="#7FA6D6" data-t="${k}|${by[k].market} market checks"/><rect x="${x + bw * .15}" y="${200 - hl}" width="${bw * .7}" height="${hl}" rx="3" fill="#0F2742" data-t="${k}|${by[k].list} list prices"/><text x="${x + bw / 2}" y="218" text-anchor="middle">${dlabel(k).replace(/, \d+$/, '')}</text>`; });
      el.innerHTML = g + `<text x="40" y="236">Navy: list prices recorded. Light: market price checks.</text></svg>`;
      el.onmousemove = e => { const t = e.target.dataset?.t; if (t) { const [a, b] = t.split('|'); showTip(e, `<b>${dlabel(a)}</b>${b}`); } else hideTip(); }; el.onmouseleave = hideTip; return; }
    const obs = D.price_obs[sel]; const rows = [];
    Object.entries(obs).forEach(([u, list]) => list.forEach(o => rows.push({u, ...o})));
    rows.sort((a, b) => a.at.localeCompare(b.at));
    el.innerHTML = `<div class="tbl-wrap"></div>`;
    table(el.firstChild, [{k: 'at', l: 'Date', f: r => dlabel(r.at)}, {k: 'u', l: 'Token type', f: r => esc(r.u.replace('_', ' '))}, {k: 'list', l: 'Kind', f: r => `<span class="pill ${r.list ? 'rel' : ''}">${r.list ? 'List' : 'Market'}</span>`}, {k: 'usd', l: 'USD per 1M', num: 1, f: r => usd(r.usd)}], rows); };
  combo($('#phModel'), priced, {single: true, onChange: s => ph(s[0])}); ph();
}

// ---------- Calendars ----------
function cals() {
  const today = new Date(), iso = d => d.toISOString().slice(0, 10), tISO = D.updated || iso(today);
  let cur = new Date(+tISO.slice(0, 4), +tISO.slice(5, 7) - 1, 1);
  const ev = [];
  D.lifecycle.forEach(r => { if (r.release && r.release.length === 10) ev.push({d: r.release, k: 'rel', l: r.name, s: r.vendor}); if (r.retire) ev.push({d: r.retire, k: 'ret', l: r.name, s: r.vendor}); });
  const firsts = Object.values(D.models).filter(m => m.first).map(m => ({d: m.first, k: 'new', l: m.name, s: m.vendor}));
  const drawCal = () => { const showNew = $('#calNew').checked, all = showNew ? ev.concat(firsts) : ev, by = {};
    all.forEach(e => (by[e.d] = by[e.d] || []).push(e));
    const y = cur.getFullYear(), mo = cur.getMonth(); $('#calTitle').textContent = `${['January','February','March','April','May','June','July','August','September','October','November','December'][mo]} ${y}`;
    const start = new Date(y, mo, 1 - new Date(y, mo, 1).getDay()); let h = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => `<div class="dow">${d}</div>`).join('');
    for (let i = 0; i < 42; i++) { const d = new Date(start); d.setDate(start.getDate() + i); const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const es = (by[k] || []).sort((a, b) => (a.k > b.k ? 1 : -1)); const vis = es.slice(0, 3);
      h += `<div class="d${d.getMonth() !== mo ? ' out' : ''}${k === tISO ? ' today' : ''}"><span class="n">${d.getDate()}</span>${vis.map(e => `<span class="ev ${e.k}" tabindex="0" data-t="${esc(e.l)}|${esc(e.s)}|${e.k}|${k}">${esc(e.l)}</span>`).join('')}${es.length > 3 ? `<span class="ev more" tabindex="0" data-t="${esc(es.slice(3).map(e => e.l).join(', '))}||more|${k}">+${es.length - 3} more</span>` : ''}</div>`;
      if (i === 34 && new Date(start.getTime() + 35 * 864e5).getMonth() !== mo) break; }
    $('#cal').innerHTML = h; };
  const tipOn = e => { const t = e.target.dataset?.t; if (!t) return; const [l, s, k, d] = t.split('|');
    showTip(e, `<b>${l}</b>${s ? s + '<br>' : ''}${{rel: 'Released', ret: 'Retires', new: 'First tracked', more: ''}[k]} ${dlabel(d)}`); };
  $('#cal').onmouseover = tipOn; $('#cal').onfocusin = tipOn; $('#cal').onmouseleave = hideTip; $('#cal').onfocusout = hideTip;
  $('#calPrev').onclick = () => { cur.setMonth(cur.getMonth() - 1); drawCal(); }; $('#calNext').onclick = () => { cur.setMonth(cur.getMonth() + 1); drawCal(); };
  $('#calToday').onclick = () => { cur = new Date(+tISO.slice(0, 4), +tISO.slice(5, 7) - 1, 1); drawCal(); }; $('#calNew').onchange = drawCal;
  drawCal();
  const ret = D.lifecycle.filter(r => r.retire).sort((a, b) => b.retire.localeCompare(a.retire));
  const up = ret.filter(r => r.retire >= tISO), past = ret.filter(r => r.retire < tISO);
  const row = r => { const days = Math.round((new Date(r.retire) - new Date(tISO)) / 864e5);
    return `<div class="rrow"><span>${esc(r.name)}<small>${esc(r.vendor)}</small></span><span style="text-align:right">${dlabel(r.retire)}<br>${days > 0 ? `<span class="pill soon">in ${days} days</span>` : days === 0 ? '<span class="pill ret">today</span>' : `<span class="pill">${-days} days ago</span>`}</span></div>`; };
  $('#retire').innerHTML = `<h3 class="note" style="margin-top:0">Upcoming</h3><div class="rlist">${up.reverse().map(row).join('') || '<p class="empty">None announced.</p>'}</div><h3 class="note">Recently retired</h3><div class="rlist">${past.slice(0, 8).map(row).join('')}</div>`;
  $('#lifeNote').textContent = `Retirement dates appear only once a vendor announces one, so this list is short by design. Release dates are on file for ${D.lifecycle.filter(r => r.release).length} models.`;
  let rng = '24';
  const tl = () => { const el = $('#timeline'), months = {}, end = tISO.slice(0, 7);
    const lim = rng === 'all' ? '0000' : (() => { const d = new Date(+end.slice(0, 4), +end.slice(5, 7) - 1 - (+rng - 1), 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; })();
    D.lifecycle.filter(r => r.release && r.release.slice(0, 7) >= lim).forEach(r => (months[r.release.slice(0, 7)] = months[r.release.slice(0, 7)] || []).push(r));
    D.lifecycle.filter(r => r.retire && r.retire.slice(0, 7) >= lim).forEach(r => (months[r.retire.slice(0, 7)] = months[r.retire.slice(0, 7)] || []).push({...r, _ret: 1}));
    const ks = Object.keys(months).sort(); if (!ks.length) { el.innerHTML = '<p class="empty">No dated events in this range.</p>'; return; }
    const first = ks[0], seq = []; let d = new Date(+first.slice(0, 4), +first.slice(5) - 1, 1);
    const last = ks[ks.length - 1] > end ? ks[ks.length - 1] : end;
    while (true) { const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; seq.push(k); if (k >= last) break; d.setMonth(d.getMonth() + 1); }
    const W = Math.max(320, el.clientWidth || 800), H = 250, bw = (W - 40) / seq.length, mx = Math.max(...seq.map(k => Math.max((months[k] || []).filter(r => !r._ret).length, (months[k] || []).filter(r => r._ret).length))) || 1;
    let g = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Releases and retirements by month"><line class="ax" x1="20" x2="${W - 20}" y1="125" y2="125"/>`;
    seq.forEach((k, i) => { const x = 20 + i * bw, rel = (months[k] || []).filter(r => !r._ret), ret = (months[k] || []).filter(r => r._ret);
      const hr = rel.length / mx * 95, ht = ret.length / mx * 95;
      if (rel.length) g += `<rect x="${x + bw * .18}" y="${125 - hr}" width="${bw * .64}" height="${hr}" rx="3" fill="#2F6FD6" tabindex="0" data-t="${k}|Released: ${esc(rel.map(r => r.name).join(', '))}"/>`;
      if (ret.length) g += `<rect x="${x + bw * .18}" y="126" width="${bw * .64}" height="${ht}" rx="3" fill="#D9534F" tabindex="0" data-t="${k}|Retiring: ${esc(ret.map(r => r.name).join(', '))}"/>`;
      if (k === end) g += `<line x1="${x + bw / 2}" x2="${x + bw / 2}" y1="15" y2="235" stroke="#0F2742" stroke-dasharray="3 3"/><text x="${x + bw / 2}" y="12" text-anchor="middle" style="fill:#0F2742;font-weight:700">Now</text>`;
      if (seq.length <= 14 || i % Math.ceil(seq.length / 12) === 0) g += `<text x="${x + bw / 2}" y="${H - 4}" text-anchor="middle">${MON[+k.slice(5) - 1]} ${k.slice(2, 4)}</text>`; });
    el.innerHTML = g + `<text x="20" y="28">Releases above the line, retirements below</text></svg>`;
    const on = e => { const t = e.target.dataset?.t; if (t) { const [a, b] = t.split('|'); showTip(e, `<b>${dlabel(a)}</b>${b}`); } };
    el.onmouseover = on; el.onfocusin = on; el.onmouseout = hideTip; el.onfocusout = hideTip; };
  seg($('#tlRange'), [{v: '12', l: '12 mo'}, {v: '24', l: '24 mo'}, {v: 'all', l: 'All'}], rng, v => { rng = v; tl(); });
  tl(); redraw.calendars = tl;
}

// ---------- Tools ----------
function tools() {
  const priced = Object.keys(D.prices).filter(id => price(id) != null).map(id => ({v: id, l: NAME(id), s: VEND(id)})).sort((a, b) => a.l.localeCompare(b.l));
  const defaults = Object.entries(VAL[II()] || {}).filter(([id]) => price(id) > 0).sort((a, b) => b[1] - a[1]).slice(0, 5).map(x => x[0]);
  const tokScale = v => v === 0 ? 0 : Math.round(Math.pow(10, v / 20) * 1e5) * 10; // 0..100 -> ~1M..10B
  const tokF = n => n >= 1e9 ? fmt(n / 1e9, 1) + 'B' : n >= 1e6 ? fmt(n / 1e6, 1) + 'M' : fmt(n / 1e3, 0) + 'K';
  let ccSel = defaults;
  const calc = () => { const tin = tokScale(+$('#ccIn').value), tout = tokScale(+$('#ccOut').value), cache = +$('#ccCache').value / 100;
    const rows = ccSel.map(id => { const p = D.prices[id]; const cr = p.cache_read ? p.cache_read.usd : p.input.usd;
      const c = (tin * (1 - cache) * p.input.usd + tin * cache * cr + tout * p.output.usd) / 1e6; return {id, l: NAME(id), v: c, vendor: VEND(id)}; }).sort((a, b) => a.v - b.v);
    bars($('#ccResult'), rows, {fmtV: money, sub: r => r.vendor, rank: false});
    if (!rows.length) $('#ccResult').innerHTML = '<p class="empty">Add a model to estimate monthly cost.</p>'; };
  range($('#ccIn'), $('#ccInOut'), v => tokF(tokScale(v)), calc); range($('#ccOut'), $('#ccOutOut'), v => tokF(tokScale(v)), calc); range($('#ccCache'), $('#ccCacheOut'), v => v + '%', calc);
  combo($('#ccModels'), priced, {selected: defaults, max: 12, onChange: s => { ccSel = s; calc(); }}); calc();
  // compare
  const allItems = Object.values(D.models).map(m => ({v: m.id, l: m.name, s: m.vendor})).sort((a, b) => a.l.localeCompare(b.l));
  const cmp = sel => { if (sel.length < 2) { $('#compare').innerHTML = '<p class="empty">Pick at least two models to compare side by side.</p>'; return; }
    const rows = [['Vendor', id => esc(VEND(id))], ['Released', id => dlabel(D.models[id].release)], ['First tracked', id => dlabel(D.models[id].first)], ['Retires', id => D.models[id].retire ? dlabel(D.models[id].retire) : '-'],
      ['Context window', id => D.models[id].ctx ? fmt(D.models[id].ctx, 0) : '-'], ['Input / 1M', id => usd(price(id, 'input'))], ['Output / 1M', id => usd(price(id, 'output'))],
      ...D.key.map(k => [k.label, id => fmt(score(k.metric, id), 1), k.metric]), ['Scores on file', id => Object.keys(VAL).filter(m => VAL[m][id] != null).length]];
    $('#compare').innerHTML = `<table><thead><tr><th></th>${sel.map(id => `<th>${esc(NAME(id))}</th>`).join('')}</tr></thead><tbody>${rows.map(([l, f, mid]) => {
      let best = null; if (mid) { const vs = sel.map(id => score(mid, id)).filter(v => v != null); if (vs.length > 1) best = D.metrics[mid].hib ? Math.max(...vs) : Math.min(...vs); }
      return `<tr><td class="muted">${esc(l)}</td>${sel.map(id => `<td${best != null && score(mid, id) === best ? ' class="up"' : ''}>${f(id)}</td>`).join('')}</tr>`; }).join('')}</tbody></table>`; };
  const cdef = defaults.slice(0, 3); combo($('#cmpModels'), allItems, {selected: cdef, max: 4, onChange: cmp}); cmp(cdef);
  // table
  const st = {sort: 'ii', dir: -1, page: 0}; let vend = [];
  const base = Object.values(D.models).map(m => ({id: m.id, name: m.name, vendor: m.vendor, ii: score(II(), m.id), sp: score(SPEED(), m.id), pin: price(m.id, 'input'), pout: price(m.id, 'output'),
    n: 0, release: m.release || '', first: m.first || ''}));
  const cnt = {}; Object.values(VAL).forEach(o => Object.keys(o).forEach(id => cnt[id] = (cnt[id] || 0) + 1)); base.forEach(r => r.n = cnt[r.id] || 0);
  combo($('#mtVendors'), [...new Set(base.map(r => r.vendor))].sort().map(v => ({v, l: v})), {onChange: s => { vend = s; st.page = 0; mt(); }});
  const PER = 25;
  const mt = () => { const q = $('#mtSearch').value.trim().toLowerCase(), pr = $('#mtPriced').checked, sc = $('#mtScored').checked;
    let r = base.filter(x => (!q || (x.name + ' ' + x.vendor + ' ' + x.id).toLowerCase().includes(q)) && (!vend.length || vend.includes(x.vendor)) && (!pr || x.pin != null) && (!sc || x.n > 0));
    r.sort((a, b) => { const A = a[st.sort], B = b[st.sort]; if (A == null || A === '') return 1; if (B == null || B === '') return -1; return (A > B ? 1 : A < B ? -1 : 0) * st.dir; });
    const pages = Math.max(1, Math.ceil(r.length / PER)); st.page = Math.min(st.page, pages - 1);
    $('#mtCount').textContent = `${fmt(r.length, 0)} models`; $('#mtPage').textContent = `Page ${st.page + 1} of ${pages}`; $('#mtPrev').disabled = st.page === 0; $('#mtNext').disabled = st.page >= pages - 1;
    table($('#mtable'), [{k: 'name', l: 'Model', f: x => `<b>${esc(x.name)}</b>`}, {k: 'vendor', l: 'Vendor'}, {k: 'ii', l: 'Intelligence', num: 1, f: x => fmt(x.ii, 1)},
      {k: 'sp', l: 'Tokens/s', num: 1, f: x => fmt(x.sp, 0)}, {k: 'pin', l: 'Input $/1M', num: 1, f: x => usd(x.pin)}, {k: 'pout', l: 'Output $/1M', num: 1, f: x => usd(x.pout)},
      {k: 'n', l: 'Scores', num: 1}, {k: 'release', l: 'Released', f: x => x.release ? dlabel(x.release) : '<span class="muted">-</span>'}, {k: 'first', l: 'First tracked', f: x => dlabel(x.first)}],
      r.slice(st.page * PER, st.page * PER + PER), st, mt); };
  $('#mtSearch').oninput = () => { st.page = 0; mt(); }; $('#mtPriced').onchange = $('#mtScored').onchange = () => { st.page = 0; mt(); };
  $('#mtPrev').onclick = () => { st.page--; mt(); }; $('#mtNext').onclick = () => { st.page++; mt(); };
  mt();
}

// ---------- boot ----------
fetch('data/dashboard.json').then(r => r.json()).then(d => {
  D = d;
  Object.entries(D.latest).forEach(([mid, rows]) => { VAL[mid] = {}; rows.forEach(([id, v]) => { if (D.models[id]) VAL[mid][id] = v; }); });
  const c = D.counts;
  $('#counts').innerHTML = [[c.models, 'models'], [c.vendors, 'vendors'], [c.metrics, 'metrics'], [c.priced, 'priced'], [c.price_changes, 'list price changes'],
    [c.gaps, 'list vs market gaps'], [c.movers, 'score movers'], [c.new_week, 'first tracked this week'], [c.retiring, 'upcoming retirements']]
    .map(([n, l]) => `<div><b>${fmt(n, 0)}</b><span>${l}</span></div>`).join('');
  $('#updated').textContent = 'Updated ' + dlabel(D.updated);
  $('#built').textContent = 'Data refreshed ' + dlabel(D.updated);
  showTab(location.hash.slice(1) || 'performance');
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => (redraw[location.hash.slice(1) || 'performance'] || (() => {}))(), 150); });
}).catch(e => { $('main').innerHTML = '<p class="empty">The dashboard data could not be loaded.</p>'; console.error(e); });
})();
