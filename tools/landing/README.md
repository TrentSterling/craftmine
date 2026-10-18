# CraftMine landing author and discovery contract

Production changes are restricted to four exact regions in `index.html`:

- Self-canonical `https://tront.xyz/craftmine/`, matching existing Open Graph, VideoGame URL and the play page canonical added by `eea58242`.
- Canonical Person ID on the existing VideoGame author; no new author claim or ProfilePage type.
- Link the existing “lofi music system” words to `https://tront.xyz/lofigen/`.
- Append “CraftMine devlog” to the footer, pointing to `https://tront.xyz/blog/posts/craftmine/`.

The article and music relationship were verified in released blog `17cc9da`; both articles already link back to CraftMine. All original sentences, AI attribution, credits, dates, play links, CSS/JS, images and game runtime bytes are preserved. The public web reader resolves the landing URL; direct HTTP from the cloud environment returns an intermediary placeholder, so redirect headers were not independently established.

`reviewed.json` contains literal changes and hashes of every other existing file. Source tests compare normalized candidate and actual PR-base bytes and reject missing/duplicate additions or unrelated changes. This also works with an already-fixed base.

Run with Node and pinned Playwright 1.62.0 and pngjs 7.0.0:

```
LANDING_BASELINE_ROOT=/path/to/base node --test tools/landing/test.cjs
LANDING_BASELINE_ROOT=/path/to/base LANDING_SHARED_ROOT=/path/to/main-site LANDING_BLOG_ROOT=/path/to/blog node tools/landing/browser.cjs
```

Optional `LANDING_BROWSER=webkit`, `LANDING_BROWSER_EXECUTABLE`, `LANDING_SCREENSHOTS`, and `LANDING_FONT_CACHE` select an installed browser, evidence directory and verified cached font responses. CI pins released shared source and blog logo commits. Browser tests run at desktop, 375px, 320px, two 200%-CSS-zoom reflow cases, no-JS, and light mode. They compare original animation declarations before locking matching infinite animations to time zero, preserve exact primary geometry and top pixels (with the narrowly documented no-JS renderer diagnostic below), and exercise each added link via native Tab/Enter, history and reload. CSS zoom is a reflow stress fixture, not a claim of native browser zoom coverage.

Link destinations are intercepted as inert documents; runtime and download requests fail the suite. Runtime execution, performance and visual redesign are outside this landing-only contract.

Identical-source WebKit control at 320px/no-JS reproduces 48 one-level green-channel differences along the unchanged Play button gradient. Only that fixture permits up to 64 such pixels inside the exact Play rectangle. All red/blue/alpha values and every other region/fixture remain exact. Negative tests reject any broader difference. Source/CSS/primary-markup checks remain byte-exact. This is renderer rounding, not a production change or performance claim.
