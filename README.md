# Bravo Security Network Sdn Bhd — One-Page Website (DEMO)

A lightweight, static, single-page corporate landing site. No build tools, no
backend, no database. Just HTML, CSS and vanilla JS — ready to upload to iWHOST
hosting when approved.

> **This is a DEMO.** Content marked `CLIENT TODO` and statistics shown as
> `XX+` / `XXX+` are placeholders awaiting confirmed information.

---

## File structure

```
Bravo/
├─ index.html              All page sections + SEO meta tags
├─ README.md               This file
└─ assets/
   ├─ css/style.css        Design system (colors, type) + responsive layout
   ├─ js/main.js           Nav, smooth scroll, active link, reveal, form (demo)
   └─ img/
      ├─ logo.svg          Temporary logo mark      (CLIENT TODO: replace)
      ├─ favicon.svg        Browser tab icon         (CLIENT TODO: replace)
      ├─ hero.svg          Hero background placeholder (CLIENT TODO: replace)
      └─ about.svg         About image placeholder    (CLIENT TODO: replace)
```

---

## How to preview locally

You only need a browser. Two options:

**Option A — double click**
Open `index.html` directly in your browser. Everything works except the
Google Fonts require internet.

**Option B — local server (recommended, matches hosting)**
From this folder, run one of:

```powershell
# If you have Python installed
python -m http.server 5500
```

Then open: http://localhost:5500

(If you use VS Code, the "Live Server" extension also works — right-click
`index.html` → "Open with Live Server".)

---

## Confirmed business details currently used

| Field   | Value |
|---------|-------|
| Company | Bravo Security Network Sdn Bhd |
| Website | https://bravosecuritynetwork.com.my/ |
| Phone   | 03-9226 9786 (used for Call + WhatsApp + email links) |
| Address | Tingkat 4, Blok G, Excella Business Park, Jalan Ampang Putra, Taman Ampang Hilir, 55100 Kuala Lumpur, Selangor |

## NOT confirmed — do NOT publish until client supplies

- KDN licence number
- WhatsApp number (currently reuses the office line as a placeholder)
- Email address (currently `info@bravosecuritynetwork.com.my` placeholder)
- Statistics: years / trained personnel / clients (`XX+`, `XXX+`)
- Coverage claim (e.g. "Nationwide")
- Real client names / logos + permission to display
- Social media links (Facebook / LinkedIn / Instagram)
- Exact brand red & gold hex values
- Real photography (hero, about, services, clients)

---

## Where to edit things

- **Business details / links:** search `index.html` for `CLIENT TODO`.
- **Phone / WhatsApp / email:** update the `tel:`, `wa.me` and `mailto:` links
  in `index.html` (Hero, Contact and Footer). Also `TO_EMAIL` in
  `assets/js/main.js`.
- **Statistics:** the "Statistics strip" section in `index.html`
  (elements with `data-field="..."`).
- **Brand colors:** the `:root` tokens at the top of `assets/css/style.css`
  (`--red`, `--gold`).
- **Images:** drop real files into `assets/img/` and update the paths in
  `index.html` (about image) and `assets/css/style.css` (hero background).

---

## Notes on the contact form

The form is a working UI but has **no backend** in this demo. On submit it
validates and opens the visitor's email client (mailto fallback). When you're
ready to receive submissions on the live site, wire it to a service such as
Formspree — this is out of the current RM400 scope and can be quoted separately.
```
