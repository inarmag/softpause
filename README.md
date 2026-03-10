# SoftPause Website

Official landing site for SoftPause app.

## Live URLs

- GitHub Pages default: `https://inarmag.github.io/softpause/`
- Custom domain: `https://softpause.app`

## Structure

- `index.html` - main landing page
- `styles.css` - shared styles
- `assets/` - logo + screenshots
- `breathing/`, `anxiety/`, `reset/` - SEO pages
- `sitemap.xml`, `robots.txt`
- `CNAME` - custom domain for GitHub Pages

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
