# Photography collection sync

The four supplied URLs and Valley Forge point directly to their collections.
The existing five album cards remain a JavaScript-free fallback.

## Updates

The **Sync Pixieset collections** GitHub Action is currently **manual only** because
Pixieset is returning HTTP 403 to GitHub-hosted automated browser requests.

Use **Actions > Sync Pixieset collections > Run workflow** when you want to test
whether Pixieset has started allowing the request again. There is no Pixieset
login, private API, checkout integration, proxy rotation, or challenge bypass.

On a complete successful read, the workflow updates collection titles, URLs,
order and small cover previews in `data/pixieset-collections.json` and
`images/photography/`. The browser reads the JSON and its images directly from
this public repository's raw content. Original photographs, prices, download
permissions and payment settings stay on Pixieset and are never changed.

Only homepage-visible cards are discovered; hidden galleries are not searched,
and folders are not crawled recursively. Covers are resized to at most 960 pixels.

## Access and failure handling

A successful run reports `SYNC_OK`. If Pixieset returns HTTP 403 or another
blocking response, the run reports `SYNC_FAILED` and retains the existing
website albums. A blocked response is never interpreted as an empty gallery, and
no partial listing or failed image download is published.

Scheduled retries were disabled on September 26, 2026 so the repository does not
generate repeated failed GitHub Actions runs and notification emails while
Pixieset blocks automated access. The workflow remains available for manual tests.

## Manual fallback and maintenance

While remote reads are blocked, add a record to
`data/pixieset-collections.json` and a small `.webp` cover under
`images/photography/`. No HTML editing is needed for the live feed. Keep a
direct collection URL, not the Pixieset homepage.

The static cards in `photography.html` are a separate offline fallback.

References:
- https://website-help.pixieset.com/en/articles/2500005-sharing-client-gallery-collections-on-your-website
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#workflow_dispatch
