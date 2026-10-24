# Briefings index and the Featured Brief

`briefings/briefs.json` is the single source of truth for `/briefings/`.

- `entries` holds every brief, featured ones included. Each entry has an `id`, an ISO `date` (YYYY-MM-DD), `href`, `date_line`, `title` and an optional `summary`.
- A featured entry can also carry `intro`, `list` (items with `name` and `line`) and `pdf`. These show only while it is featured.
- `featured` is the pointer. It holds the `id` of the entry shown in the Featured Brief box.

The page shows the Subscribe button, then the Featured Brief box (anchor `/briefings/#featured`), then every other entry sorted by date, newest first.

## Swap the featured brief

1. Add the new brief as an entry in `entries` (with `intro`, `list` and `pdf` if you want them in the box).
2. Change `featured` to the new entry's `id`.
3. From the repo root run `python3 briefings/_build/build_index.py`.
4. Commit `briefings/briefs.json` and `briefings/index.html` together.

The old featured brief drops into the list at its date automatically. Do not edit the block between the `BRIEFINGS:GENERATED` markers in `index.html` by hand. The script rewrites it.

## Add a daily brief

Add its entry to `entries`, run the script, commit. Order in the JSON does not matter.
