// NusaStat main: hash router, live indicator search, sortable tables and
// CSV downloads. Everything runs from the files in app/; nothing is fetched.

import { INDICATORS, PROVINCES_2024, YEARS, formatValue } from "./data.js";
import { ROUTES, notFoundView } from "./views.js";

const app = document.getElementById("app");

function currentRoute() {
  const hash = window.location.hash || "#/";
  return hash.replace(/^#\/?/, "").split("/")[0];
}

function render() {
  const route = currentRoute();
  const view = ROUTES[route] || null;
  app.innerHTML = view ? view() : notFoundView(route);
  document.title = route
    ? `${route[0].toUpperCase()}${route.slice(1)} · NusaStat — Statistik Indonesia`
    : "NusaStat — Statistik Indonesia in numbers";
  window.scrollTo(0, 0);
  wirePage();
}

function wirePage() {
  wireSearch();
  wireTables();
  wireCsv();
}

function wireSearch() {
  const input = document.getElementById("indicator-search");
  if (!input) return;
  const index = document.getElementById("indicator-index");
  const results = document.getElementById("indicator-results");
  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    if (!q) {
      index.style.display = "";
      results.innerHTML = "";
      return;
    }
    index.style.display = "none";
    const hits = INDICATORS.filter((d) =>
      (d.name + " " + d.section + " " + d.source).toLowerCase().includes(q));
    results.innerHTML = hits.length
      ? hits.map((d) => `<li><a href="#/${d.section}">${d.name}</a><span>${formatValue(d, d.value)} ${d.unit} · ${d.year} · ${d.source}</span></li>`).join("")
      : `<li><span>No indicator matches “${input.value.trim()}”. Try “poverty”, “inflation” or “exports”.</span></li>`;
  });
}

function wireTables() {
  document.querySelectorAll("table.data-table").forEach((table) => {
    const head = table.querySelector("thead tr");
    if (!head) return;
    head.querySelectorAll("th[data-sort]").forEach((th) => {
      th.style.cursor = "pointer";
      th.addEventListener("click", () => {
        const key = th.dataset.sort;
        const idx = [...head.children].indexOf(th);
        const body = table.querySelector("tbody");
        const rows = [...body.querySelectorAll("tr")];
        const asc = th.dataset.dir !== "asc";
        head.querySelectorAll("th").forEach((h) => delete h.dataset.dir);
        th.dataset.dir = asc ? "asc" : "desc";
        const num = (cell) => {
          const t = cell.textContent.replace(/[^0-9.\-]/g, "");
          const n = parseFloat(t);
          return Number.isNaN(n) ? null : n;
        };
        rows.sort((a, b) => {
          const av = a.children[idx].textContent.trim();
          const bv = b.children[idx].textContent.trim();
          const an = num(a.children[idx]), bn = num(b.children[idx]);
          let cmp;
          if (an !== null && bn !== null) cmp = an - bn;
          else cmp = av.localeCompare(bv);
          return asc ? cmp : -cmp;
        });
        rows.forEach((r) => body.appendChild(r));
      });
    });
  });
}

function toCsv(rows) {
  return rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n") + "\n";
}

function downloadCsv(filename, text) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function wireCsv() {
  document.querySelectorAll("[data-csv]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const section = btn.dataset.csv;
      if (section === "provinces") {
        const rows = [["Province", "Population (million)", "Capital", "Year", "Source"],
          ...PROVINCES_2024.map((p) => [p.name, p.pop, p.capital, 2024, "BPS - Statistics Indonesia"])];
        downloadCsv("nusastat-provinces-2024.csv", toCsv(rows));
        return;
      }
      const inds = INDICATORS.filter((d) => d.section === section);
      const rows = [["Indicator", "Unit", ...YEARS.map(String), "Latest year", "Source"],
        ...inds.map((d) => [d.name, d.unit, ...d.series.map((v) => (v === null ? "" : v)), d.year, d.source])];
      downloadCsv(`nusastat-${section}-2020-2024.csv`, toCsv(rows));
    });
  });
}

window.addEventListener("hashchange", render);
render();
