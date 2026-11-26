// NusaStat charts: small, dependency-free SVG line and bar charts.
// Every chart is drawn from the numbers in data.js, with labelled axes,
// gridlines and the value printed on each point, so it reads at a glance
// even when shrunk to a contact-sheet cell.

function niceTicks(min, max, count) {
  const span = max - min || 1;
  const step = span / count;
  const mag = Math.pow(10, Math.floor(Math.log10(step)));
  const norm = step / mag;
  const nice = norm < 1.5 ? 1 : norm < 3.5 ? 2 : norm < 7.5 ? 5 : 10;
  const size = nice * mag;
  const start = Math.floor(min / size) * size;
  const ticks = [];
  for (let v = start; v <= max + size * 0.001; v += size) ticks.push(v);
  return { ticks, size };
}

function fmtTick(v) {
  if (Math.abs(v) >= 1000) return Math.round(v).toLocaleString("en-US");
  if (Number.isInteger(v)) return String(v);
  return String(Math.round(v * 100) / 100);
}

function svgOpen(w, h, label) {
  // No xmlns: these SVGs are injected inline into the HTML page, where the
  // parser already knows the namespace, so the markup names no URL at all.
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" role="img" aria-label="${label}" ` +
    `font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif">`;
}

export function lineChart(ind, years, opts = {}) {
  const w = opts.width || 720;
  const h = opts.height || 300;
  const padL = 58, padR = 14, padT = 26, padB = 34;
  const pts = years.map((y, i) => ({ y, v: ind.series[i] })).filter((p) => p.v !== null);
  const vals = pts.map((p) => p.v);
  let min = Math.min(...vals), max = Math.max(...vals);
  // Keep the axis honest but readable: when values sit far above zero,
  // start the axis just below the lowest point instead of at zero, so
  // the slope is visible; otherwise start at zero (or below, for negatives).
  if (min > 0 && min / max > 0.7) min = Math.floor(min * 0.92);
  else if (min > 0) min = 0;
  else min = Math.min(min * 1.08, 0);
  if (max < 0) max = 0;
  const { ticks } = niceTicks(min, max, 4);
  min = Math.min(min, ticks[0]);
  max = Math.max(max, ticks[ticks.length - 1]);
  const x = (i) => padL + (i * (w - padL - padR)) / (years.length - 1);
  const y = (v) => padT + (1 - (v - min) / (max - min)) * (h - padT - padB);
  let s = svgOpen(w, h, `${ind.name} 2020 to 2024`);
  s += `<rect x="0" y="0" width="${w}" height="${h}" fill="#ffffff"/>`;
  for (const t of ticks) {
    s += `<line x1="${padL}" y1="${y(t)}" x2="${w - padR}" y2="${y(t)}" stroke="#e3e0d8" stroke-width="1"/>` +
      `<text x="${padL - 8}" y="${y(t) + 4}" text-anchor="end" font-size="12" fill="#6b7280">${fmtTick(t)}</text>`;
  }
  for (let i = 0; i < years.length; i++) {
    s += `<text x="${x(i)}" y="${h - 10}" text-anchor="middle" font-size="12" fill="#6b7280">${years[i]}</text>`;
  }
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${x(years.indexOf(p.y)).toFixed(1)},${y(p.v).toFixed(1)}`).join(" ");
  s += `<path d="${line}" fill="none" stroke="#0f766e" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>`;
  for (const p of pts) {
    const xi = x(years.indexOf(p.y));
    s += `<circle cx="${xi}" cy="${y(p.v)}" r="5" fill="#0f766e" stroke="#ffffff" stroke-width="2"/>` +
      `<text x="${xi}" y="${y(p.v) - 11}" text-anchor="middle" font-size="12" font-weight="700" fill="#10263b">${fmtTick(p.v)}</text>`;
  }
  s += "</svg>";
  return s;
}

export function barChart(ind, years, opts = {}) {
  const w = opts.width || 720;
  const h = opts.height || 300;
  const padL = 58, padR = 14, padT = 26, padB = 34;
  const vals = ind.series.map((v) => (v === null ? 0 : v));
  let min = Math.min(0, ...vals), max = Math.max(...vals);
  const { ticks } = niceTicks(min, max, 4);
  min = Math.min(min, ticks[0]);
  max = Math.max(max, ticks[ticks.length - 1]);
  const slot = (w - padL - padR) / years.length;
  const barW = Math.min(64, slot * 0.6);
  const y = (v) => padT + (1 - (v - min) / (max - min)) * (h - padT - padB);
  let s = svgOpen(w, h, `${ind.name} 2020 to 2024`);
  s += `<rect x="0" y="0" width="${w}" height="${h}" fill="#ffffff"/>`;
  for (const t of ticks) {
    s += `<line x1="${padL}" y1="${y(t)}" x2="${w - padR}" y2="${y(t)}" stroke="#e3e0d8" stroke-width="1"/>` +
      `<text x="${padL - 8}" y="${y(t) + 4}" text-anchor="end" font-size="12" fill="#6b7280">${fmtTick(t)}</text>`;
  }
  s += `<line x1="${padL}" y1="${y(0)}" x2="${w - padR}" y2="${y(0)}" stroke="#9ca3af" stroke-width="1"/>`;
  years.forEach((yr, i) => {
    const v = ind.series[i];
    const cx = padL + slot * i + slot / 2;
    if (v === null) {
      s += `<text x="${cx}" y="${h - 10}" text-anchor="middle" font-size="12" fill="#6b7280">${yr}</text>`;
      return;
    }
    const top = y(Math.max(v, 0)), bot = y(Math.min(v, 0));
    const color = v < 0 ? "#b45309" : "#0f766e";
    s += `<rect x="${(cx - barW / 2).toFixed(1)}" y="${top.toFixed(1)}" width="${barW}" height="${Math.max(1, bot - top).toFixed(1)}" rx="3" fill="${color}"/>` +
      `<text x="${cx}" y="${(v < 0 ? bot + 16 : top - 8).toFixed(1)}" text-anchor="middle" font-size="12" font-weight="700" fill="#10263b">${fmtTick(v)}</text>` +
      `<text x="${cx}" y="${h - 10}" text-anchor="middle" font-size="12" fill="#6b7280">${yr}</text>`;
  });
  s += "</svg>";
  return s;
}

// Horizontal share bars for a part-to-whole breakdown (sectors, provinces).
export function shareBars(rows, valueKey, labelKey, unit) {
  const w = 720;
  const rowH = 34;
  const h = 30 + rows.length * rowH;
  const max = Math.max(...rows.map((r) => r[valueKey]));
  let s = svgOpen(w, h, "Share breakdown");
  s += `<rect x="0" y="0" width="${w}" height="${h}" fill="#ffffff"/>`;
  rows.forEach((r, i) => {
    const yTop = 14 + i * rowH;
    const bw = ((w - 330) * r[valueKey]) / max;
    s += `<text x="0" y="${yTop + 13}" font-size="13" fill="#10263b">${r[labelKey]}</text>` +
      `<rect x="250" y="${yTop}" width="${Math.max(2, bw).toFixed(1)}" height="18" rx="3" fill="${i === 0 ? "#0f766e" : "#2a9d8f"}"/>` +
      `<text x="${(258 + bw).toFixed(1)}" y="${yTop + 14}" font-size="13" font-weight="700" fill="#10263b">${r[valueKey]}${unit}</text>`;
  });
  s += "</svg>";
  return s;
}
