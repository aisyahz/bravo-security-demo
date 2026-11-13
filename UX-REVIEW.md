# Bravo Security UX upgrade

Completed locally on 11 November 2026. No deployment or live WordPress edits.

## Findings and changes

- Removed the blocking homepage welcome overlay. Retained the official logo,
  approved hero and guard imagery, company details, service descriptions and
  existing black/red design. The supplied mockup informed polish only.
- Replaced mixed custom icons and numbered feature icons with a local, 3.9 KB
  Lucide SVG sprite. Consistent 24 px geometry and 2 px strokes, with smaller
  button icons, red accents on dark backgrounds and suitable contrasting colors
  on white/image backgrounds. License included. Source:
  [Lucide static assets](https://lucide.dev/guide/static) and
  [Lucide icons](https://github.com/lucide-icons/lucide/tree/main/icons).
- Fixed scroll reveals that previously hid whole sections: a section taller than
  the viewport could fail the old intersection threshold. Smaller elements now
  reveal once, with transitions on both states and restrained stagger timing.
  Reduced-motion users see static content. No animation dependency was added.
- Added navigation hover underlines, immediate keyboard exclusion of closed
  mobile menus, Escape/focus return, outside-click closing, breakpoint reset,
  skip links and a footer back-to-top link. Header background uses an observer
  instead of a scroll listener. Navigation also works without JavaScript.
- Added service-specific quotation links for all 12 services. The PHP form
  preselects only an approved service value. Existing WhatsApp enquiry links
  remain available. Service media is now HTML rather than JavaScript insertion,
  reserving layout space and working without JavaScript.
- Added a native-dialog operations lightbox for the five supplied photographs:
  labeled controls, previous/next arrows, Escape, focus containment and focus
  restoration. Existing captions and image qualifications remain. The small
  gallery did not need category filters.
- Added inline form validation, focus states, pending status, duplicate-submit
  prevention and server-confirmed success/error feedback. Fields remain intact
  on failure. Native PHP POST remains available without JavaScript.
- Fixed a false-success path: `?sent=1` alone can no longer show confirmation.
  Success requires a one-time session flag written only after `mail()` accepts
  the message. Honeypot submissions return an error instead of false success.
  Invalid submissions return HTTP 422; existing CSRF and rate limits remain.
- Optimized 13 PNGs into WebP derivatives: 24,934,619 bytes to 1,305,764 bytes
  (94.8% smaller for this image collection). Original PNGs remain intact.
  Added intrinsic image dimensions and retained lazy loading below the fold.
  The existing Kuala Lumpur skyline is retained in both About sections.
- Improved touch targets, mobile CTA wrapping and icon contrast. Floating
  WhatsApp hides near other contact actions to reduce overlap.

## Modified / added files

| Files | Purpose |
| --- | --- |
| `index.html`, `about.html`, `services.html` | Icons, optimized images/dimensions, skip/back-to-top links; service quotation links and static media |
| `contact.php` | Shared interface changes, service preselection, session-backed confirmation and HTTP response handling |
| `assets/css/style.css` | Reusable motion, responsive navigation, focus/validation, gallery and interaction styles |
| `assets/js/main.js` | Navigation, observers, accessible lightbox and progressively enhanced form |
| `assets/icons/lucide.svg`, `assets/icons/LICENSE` | Local icon subset and attribution |
| `assets/images/*.webp` | Optimized derivatives of existing approved assets |
| `dev-server.js` | WebP MIME type for static preview |
| `tests/ux-check.cjs`, `tools/setup-php.py` | Local browser/PHP test harness and hash-verified local PHP setup |
| `.gitignore`, `README.md`, `UX-REVIEW.md` | Local tool/test exclusions and documentation |

Existing uncommitted work was preserved. `operations.html` remains the legacy
redirect. The existing `Bravo-cPanel-Upload.zip` was not rebuilt and is stale.

## Verification

Chromium desktop browser with responsive viewport emulation, height 900 px:

| Width | Home | About | Services | Contact |
| --- | --- | --- | --- | --- |
| 320 | Pass | Pass | Pass | Pass |
| 375 | Pass | Pass | Pass | Pass |
| 390 | Pass | Pass | Pass | Pass |
| 430 | Pass | Pass | Pass | Pass |
| 768 | Pass | Pass | Pass | Pass |
| 1024 | Pass | Pass | Pass | Pass |
| 1440 | Pass | Pass | Pass | Pass |
| 1920 | Pass | Pass | Pass | Pass |

All 32 combinations passed horizontal-overflow, image-loading and scroll-reveal
checks, plus mobile menu checks where applicable. After final polish, repeated
the four pages at 320, 375, 390, 430 and 1440 px. Visually inspected mobile and
desktop screenshots. Artifacts are in `tests/artifacts/` (ignored by Git).

Additional passing checks:

- 78 internal links/anchors resolve; referenced local images/scripts exist.
- Every WhatsApp destination remains `60172441959`; no external message sent.
- Mobile open/close, Escape and focus return; service-to-quotation preselection.
- Gallery opening, arrow-key navigation, Escape and restoration of opener focus.
- Required field validation; PHP success through a local in-memory SMTP receiver.
- PHP transport rejection, rate limiting and invalid CSRF produce errors without
  clearing entered information. Forged success query does not show confirmation.
- Reduced-motion mode, no-JavaScript navigation/service links, legacy operations
  redirect, PHP syntax and JavaScript syntax. No browser JavaScript errors.

The SMTP receiver intercepts messages locally; it never contacts Bravo's inbox.
PHP `mail()` acceptance is not proof of final inbox delivery. Real host mail
configuration/delivery remains to be tested on authorized staging. These checks
do not substitute for physical iOS/Android or Safari testing, a screen-reader
audit, or measured Core Web Vitals on the hosting environment.

## Repeating local tests

Requires Python for `tools/setup-php.py`, Node 22+ and Playwright. The setup script
downloads PHP from the official Windows PHP distribution, verifies its published
SHA-256 and extracts it only into ignored `.local-tools/php/`.

```powershell
python tools/setup-php.py
# Point to an installed Playwright package if it is not locally resolvable:
$env:PLAYWRIGHT_PATH = 'path\to\node_modules\playwright'
node tests/ux-check.cjs
```

The harness uses installed Chrome at its standard Windows location, binds PHP
to `127.0.0.1:5511` and the intercepted SMTP receiver to `127.0.0.1:2526`, and
stops both after testing. `UX_WIDTHS` optionally limits viewport widths. Local
tooling, test artifacts and originals need not be included in a future upload.

This earlier upgrade note is superseded for final readiness, packaging and test status by READINESS.md, DEPLOYMENT.md and CLIENT-APPROVALS.md.
