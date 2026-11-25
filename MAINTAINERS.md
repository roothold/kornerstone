# Updating the Kornerstone websites

This repo auto-deploys to Vercel whenever anything merges into `main`. You don't need to touch Vercel: push to GitHub, the live site updates within a minute.

## The two sites

- **kstonepm.org** (Prophetic Ministry) is the `roothold/kornerstone` repo
- **kstonecc.org** (Counselling Centre) is the `roothold/kornerstone-counselling` repo

Pages live at the repo root as `.html` files. Shared design lives in `assets/styles.css`. The ministry site also has event pages in `events/`.

## Common edits (walk-through)

### 1. Change wording on a page

1. On GitHub, click the file you want to change (e.g. `index.html`).
2. Click the pencil icon (**Edit this file**) top-right.
3. Find the text you want to change and type over it.
4. Scroll down. In the commit message box, write what you changed in one line.
5. Click **Commit changes**. The site updates in about 60 seconds.

### 2. Add a new event (ministry only)

Easiest path: copy an existing event page and edit.

1. In `events/`, open an existing event page like `events/perfect-prayers.html`.
2. Click the **Copy raw file** icon (top-right of the file view).
3. Create a new file at `events/your-new-event.html` and paste.
4. Edit title, date, time, body copy, and the links in the JSON-LD block at the top.
5. Open `events.html` and copy an existing event card, change the slug (`href="events/your-new-event.html"`), the date chip, the title and the one-line summary.

### 3. Change the homepage countdown target (ministry)

In `index.html`, find the `<section class="event-countdown"` tag near the top. Change:

- `data-event-target="2026-11-13T19:00:00+01:00"` to the new ISO datetime (keep the `+01:00` for WAT)
- `data-event-end-offset-hours="504"` to how many hours after the start the countdown should disappear
- The `.ec-tag`, `.ec-title`, and `.ec-meta` text to match the new event

### 4. Swap a Calendly or Google Form link (counselling)

The three Google Form URLs sit in two places: `book.html` (three card buttons + fallback) and `counselling.html` (three "Complete the Interest Form" CTAs). Search both files for `forms.gle` and update.

### 5. Edit an image

Images live in `assets/` and `assets/photography/`. Upload a new file into GitHub via **Add file → Upload files** inside the folder, keep the same filename to replace it, or use a new filename and update the `<img src="…">` references in the HTML.

## Previewing changes before publishing

GitHub lets you make changes on a **new branch** instead of `main`. On the commit screen, choose **Create a new branch**. Vercel will build a preview URL for every branch and show it on the pull request. When happy, click **Merge pull request** to publish.

## Who to call

- Site breaks or won't deploy: Michael (michael@surpluspods.com)
- Design/content copy: the person who made the request
- Content calendar: Kornerstone team lead

### 6. Add photos to the Event Images gallery (ministry)

The gallery page (`event-images.html`) is generated, so do not edit it by hand.

1. Put the web-sized photo in `assets/gallery/21-days-of-worship/full/` (WebP, 1600px on the long edge) and a 640px-wide copy with the same filename in `thumb/`. Name them by day and order, e.g. `d12-01.webp`.
2. Add one row per photo to `assets/gallery/21-days-of-worship/manifest.json`: `["d12-01", "12", "original-filename.jpg", width, height]`.
3. Run `python3 tools/build-gallery.py` from the repo root and commit the result. A new "Day 12" filter chip appears automatically.

The homepage "Happening now" photo band lives in `index.html` under the `EVENT IMAGES` comment. Remove or reword it once the event ends.
