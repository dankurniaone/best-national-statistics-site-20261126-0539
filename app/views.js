// NusaStat views: one renderer per page. Every page is built from data.js,
// so the numbers on screen, in the charts and in the CSV download always agree.

import { YEARS, SECTIONS, INDICATORS, HEADLINES, RELEASES, SECTORS_2024, PROVINCES_2024, indicatorsOf, indicatorById, formatValue } from "./data.js";
import { lineChart, barChart, shareBars } from "./charts.js";

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function sourceLine(ind) {
  return `<p class="source">Source: ${esc(ind.source)} · ${ind.year}${ind.note ? ` — ${esc(ind.note)}` : ""}</p>`;
}

function keyFigure(ind) {
  const prev = ind.series[3];
  let delta = "";
  if (prev !== null && prev !== undefined) {
    // Rates move in percentage points; levels move in percent. Say which.
    if (ind.unit.startsWith("%")) {
      const pts = ind.value - prev;
      delta = `<span class="delta">${pts >= 0 ? "+" : ""}${pts.toFixed(2)} pts vs ${YEARS[3]}</span>`;
    } else {
      const pct = ((ind.value - prev) / Math.abs(prev)) * 100;
      delta = `<span class="delta">${pct >= 0 ? "+" : ""}${pct.toFixed(1)}% vs ${YEARS[3]}</span>`;
    }
  }
  return `<article class="stat-card">
    <p class="stat-label">${esc(ind.name)}</p>
    <p class="stat-value">${formatValue(ind, ind.value)} <span class="stat-unit">${esc(ind.unit)}</span></p>
    <p class="stat-meta">${ind.year} · ${delta}</p>
  </article>`;
}

function dataTable(inds) {
  const head = `<tr><th data-sort="name">Indicator</th><th data-sort="value">Latest</th>${YEARS.map((y) => `<th data-sort="y${y}">${y}</th>`).join("")}<th>Source</th></tr>`;
  const rows = inds.map((ind) => {
    const cells = YEARS.map((y, i) => `<td>${ind.series[i] === null ? "—" : formatValue(ind, ind.series[i])}</td>`).join("");
    return `<tr><td>${esc(ind.name)} <span class="unit-inline">(${esc(ind.unit)})</span></td>` +
      `<td><strong>${formatValue(ind, ind.value)}</strong> <span class="unit-inline">${ind.year}</span></td>${cells}` +
      `<td class="src-cell">${esc(ind.source)}</td></tr>`;
  }).join("");
  return `<div class="table-wrap"><table class="data-table"><thead>${head}</thead><tbody>${rows}</tbody></table></div>
  <p class="hint">Click a column heading to sort the table.</p>`;
}

function csvButton(sectionId, label) {
  return `<button class="btn" data-csv="${sectionId}">Download ${esc(label)} as CSV</button>`;
}

function sectionPage(section, chartIndId, chartKind, extraHtml) {
  const inds = indicatorsOf(section.id);
  const chartInd = indicatorById(chartIndId);
  const chart = chartKind === "bar" ? barChart(chartInd, YEARS) : lineChart(chartInd, YEARS);
  const cards = inds.map(keyFigure).join("");
  return `<section class="page-head">
      <p class="kicker">${esc(section.label)}</p>
      <h1>${esc(section.label)} in Indonesia</h1>
      <p class="lede">${esc(section.blurb)}</p>
    </section>
    <div class="stat-grid">${cards}</div>
    <section class="panel">
      <h2>${esc(chartInd.name)}, ${YEARS[0]}–${YEARS[YEARS.length - 1]} <span class="unit-inline">(${esc(chartInd.unit)})</span></h2>
      <div class="chart">${chart}</div>
      ${sourceLine(chartInd)}
    </section>
    ${extraHtml || ""}
    <section class="panel">
      <h2>All ${esc(section.label.toLowerCase())} indicators</h2>
      ${dataTable(inds)}
      <p>${csvButton(section.id, section.label + " data")}</p>
    </section>`;
}

export function homeView() {
  const cards = HEADLINES.map((h) => keyFigure(indicatorById(h.id))).join("");
  const releases = RELEASES.map((r) =>
    `<li><span class="rel-date">${esc(r.date)}</span><span class="rel-title">${esc(r.title)}</span><span class="rel-src">${esc(r.source)}</span></li>`).join("");
  const index = SECTIONS.map((s) =>
    `<li><a href="#/${s.id}">${esc(s.label)}</a><span>${esc(s.blurb)}</span></li>`).join("");
  const pop = indicatorById("population");
  const gdp = indicatorById("gdp-growth");
  return `<section class="hero">
      <p class="kicker">NusaStat · Statistik Indonesia · Updated November 2026</p>
      <h1>Indonesia in numbers.</h1>
      <p class="lede">The country's population, economy, prices, jobs and poverty — real figures
      from BPS Statistics Indonesia and the World Bank, each with its source and year.
      No estimates of our own, no numbers without a name behind them.</p>
      <p><a class="btn primary" href="#/economy">Explore the economy</a>
      <a class="btn" href="#/sources">How the figures are made</a></p>
    </section>
    <div class="stat-grid">${cards}</div>
    <section class="panel">
      <h2>Population, 2020–2024 <span class="unit-inline">(million people)</span></h2>
      <div class="chart">${lineChart(pop, YEARS)}</div>
      ${sourceLine(pop)}
    </section>
    <section class="panel">
      <h2>Real GDP growth, 2020–2024 <span class="unit-inline">(% per year)</span></h2>
      <div class="chart">${barChart(gdp, YEARS)}</div>
      ${sourceLine(gdp)}
    </section>
    <div class="two-col">
      <section class="panel">
        <h2>Latest releases</h2>
        <ul class="releases">${releases}</ul>
      </section>
      <section class="panel">
        <h2>Find an indicator</h2>
        <p><input id="indicator-search" type="search" placeholder="Try “poverty”, “inflation”, “exports”…" aria-label="Search indicators"></p>
        <ul id="indicator-index" class="index">${index}</ul>
        <ul id="indicator-results" class="index"></ul>
      </section>
    </div>
    <section class="panel">
      <h2>Browse by topic</h2>
      <ul class="topics">${SECTIONS.map((s) => `<li><a href="#/${s.id}">${esc(s.label)}</a><span>${esc(s.blurb)}</span></li>`).join("")}</ul>
    </section>`;
}

export function populationView() {
  const extra = `<section class="panel">
      <h2>Age mix, 2024 <span class="unit-inline">(% of population)</span></h2>
      <div class="chart">${shareBars([
        { name: "Ages 0–14", share: 24.6 },
        { name: "Ages 15–64", share: 68.1 },
        { name: "Ages 65+", share: 7.3 },
      ], "share", "name", "%")}</div>
      <p class="source">Source: World Bank, World Development Indicators, 2024. Two in three Indonesians are of working age.</p>
    </section>`;
  return sectionPage(SECTIONS[0], "population", "line", extra);
}

export function economyView() {
  const extra = `<section class="panel">
      <h2>What the economy is made of, 2024 <span class="unit-inline">(% of GDP)</span></h2>
      <div class="chart">${shareBars(SECTORS_2024, "share", "name", "%")}</div>
      <p class="source">Source: BPS - Statistics Indonesia. Manufacturing is the largest single sector; the top five together make up about 62% of GDP.</p>
    </section>`;
  return sectionPage(SECTIONS[1], "gdp-growth", "bar", extra);
}

export function pricesView() {
  return sectionPage(SECTIONS[2], "inflation", "bar");
}

export function labourView() {
  return sectionPage(SECTIONS[3], "unemployment", "line");
}

export function welfareView() {
  return sectionPage(SECTIONS[4], "poverty", "line");
}

export function provincesView() {
  const rows = PROVINCES_2024.map((p) =>
    `<tr><td>${esc(p.name)}</td><td>${p.pop.toFixed(1)}</td><td>${esc(p.capital)}</td></tr>`).join("");
  const total = PROVINCES_2024.reduce((a, p) => a + p.pop, 0).toFixed(1);
  const extra = `<section class="panel">
      <h2>Largest provinces by population, 2024 <span class="unit-inline">(million people)</span></h2>
      <div class="chart">${shareBars(PROVINCES_2024, "pop", "name", "m")}</div>
      <p class="source">Source: BPS - Statistics Indonesia, mid-2024 estimates. These eight provinces hold ${total} million people — over half the country. Java alone holds about 56% of all Indonesians.</p>
    </section>
    <section class="panel">
      <h2>Provincial table</h2>
      <div class="table-wrap"><table class="data-table">
        <thead><tr><th>Province</th><th>Population (million)</th><th>Capital</th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>
      <p>${csvButton("provinces", "province data")}</p>
    </section>`;
  const section = SECTIONS[5];
  return `<section class="page-head">
      <p class="kicker">${esc(section.label)}</p>
      <h1>Where Indonesians live</h1>
      <p class="lede">${esc(section.blurb)}</p>
    </section>${extra}`;
}

export function sourcesView() {
  return `<section class="page-head">
      <p class="kicker">Sources &amp; methods</p>
      <h1>Where every number comes from</h1>
      <p class="lede">NusaStat publishes no figure of its own. Each indicator names its source
      and year on the page where it appears; this page collects the definitions.</p>
    </section>
    <section class="panel">
      <h2>Sources</h2>
      <ul class="defs">
        <li><strong>BPS — Statistics Indonesia (bps.go.id).</strong> GDP, inflation, unemployment (Sakernas labour-force survey), poverty and the poverty line, provincial population. The national statistical office; its releases are the reference for Indonesian figures.</li>
        <li><strong>World Bank, World Development Indicators (data.worldbank.org).</strong> Population, GDP in US dollars, GDP per capita, fertility, urban share, life expectancy.</li>
        <li><strong>IMF World Economic Outlook, April 2025.</strong> Cross-check for GDP in US dollars and the world ranking.</li>
      </ul>
      <h2>Definitions</h2>
      <ul class="defs">
        <li><strong>Poverty line:</strong> the rupiah cost of 2,100 calories a day plus a small allowance for other basic non-food needs, per person per month (BPS).</li>
        <li><strong>Open unemployment rate:</strong> people without work who are looking for one, as a share of the labour force (BPS Sakernas).</li>
        <li><strong>Inflation:</strong> annual average change in the consumer price index (BPS).</li>
        <li><strong>Real GDP growth:</strong> change in GDP at constant prices on the previous year (BPS).</li>
        <li><strong>“n/a” in a table</strong> means the source had not published that year when this site was built (November 2026).</li>
      </ul>
      <h2>What this site does not do</h2>
      <p>It forecasts nothing, it polls nobody, and it republishes no figure without naming where it came from. If a source revises a number, the correction belongs on this page.</p>
    </section>`;
}

export function aboutView() {
  return `<section class="page-head">
      <p class="kicker">About</p>
      <h1>An independent statistics portal</h1>
      <p class="lede">NusaStat is an independent site that gathers Indonesia's official statistics
      in one place, in plain language, with charts you can read and tables you can
      download. It is not affiliated with BPS, the World Bank or the IMF; those
      bodies are the sources, and each figure names which one.</p>
    </section>
    <section class="panel">
      <h2>How to use it</h2>
      <ul class="defs">
        <li>Start on the home page for the headline numbers, then pick a topic for the full series.</li>
        <li>Every chart covers 2020–2024; every table shows the same years, so chart and table always agree.</li>
        <li>Click a table heading to sort it; use “Download as CSV” to take the data with you.</li>
        <li>On a phone, the layout stacks into a single column and the charts scale to the screen.</li>
      </ul>
      <h2>Corrections</h2>
      <p>If a figure here disagrees with its source, the source is right and this page is wrong — write in and it will be fixed with a note saying what changed.</p>
    </section>`;
}

export function notFoundView(route) {
  return `<section class="page-head">
      <p class="kicker">404</p>
      <h1>No such page</h1>
      <p class="lede">“${esc(route)}” is not one of this site's pages. Try one of the topics below.</p>
    </section>
    <section class="panel"><ul class="topics">${SECTIONS.map((s) => `<li><a href="#/${s.id}">${esc(s.label)}</a><span>${esc(s.blurb)}</span></li>`).join("")}</ul></section>`;
}

export const ROUTES = {
  "": homeView,
  "population": populationView,
  "economy": economyView,
  "prices": pricesView,
  "labour": labourView,
  "welfare": welfareView,
  "provinces": provincesView,
  "sources": sourcesView,
  "about": aboutView,
};
