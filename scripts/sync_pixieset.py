#!/usr/bin/env python3
"""Mirror visible Pixieset homepage cards, never original/paid photographs.

A denied/challenged request, incomplete listing or invalid image aborts the sync.
No credentials, login, proxy rotation or challenge circumvention are used.
The existing JSON and images are not modified unless the entire read succeeds.
"""
from __future__ import annotations
import argparse
import hashlib
import io
import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlsplit

HOME = "https://javidstudio.pixieset.com/"
ROOT = Path(__file__).resolve().parents[1]
FEED = ROOT / "data/pixieset-collections.json"
RESERVED = {"store", "cart", "login", "logout", "account", "about", "contact", "privacy", "terms", "download", "downloads", "favorites", "search"}

# Only information already visible in public homepage cards is extracted.
EXTRACT = r"""(home) => {
  const origin = new URL(home).origin;
  const reserved = new Set(['store','cart','login','logout','account','about','contact','privacy','terms','download','downloads','favorites','search']);
  function canonical(a) {
    try {
      const u = new URL(a.getAttribute('href'), home);
      const slug = u.pathname.replace(/^\/+|\/+$/g, '');
      if (u.origin !== origin || u.username || u.password || u.search || u.hash ||
          !/^[a-zA-Z0-9_-]+$/.test(slug) || reserved.has(slug.toLowerCase())) return null;
      return origin + '/' + slug + '/';
    } catch (_) { return null; }
  }
  function visible(el) {
    return !!el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden' &&
      !el.closest('[hidden], [aria-hidden="true"]');
  }
  function images(el) {
    const result = [];
    for (const node of [el, ...el.querySelectorAll('*')]) {
      if (node.tagName === 'IMG') {
        const src = node.currentSrc || node.getAttribute('src') || node.getAttribute('data-src');
        if (src && !src.startsWith('data:')) result.push(new URL(src, home).href);
      }
      const bg = getComputedStyle(node).backgroundImage;
      for (const m of bg.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
        if (!m[1].startsWith('data:')) result.push(new URL(m[1], home).href);
      }
    }
    return [...new Set(result)];
  }
  const found = new Map();
  for (const a of document.querySelectorAll('a[href]')) {
    const url = canonical(a);
    if (!url || !visible(a)) continue;
    let card = a;
    for (let depth = 0; depth < 3 && card.parentElement && card.parentElement !== document.body; depth++) {
      const parent = card.parentElement;
      const links = new Set([...parent.querySelectorAll('a[href]')].map(canonical).filter(Boolean));
      if (links.size !== 1) break;
      card = parent;
    }
    const covers = images(a).length ? images(a) : images(card);
    // Skip non-gallery navigation links; an album must have a visible cover.
    if (!covers.length) continue;
    const heading = card.querySelector('h1,h2,h3,h4,.collection-name,.collection-title,.title');
    const text = (heading ? heading.innerText : (a.innerText || card.innerText || a.getAttribute('title') || '')).trim();
    const title = text.split(/\n/).map(t => t.trim()).find(t => t && !/^(view|open)( gallery| collection)?$/i.test(t)) || '';
    const previous = found.get(url);
    if (!previous || (!previous.title && title)) found.set(url, {url, title, image: covers[0]});
  }
  return [...found.values()];
}"""


def album_url(value: str) -> str:
    u = urlsplit(value)
    slug = u.path.strip("/")
    if (u.scheme != "https" or u.netloc != "javidstudio.pixieset.com" or
            u.query or u.fragment or not re.fullmatch(r"[A-Za-z0-9_-]+", slug) or slug.lower() in RESERVED):
        raise ValueError("Unexpected collection URL")
    return HOME + slug + "/"


def validate_items(items: list[dict]) -> None:
    if not isinstance(items, list) or not 1 <= len(items) <= 400:
        raise ValueError("No complete public collection listing; previous feed retained")
    seen = set()
    for item in items:
        url = album_url(item["url"])
        if url in seen or not isinstance(item.get("title"), str) or not 1 <= len(item["title"].strip()) <= 180:
            raise ValueError("Duplicate or incomplete collection card")
        seen.add(url)
        image = urlsplit(item["image"])
        if (image.scheme != "https" or image.username or image.password or image.port not in (None, 443) or
                not image.hostname or not image.hostname.endswith(".pixieset.com")):
            raise ValueError("Cover is not a public Pixieset image URL")


def check_page(page, response) -> None:
    if response is None or response.status != 200:
        status = response.status if response is not None else "unknown"
        raise RuntimeError(f"Pixieset returned HTTP {status}; previous albums retained. Automated access is not working.")
    if urlsplit(page.url).netloc != "javidstudio.pixieset.com":
        raise RuntimeError("Unexpected redirect; previous albums retained")
    if re.search(r"just a moment|access denied|verify you are human|attention required", page.title(), re.I):
        raise RuntimeError("Pixieset is challenging automated access; previous albums retained")


def discover(page) -> list[dict]:
    all_items = {}
    visited = set()
    url = HOME
    for _ in range(20):
        if url in visited:
            raise RuntimeError("Repeated pagination; refusing an incomplete collection list")
        visited.add(url)
        response = page.goto(url, wait_until="domcontentloaded", timeout=45000)
        check_page(page, response)
        page.wait_for_timeout(2500)
        stable = 0
        last = None
        for _ in range(40):
            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            page.wait_for_timeout(1000)
            more = page.get_by_role("button", name=re.compile(r"^(load|show|view) more(?: collections| galleries| albums)?$", re.I))
            more_link = page.get_by_role("link", name=re.compile(r"^(load|show|view) more(?: collections| galleries| albums)?$", re.I))
            candidate = next((loc.nth(i) for loc in (more, more_link) for i in range(loc.count())
                              if loc.nth(i).is_visible() and loc.nth(i).is_enabled()), None)
            if candidate is not None:
                candidate.click(timeout=10000)
                stable = 0
                continue
            items = page.evaluate(EXTRACT, HOME)
            signature = (tuple(i["url"] for i in items), page.evaluate("document.body.scrollHeight"))
            stable = stable + 1 if signature == last else 0
            last = signature
            if stable >= 2:
                break
        else:
            raise RuntimeError("Collection listing did not finish loading; previous feed retained")
        validate_items(items)
        for item in items:
            item["url"] = album_url(item["url"])
            all_items[item["url"]] = item
        next_links = page.locator('a[rel="next"], .pagination a.next, .pagination .next:not(.disabled) a')
        next_url = None
        for i in range(next_links.count()):
            link = next_links.nth(i)
            if link.is_visible() and link.get_attribute("aria-disabled") != "true":
                next_url = link.evaluate("a => a.href")
                break
        if next_url is None:
            break
        parts = urlsplit(next_url)
        if parts.scheme != "https" or parts.netloc != "javidstudio.pixieset.com" or parts.username or parts.password:
            raise RuntimeError("Unexpected pagination destination")
        url = next_url
    else:
        raise RuntimeError("Pagination limit reached; previous feed retained")
    result = list(all_items.values())
    validate_items(result)
    return result


def sync(context) -> bool:
    from PIL import Image, ImageOps
    Image.MAX_IMAGE_PIXELS = 20_000_000
    old = json.loads(FEED.read_text())
    old_by_url = {x["url"]: x for x in old["collections"]}
    page = context.new_page()
    try:
        items = discover(page)
    finally:
        page.close()
    # Prepare the complete update in memory first; a failure writes nothing.
    pending = {}
    albums = []
    for item in items:
        response = context.request.get(item["image"], timeout=30000, max_redirects=0)
        try:
            if response.status != 200:
                raise RuntimeError("A cover could not be read; previous feed retained")
            raw = response.body()
        finally:
            response.dispose()
        if len(raw) > 5_000_000:
            raise RuntimeError("Unexpectedly large cover; refusing original-size image")
        with Image.open(io.BytesIO(raw)) as source:
            image = ImageOps.exif_transpose(source).convert("RGB")
            image.thumbnail((960, 960))
            if min(image.size) < 80:
                raise RuntimeError("Invalid or placeholder collection cover")
            output = io.BytesIO()
            image.save(output, "WEBP", quality=84, method=6)
        content = output.getvalue()
        cover = "images/photography/auto-" + hashlib.sha256(content).hexdigest()[:24] + ".webp"
        pending[cover] = content
        previous = old_by_url.get(item["url"], {})
        albums.append({
            "id": previous.get("id", "pixieset-" + item["url"].rstrip("/").rsplit("/", 1)[-1]),
            "title": item["title"].strip(), "url": item["url"], "cover": cover,
            "alt": item["title"].strip() + " collection cover",
            "width": image.width, "height": image.height,
        })
    if albums == old["collections"] and old.get("status") == "synced":
        print(f"SYNC_OK: {len(albums)} public albums; no changes.")
        return False
    new = {"version": 1, "source": HOME, "status": "synced",
           "last_synced_at": datetime.now(timezone.utc).isoformat(), "collections": albums}
    for name, content in pending.items():
        dest = ROOT / name
        dest.parent.mkdir(parents=True, exist_ok=True)
        if not dest.exists():
            dest.write_bytes(content)
    tmp = FEED.with_suffix(".tmp")
    tmp.write_text(json.dumps(new, indent=2, ensure_ascii=False) + "\n")
    tmp.replace(FEED)
    print(f"SYNC_OK: updated {len(albums)} public albums and low-resolution covers.")
    return True


def self_test(browser) -> None:
    # No external network requests in the parser tests.
    context = browser.new_context()
    context.route("**/*", lambda route: route.abort())
    page = context.new_page()
    page.set_content("""<div class="collections"><article><a href="/bighouse/"><img src="https://images.pixieset.com/a.jpg" width="100" height="100"><h3>Big House</h3></a></article><article><a href="/hopewelllake/"><div style="width:100px;height:100px;background-image:url(https://images.pixieset.com/b.jpg)"></div></a><a href="/hopewelllake/"><h3>Hopewell Lake</h3></a></article></div><a href="/store/">Store</a><a href="https://other.example/x/">Other</a><a hidden href="/hidden/"><img src="https://images.pixieset.com/c.jpg">Hidden</a>""")
    items = page.evaluate(EXTRACT, HOME)
    validate_items(items)
    assert len(items) == 2, items
    assert items[1]["title"] == "Hopewell Lake", items
    assert items[0]["url"] == HOME + "bighouse/", items
    for bad in ([], items + [items[0]], [{"url": "https://other.example/x/", "title": "X", "image": items[0]["image"]}]):
        try:
            validate_items(bad)
        except ValueError:
            pass
        else:
            raise AssertionError("Unsafe or incomplete feed was accepted")
    context.close()
    print("SELF_TEST_OK: image/background cards, sibling titles, deduplication, hidden cards, and URL validation.")


def main() -> int:
    from playwright.sync_api import sync_playwright
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    with sync_playwright() as p:
        options = {"headless": True}
        if os.getenv("PIXIESET_CHROMIUM_EXECUTABLE"):
            options["executable_path"] = os.environ["PIXIESET_CHROMIUM_EXECUTABLE"]
        browser = p.chromium.launch(**options)
        try:
            if args.self_test:
                self_test(browser)
            else:
                context = browser.new_context(viewport={"width": 1280, "height": 960}, accept_downloads=False)
                try:
                    sync(context)
                finally:
                    context.close()
        finally:
            browser.close()
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as error:
        # Keep failed remote reads visible in Actions; never report a false sync.
        print("SYNC_FAILED: " + str(error).splitlines()[0], file=sys.stderr)
        sys.exit(1)
