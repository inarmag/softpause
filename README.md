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
index.html                   en  landing page
fr/  ar/                     fr / ar landing pages
privacy/                     en  privacy policy   (+ fr/privacy/, ar/privacy/)
blog/                        en  blog index       (+ fr/blog/,    ar/blog/)
blog/<slug>/                 en  blog post        (+ fr/...,      ar/...)
breathing/ anxiety/ reset/   en  evergreen guides (+ fr/...,      ar/...)
styles.css                   shared styles for every page
assets/                      logo, plant SVGs, screenshots
sitemap.xml  robots.txt      all 24 URLs, with hreflang alternates
CNAME                        custom domain for GitHub Pages
```

Every page carries `hreflang` alternates for all three languages plus
`x-default`, and the header has a language switcher linking to the same
page in the other two languages.

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
