# Bravo Security Network website

Four substantive pages: Home (`index.html`), About (`about.html`), Services and Operations (`services.html`, 12 services), and Contact (`contact.php`). `operations.html` redirects legacy links. HTML, CSS, vanilla JavaScript and PHP; no production build dependencies.

This is a local staging candidate, not an approved live release. WordPress has not been changed. Read `CLIENT-APPROVALS.md`, `DEPLOYMENT.md` and `READINESS.md` before handover.

## Local preview

From the project directory, run `.local-tools/php/php.exe -S 127.0.0.1:5500 -t .`, then open http://127.0.0.1:5500/. The PHP runtime is a local tool and is never packaged. Static-only preview tools cannot process enquiries. Local preview does not prove email delivery. Do not expose the development server publicly.

## Contact form

Requires PHP 8.0+ syntax, sessions, random_bytes, JSON, flock and a configured mail transport. Use a currently supported PHP version provided by IWHost; local tests use PHP 8.4.27. Server-side validation, CSRF, honeypot, escaped errors, session cooldown and atomic cross-session throttling are enabled.

Limits: 10 POST attempts per address per 15 minutes, 5 mail attempts per address per hour, plus site-wide 300 POST / 50 mail attempts per hour. Failed transport attempts count. Shared-office users share a limit; WhatsApp and email remain alternatives. Limits apply to REMOTE_ADDR, never untrusted forwarding headers. Ask the host to restore the true client address for trusted proxies.

The JSON throttle store defaults to an application-specific directory under the PHP system temp directory, outside the website root. It contains a random salt, HMAC address identifiers and timestamps, not enquiry contents. Old buckets are pruned on subsequent requests. Configure BRAVO_RATE_LIMIT_DIR to a private persistent directory outside every public document root if the host clears temp frequently or requires it for open_basedir. Keep it writable only by the PHP account. Corrupt/unwritable storage blocks submissions with an accurate error, not success. Multiple web servers require shared lock-compatible storage or host-level throttling.

A success response means PHP mail transport accepted the enquiry for sending. It does not prove inbox delivery. Mailbox receipt, spam handling and sender-domain authentication must be tested on staging.

## Assets and interaction

Official logo and original hero images are retained unchanged. Smaller PNG logo/favicon derivatives preserve the artwork. Published photographs use WebP, the About section uses the Kuala Lumpur skyline, and the five-image operations lightbox supports keyboard controls. Abstract information panels are not presented as client-site photographs. Lucide icons are self-hosted with their licence. IntersectionObserver animations respect reduced-motion preferences.

## Tests and packaging

Set PLAYWRIGHT_PATH to the installed Playwright package, then run `node tests/ux-check.cjs`, `node tests/security-check.cjs` and `node tests/hero-check.cjs` using Node 22. These local scripts use Chrome and the local PHP executable; security tests intercept SMTP without sending external mail. The hero check uses the preview on port 5500. Results and screenshots are under tests/artifacts and are excluded from distribution.

Run `python tools/build-production.py` with Python 3.9+ to create `dist/Bravo-Production.zip` and its SHA-256 manifest. The explicit 41-file allowlist excludes tools, tests, runtime binaries, dependencies, source PNG photographs, backups, docs and secrets. Do not upload the older `bravo-latest.zip`: it includes local development tools. Deployment instructions are in DEPLOYMENT.md.
