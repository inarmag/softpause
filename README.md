# SoftPause Website

Official landing site for SoftPause app.

## Live URLs

- GitHub Pages default: `https://inarmag.github.io/softpause/`
- Custom domain: `https://softpause.app`

## Structure

The site ships in three languages. English lives at the root; French and
Arabic live under `/fr/` and `/ar/`. Arabic pages are RTL (`dir="rtl"`) and
load their own Arabic typefaces.

```
index.html                   en  landing page, the live sigh in its hero
fr/  ar/                     fr / ar landing pages
privacy/                     en  privacy policy   (+ fr/privacy/, ar/privacy/)
terms/                       en  terms of use     (+ fr/terms/,   ar/terms/)
support/                     en  support + FAQ    (+ fr/support/, ar/support/)
blog/                        en  blog index       (+ fr/blog/,    ar/blog/)
blog/<slug>/                 en  blog post        (+ fr/...,      ar/...)
breathing/ anxiety/ reset/   en  evergreen guides (+ fr/...,      ar/...)
styles.css                   shared styles for every page
assets/sigh.js               the live sigh, shared by the three landing pages
assets/                      plant SVGs and screenshots of the pre-v4 app (no page
                             uses them any more; kept, not deleted)
sitemap.xml  robots.txt      all 30 URLs, with hreflang alternates
experiments.json             the app's A/B test config (see below)
CNAME                        custom domain for GitHub Pages
```

Every page carries `hreflang` alternates for all three languages plus
`x-default`, and the header has a language switcher linking to the same
page in the other two languages.

## Live sigh

The hero of each landing page is one live breath: the three physiological
sighs the app's free tier gives everyone (SOS). A clay orb grows on the
breath in, a little more on the top-up and shrinks on the long breath out;
the label reads In / More / Out (FR *Inspirez / Encore / Expirez*, AR
*شهيق / المزيد / زفير*, the app's own orb labels), a thin line shows the
breath split into its phases, and `navigator.vibrate` gives a pulse at each
phase change where the browser has it (Android). Nothing starts until the
visitor taps the button. With Reduce Motion the orb stays still. When the
three breaths end, the page shows the claim from a hard-coded **demo**
record (labelled as an example), the app's one question and the install
button.

- Behaviour: `assets/sigh.js`, one file for all three languages. Styles:
  the "Live sigh" block in `styles.css`.
- Words: each page passes its own on the `[data-sigh]` element
  (`data-label-inhale`, `data-label-top-up`, `data-label-exhale`,
  `data-label-done`, `data-breath-of`, `data-stop`, `data-again`,
  `data-claim` with `{k}` and `{n}`).
- **Timings mirror the app's engine**: protocol `P1` in the app repo's
  `packages/core/src/data/engine.json` (in 2 s, a little more 1 s, out 6 s,
  three breaths = 27 s). If P1 changes there, change `PHASES` and
  `BREATHS` in `assets/sigh.js` in the same release, and the "27 seconds"
  line on the three landing pages.
- The demo record is `DEMO_RECORD` in `assets/sigh.js`; the claim
  ("Lighter after 12 of 15 pauses") is computed from it.
- To test quickly, add `?speed=10` to a landing page URL: the breath runs
  ten times faster. RTL mirrors the layout, never the timing.

## Adding a blog post

A post is a plain `index.html` under `blog/<slug>/`. Copy the closest
existing post and edit it, then do the same under `fr/blog/<slug>/` and
`ar/blog/<slug>/`, and add the new entries to:

- each blog index (`blog/`, `fr/blog/`, `ar/blog/`)
- `sitemap.xml` (one `<url>` block per language, each carrying the three
  `xhtml:link` alternates)

There is no build step - what is in the repo is what is served.

## Store links

- iOS: `https://apps.apple.com/app/id6760224574`
- The Google Play CTA is currently hidden on the landing pages. The markup
  is preserved in an HTML comment in each landing `index.html`, and
  `.btn-play` remains in `styles.css`, so restoring it is a markup-only
  change.

## Deploy (GitHub Pages)

1. Push to `main`.
2. In GitHub -> Settings -> Pages:
   - Source: **GitHub Actions**
3. Wait for workflow `Deploy Static Site`.

## DNS for `softpause.app`

At your domain registrar, add apex records:

- `A` -> `185.199.108.153`
- `A` -> `185.199.109.153`
- `A` -> `185.199.110.153`
- `A` -> `185.199.111.153`

Optional `www`:

- `CNAME` -> `inarmag.github.io`

Then in GitHub Pages settings:

- set custom domain to `softpause.app`
- enable `Enforce HTTPS` when certificate is ready.

## experiments.json

The app downloads `https://softpause.app/experiments.json` to decide which
A/B tests run (see the app repo's `docs/AB_TESTING.md`). The master copy is
`docs/experiments/experiments.json` in the app repo: change it there, then
copy it here. The download carries nothing about the person. A test runs
only while its `status` is `"on"`; with every test `"off"`, every install
sees each test's default.
