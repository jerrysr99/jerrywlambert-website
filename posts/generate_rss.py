#!/usr/bin/env python3
"""Generate a full-content RSS feed from manifest.json + post HTML bodies.
Output: posts/rss.xml  (for Substack one-click import and general syndication).
"""
import json, re, html, datetime, pathlib

HERE = pathlib.Path(__file__).parent
SITE = "https://jerrywlambert.com"
manifest = json.loads((HERE / "manifest.json").read_text())

BODY_RE = re.compile(r'<div class="post-body fade-up">(.*?)\n      </div>', re.S)

def post_body(slug):
    fp = HERE / f"{slug}.html"
    m = BODY_RE.search(fp.read_text())
    if not m:
        raise SystemExit(f"no body found in {fp}")
    return m.group(1).strip()

def rfc822(iso):
    dt = datetime.datetime.fromisoformat(iso)
    return dt.strftime("%a, %d %b %Y %H:%M:%S %z")

items = []
for e in manifest:  # manifest is sorted newest-first; RSS is fine newest-first
    url = f"{SITE}/posts/{e['slug']}.html"
    body = post_body(e["slug"])
    items.append(f"""    <item>
      <title>{html.escape(e['title'])}</title>
      <link>{url}</link>
      <guid isPermaLink="true">{url}</guid>
      <pubDate>{rfc822(e['date'])}</pubDate>
      <description>{html.escape(e['excerpt'])}</description>
      <content:encoded><![CDATA[{body}]]></content:encoded>
    </item>""")

now = datetime.datetime.now(datetime.timezone.utc).strftime("%a, %d %b %Y %H:%M:%S %z")
feed = f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Jerry W. Lambert Sr. — AI Field Notes</title>
    <link>{SITE}/posts/</link>
    <atom:link href="{SITE}/posts/rss.xml" rel="self" type="application/rss+xml"/>
    <description>Executive field notes on AI transformation, from someone running production AI workloads — not commenting from the sidelines.</description>
    <language>en-us</language>
    <lastBuildDate>{now}</lastBuildDate>
{chr(10).join(items)}
  </channel>
</rss>
"""
(HERE / "rss.xml").write_text(feed)
print(f"Wrote rss.xml with {len(items)} items")
