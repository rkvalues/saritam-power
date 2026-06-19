# Saritam Power — website

Marketing site for **Saritam Power** — solar EPC, manufacturing and power
infrastructure. Clean energy, green energy across India.

Static site: **vanilla HTML / CSS / JS**, no build step. The signature "torch"
spotlight follows the cursor to reveal a blueprint grid; navigation is client-side
hash routing across eight pages (Home, Services, Projects, About, Capabilities,
Clients, Careers, Contact).

## Files
- `index.html` — markup for all pages, header and footer
- `styles.css` — design tokens, components and responsive rules
- `app.js` — hash routing, torch spotlight, scroll-reveal, mobile nav, contact form

## Run locally
Any static server from the project root, e.g.:

```bash
npx http-server . -p 4321
# then open http://localhost:4321
```

## Deploy (Vercel)
No configuration needed — Vercel auto-detects this as a static site and serves
the files as-is. Either import the GitHub repo in the Vercel dashboard, or run
`vercel --prod` from the project root.
