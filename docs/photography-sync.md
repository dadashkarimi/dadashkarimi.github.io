# Photography collection sync

The four supplied URLs and Valley Forge now point directly to their collections.
The existing five album cards remain a JavaScript-free fallback.

## Automatic updates

The **Sync Pixieset collections** GitHub Action checks the public gallery homepage
at 00:17, 06:17, 12:17 and 18:17 UTC, and can also be run manually in Actions.
Schedules are approximate; GitHub can delay a run. There is no Pixieset login,
private API, checkout integration, proxy rotation, or challenge bypass.

On a complete successful read, it updates collection titles, URLs, order and small
cover previews in `data/pixieset-collections.json` and `images/photography/`.
The browser reads the JSON and its images directly from this public repository's
raw content. This matters because commits made with `GITHUB_TOKEN` do not
trigger GitHub Pages builds when publishing from a branch. The website itself
continues to use its existing Pages deployment process. GitHub's raw-content
cache may add a few minutes before visitors see a successful sync.

Only homepage-visible cards are discovered; hidden galleries are not searched,
and folders are not crawled recursively. Covers are resized to at most 960 pixels.
Original photographs, prices, download permissions and payment settings stay
on Pixieset and are never changed by this workflow.

## Access and failure handling

Installation does NOT prove that automatic reads work. Check the most recent
Actions run: `SYNC_OK` means a completed read, while `SYNC_FAILED` means the
previous feed was retained. `status: awaiting_first_sync` and a null
`last_synced_at` in the initial JSON explicitly mean no live sync has succeeded.
A Cloudflare challenge/HTTP 403 is not treated as an empty gallery or worked around.
No partial listing or failed image download is published.

If Pixieset continues blocking GitHub's standard browser, automatic importing
will not work until an allowed access method is available. The scheduler continues
trying every six hours; it must not be described as successful end-to-end syncing.
Use **Actions > Sync Pixieset collections > Disable workflow** to stop retries.

New collections should be published and visible on the Pixieset homepage.
A successful complete read removes cards no longer listed there; a failed read
retains the last good list. This is not an instant privacy control: cached or
previously committed public cover previews can remain accessible. For urgent
removal, edit the public feed and the static fallback cards directly.

## Manual fallback and maintenance

While remote reads are blocked, add a record to `data/pixieset-collections.json`
and a small `.webp` cover under `images/photography/`. No HTML editing is needed
for the live feed. Keep a direct collection URL, not the Pixieset homepage.
The static cards in `photography.html` are a separate offline fallback.

Public GitHub repositories can have scheduled workflows disabled after 60 days
without repository activity. Re-enable the workflow in Actions if that happens.

References:
- https://website-help.pixieset.com/en/articles/2500005-sharing-client-gallery-collections-on-your-website
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule
