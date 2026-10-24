"""Render the briefings list and Featured Brief box from briefings/briefs.json.

Run from the repo root:  python3 briefings/_build/build_index.py
It rewrites only the block between the BRIEFINGS:GENERATED markers in briefings/index.html.
"""
import json, html, pathlib, sys
root = pathlib.Path(__file__).resolve().parents[2]
data = json.loads((root / "briefings/briefs.json").read_text())
by_id = {e["id"]: e for e in data["entries"]}
if len(by_id) != len(data["entries"]):
    sys.exit("duplicate id in briefs.json")
feat = by_id.get(data.get("featured"))
if data.get("featured") and not feat:
    sys.exit(f"featured id {data['featured']!r} not found in entries")
esc = html.escape
out = []
if feat:
    out.append('    <section class="featured" id="featured">')
    out.append('      <p class="kick">Featured Brief</p>')
    out.append(f'      <h2 class="title"><a href="{feat["href"]}">{esc(feat["title"])}</a></h2>')
    out.append(f'      <p class="intro">{esc(feat.get("intro") or feat.get("summary",""))}</p>')
    if feat.get("list"):
        out.append('      <ol class="feat-list">')
        for it in feat["list"]:
            out.append(f'        <li><strong>{esc(it["name"])}.</strong> {esc(it["line"])}</li>')
        out.append('      </ol>')
    out.append('      <div class="feat-actions">')
    out.append(f'        <a class="cta" href="{feat["href"]}">Read the full brief</a>')
    if feat.get("pdf"):
        out.append(f'        <a class="cta alt" href="{feat["pdf"]}">Download the PDF</a>')
    out.append('      </div>')
    out.append('    </section>')
out.append('    <ul class="post-list">')
for e in sorted((e for e in data["entries"] if e is not feat), key=lambda e: e["date"], reverse=True):
    out.append('      <li>')
    out.append(f'        <a href="{e["href"]}">')
    out.append(f'          <p class="date">{esc(e["date_line"])}</p>')
    out.append(f'          <p class="title">{esc(e["title"])}</p>')
    if e.get("summary"):
        out.append(f'          <p class="sub">{esc(e["summary"])}</p>')
    out.append('        </a>')
    out.append('      </li>')
out.append('    </ul>')
p = root / "briefings/index.html"
s = p.read_text()
A, B = "<!-- BRIEFINGS:GENERATED START (edit briefings/briefs.json, then run briefings/_build/build_index.py) -->", "<!-- BRIEFINGS:GENERATED END -->"
i, j = s.index(A) + len(A), s.index(B)
p.write_text(s[:i] + "\n" + "\n".join(out) + "\n    " + s[j:])
print(f"featured={feat['id'] if feat else None} list={len(data['entries']) - (1 if feat else 0)}")
