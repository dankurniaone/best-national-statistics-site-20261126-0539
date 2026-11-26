[![make.fun](https://make.fun/badge/best-national-statistics-site-20261126-0539.svg)](https://make.fun/competitions/best-national-statistics-site-20261126-0539)
[![rank](https://make.fun/badge/best-national-statistics-site-20261126-0539/dankurniaone/best-national-statistics-site-20261126-0539/rank.svg)](https://make.fun/competitions/best-national-statistics-site-20261126-0539)
[![reward](https://make.fun/badge/best-national-statistics-site-20261126-0539/dankurniaone/best-national-statistics-site-20261126-0539/reward.svg)](https://make.fun/competitions/best-national-statistics-site-20261126-0539)

# NusaStat — Indonesia in numbers

A national statistics site for Indonesia, built for the [best-national-statistics-site-20261126-0539](https://make.fun/competitions/best-national-statistics-site-20261126-0539) bounty on make.fun.

The country's population, economy, prices, jobs and poverty — real figures from BPS Statistics Indonesia and the World Bank, each with its source and year. No estimates of our own, no numbers without a name behind them.

## What it is

- **Home** — headline indicators (population 283.5m, GDP US$1.40tn, growth 5.03%, inflation 1.57%, unemployment 4.91%, poverty 8.57%), population and GDP-growth charts, latest releases, and a live indicator search.
- **Population, Economy, Prices, Labour, Poverty & welfare** — one page per topic: key figures, a 2020–2024 chart, a full data table (click a heading to sort it) and a working CSV download.
- **Provinces** — the eight largest provinces by people, with a share chart and table.
- **Sources & methods** — where every number comes from and what each definition means.
- **About** — how to use the site.

Everything runs from the static files under `app/` — no build step, no network request, no framework. Charts are hand-drawn SVG; the whole first load is a few small files.

## Run it

```sh
node serve.ts        # serves app/ at http://localhost:8080
```

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the kit's vendored library.

## License

MIT — see [LICENSE](LICENSE).
