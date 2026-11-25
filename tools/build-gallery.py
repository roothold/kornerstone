#!/usr/bin/env python3
"""Rebuilds event-images.html from assets/gallery/<event>/manifest.json.
Run from the repo root:  python3 tools/build-gallery.py
Manifest rows: [photo id, day number, original filename, width, height]."""
import json, re, collections, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
EVENT = {"slug": "21-days-of-worship", "name": "21 Days of Worship", "dates": "13 November to 3 December 2026", "page": "events/21-days-of-worship.html"}
G = f"assets/gallery/{EVENT['slug']}"
rows = json.load(open(ROOT / G / "manifest.json"))
days = collections.OrderedDict()
for key, day, _name, w, h in rows:
    days.setdefault(day, []).append((key, w, h))
total = len(rows)

chrome = (ROOT / "events.html").read_text()
header = chrome[chrome.index("<body>") + 6: chrome.index("</header>") + 9]
footer = chrome[chrome.index('<footer class="site-footer">'): chrome.index('<script src="assets/script.js"')]

chips = [f'<button type="button" class="gal-chip" data-day="all" aria-pressed="true">All nights<small>{total}</small></button>']
sections = []
for day, items in days.items():
    n = int(day)
    chips.append(f'<button type="button" class="gal-chip" data-day="{day}" aria-pressed="false">Day {n}<small>{len(items)}</small></button>')
    tiles = []
    for i, (key, w, h) in enumerate(items, 1):
        cls = "gal-item gal-item--p" if h > w else "gal-item"
        tw, th = 640, round(h * 640 / w)
        tiles.append(
            f'<a class="{cls}" id="{key}" href="{G}/full/{key}.webp" data-w="{w}" data-h="{h}" data-event="{EVENT["name"]}" data-label="Day {n}, photo {i} of {len(items)}">'
            f'<img src="{G}/thumb/{key}.webp" width="{tw}" height="{th}" loading="lazy" decoding="async" alt="{EVENT["name"]}, day {n}: worship at Kornerstone, photo {i}" /></a>')
    sections.append(
        f'    <section class="gal-day" data-day="{day}" id="day-{n}" aria-labelledby="day-{n}-h">\n'
        f'      <div class="gal-day__head"><h3 id="day-{n}-h">Day {n}</h3><span>{len(items)} photos</span></div>\n'
        f'      <div class="gal-grid">\n        ' + "\n        ".join(tiles) + '\n      </div>\n    </section>')

title = "Event Images, Kornerstone Prophetic Ministry"
desc = f"Photos from {EVENT['name']} at Kornerstone Prophetic Ministry in Lagos. Browse every night, open any photo full screen, download and share."
og = f"https://kstonepm.org/{G}/full/{rows[-1][0]}.webp"
html = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>{title}</title>
<meta name="description" content="{desc}" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@500;600;700;800&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="assets/styles.css" />
<link rel="icon" type="image/png" sizes="32x32" href="assets/favicon-32.png" />
<link rel="icon" type="image/png" sizes="96x96" href="assets/favicon-96.png" />
<link rel="apple-touch-icon" sizes="180x180" href="assets/favicon-180.png" />
<meta name="theme-color" content="#0a0a0d" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Kornerstone Prophetic Ministry" />
<meta property="og:title" content="Event Images: {EVENT['name']}" />
<meta property="og:description" content="{desc}" />
<meta property="og:url" content="https://kstonepm.org/event-images.html" />
<meta property="og:image" content="{og}" />
<meta name="twitter:card" content="summary_large_image" />
<link rel="canonical" href="https://kstonepm.org/event-images.html" />
</head>
<body>{header}
<section class="page-hero">
  <div class="container">
    <span class="eyebrow reveal">Gallery</span>
    <h1 class="h-xl reveal" data-delay="1">Event Images</h1>
    <p class="lead center reveal" data-delay="2" style="margin:22px auto 0;color:var(--muted-d);">Moments from our gatherings, night by night. Find yourself, relive the room, and share it with someone who should have been there.</p>
    <p class="crumb reveal" data-delay="2"><a href="index.html">Home</a> / <a href="events.html">Events</a> / Event Images</p>
  </div>
</section>
<section class="section section--tight" style="padding-top:64px;">
  <div class="container">
    <div class="gal-intro">
      <div>
        <span class="eyebrow">{EVENT['dates']}</span>
        <h2>{EVENT['name']}</h2>
        <p>Three weeks of nightly worship in Lagos and online. New nights are added as the event continues. <a href="{EVENT['page']}" style="color:var(--blue);font-weight:600;">Event details</a></p>
      </div>
      <span class="gal-count" data-gal-count>{total} photos</span>
    </div>
    <div class="gal-bar"><div class="gal-chips" role="group" aria-label="Filter photos by night">{''.join(chips)}</div></div>
{chr(10).join(sections)}
    <p class="gal-credit">Tap any photo to view it full screen. Swipe or use the arrow keys to move between photos.</p>
  </div>
</section>
<section class="cta-band reveal">
  <div class="container">
    <h2 class="h-lg">Be in the room for the next one</h2>
    <p class="lead" style="margin-top:18px;">Join us in person in Lagos or live online from anywhere.</p>
    <div class="hero__actions" style="justify-content:center;margin-top:34px;">
      <a href="{EVENT['page']}" class="btn btn--blue">{EVENT['name']} details</a>
      <a href="https://youtube.com/kstonecc" target="_blank" rel="noopener" class="btn btn--outline-light">Watch Live</a>
    </div>
  </div>
</section>
{footer}<script src="assets/script.js" defer></script>
<script src="assets/gallery.js" defer></script>
</body>
</html>
'''
(ROOT / "event-images.html").write_text(html)
print("event-images.html written:", total, "photos,", len(days), "days")
