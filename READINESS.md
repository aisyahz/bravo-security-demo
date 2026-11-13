# Final production-readiness review

Completed locally on 11 November 2026. Updated engineering assessment: **88/100**, up from the supplied 74/100 audit score. Ready for protected IWHost staging review; public launch remains conditional on client approvals, hosting checks and verified mailbox receipt. No deployment or WordPress change was performed.

## Files changed in this completion pass

- `index.html`, `about.html`, `services.html`, `contact.php`: optimised logo references and favicon, social metadata/canonical links, removed fax placeholders, clearer header WhatsApp label. Contact also has strengthened validation/throttling, accurate transport-acceptance confirmation and a draft privacy notice. Services adds three intentional icon panels and replaces two unfinished operations graphics with information panels.
- `assets/css/style.css`: hero positioning and short-screen spacing, header/navigation targets, light-background label contrast, aligned service media/content/actions, operations panels and privacy notice styling.
- `assets/js/main.js`: phone validation matching the server, with the existing accessible interaction/feedback system preserved.
- New `includes/contact-security.php`, `includes/.htaccess`, root `.htaccess`: private shared throttling, guarded helper access and basic Apache response headers/compression.
- New `assets/img/bravo-logo-104.png`, `favicon-32.png`, `apple-touch-icon.png`: resized derivatives of the official artwork. Original logo unchanged. Header logo reduced from 270,432 to 16,862 bytes (93.8%).
- New `assets/images/social-preview.jpg`: sharing derivative of the approved hero. Original desktop/mobile hero and other approved photographs unchanged.
- New `sitemap.xml`, `tools/build-production.py`, `tests/security-check.cjs`, `tests/hero-check.cjs`, `tests/package-check.py`; updated `tests/ux-check.cjs` to isolate rate-limit test state.
- Updated `README.md`; added `DEPLOYMENT.md`, `CLIENT-APPROVALS.md`, this report, and generated `dist/Bravo-Production.zip` / `production-manifest.json`.

Other pre-existing working-tree changes were preserved. `operations.html` remains the existing redirect and is packaged unchanged.

## Fixes delivered

Phone validation now requires 7–15 actual digits, with optional leading + or international 00 and ordinary spaces, parentheses, dots and hyphens. Punctuation-only, short, excessive-digit and newline inputs are rejected. Both client and PHP enforce the rule.

A file lock protects persistent cross-session counters outside the website root. POST limits are 10 per address / 15 minutes; mail limits 5 per address / hour. Site-wide limits are 300 POST / 50 mail attempts per hour. Invalid submissions and failed mail attempts consume the applicable limits. Fresh sessions and forged forwarding headers do not bypass them. Existing CSRF, honeypot, session cooldown, whitelist validation, escaping and error feedback remain. Broken throttle storage fails closed. Success is shown only after PHP mail accepts the message; wording does not imply confirmed delivery.

Hero offset/cropping was corrected without replacing the photograph. Both CTAs fit the tested short screens. Header navigation targets meet 44px in both dimensions. Light-section eyebrow contrast is now 5.21:1 on #f3f3f3. All service cards have consistent media/content/action rows. The five-photo keyboard lightbox and reduced-motion behaviour remain. No fax value or company facts were invented. Existing claims are listed for approval, not treated as verified evidence.

## Tests performed

| Test | Result |
| --- | --- |
| Four substantive pages at 320, 375, 390, 430, 768, 1024, 1440 and 1920px (900px high) | 32 combinations passed: no horizontal overflow, loaded images, scroll reveals and mobile menu where applicable; no page JavaScript errors. |
| Hero / header at 320x568, 375x667, 390x844, 430x932, 768x1024, 1024x768, 1440x900, 1920x1080 | Both hero CTAs visible, no overflow, header targets >=44px, mobile navigation to Services passed. Screenshots captured; key mobile, tablet and desktop layouts inspected. |
| All 12 service links to quotation form | Correct preselection for every service. |
| Internal navigation | 41 distinct-per-page internal link/anchor checks passed, including footer and quotation links; operations redirect passed. |
| Lightbox and accessibility | Open, arrow navigation, Escape, focus return, menu Escape/focus, inline validation, reduced-motion and no-JavaScript navigation passed. |
| Phone validation | Invalid and valid domestic/international fixtures passed in browser and PHP. |
| Security | Invalid CSRF, honeypot, email header injection, unknown service, reflected script escaping, fresh-session throttling, spoofed forwarding header and corrupt-state fail-closed checks passed. |
| Form outcomes | Local intercepted SMTP acceptance and rejection passed; fields retained on failure, forged success URL rejected, same-session cooldown enforced. No external mail sent. |
| PHP / JavaScript syntax | Both PHP files lint clean; main.js syntax check passed. |
| ZIP | Explicit 30-file allowlist, archive CRC and per-file SHA-256 checks passed. Extracted package served all 27 public files; PHP rendered CSRF/no-store; direct helper URL rejected. |

Evidence: `tests/artifacts/results.txt`, `security-results.txt`, `hero-results.txt`, `package-results.txt` and screenshots. Tests use local desktop Chrome emulation, not physical phones. Apache .htaccess is not executed by PHP's development server.

## Production package

**`C:\Users\aisyah\Bravo\dist\Bravo-Production.zip` — 1,383,857 bytes (about 1.38 MB), 30 files.**

Contents: four substantive pages plus the legacy operations redirect; root .htaccess and sitemap; security helper and its deny rule; stylesheet and JavaScript; Lucide sprite and licence; three logo/favicon derivatives plus existing CSS SVG fallback; twelve referenced WebP photographs and one JPEG social image. The exact file list, sizes and SHA-256 hashes are in `dist/production-manifest.json`.

Excluded: PHP runtime/executables/DLLs, local tools, tests/screenshots, development dependencies, backups, repository files, docs, original large photograph PNGs, unused images and secrets. The older `bravo-latest.zip` is not a release package and must not be uploaded.

## Remaining release gates

1. Client sign-off on licensing/certification, 24/7 availability, training/capabilities, nationwide coverage and supplied business details. See CLIENT-APPROVALS.md for exact claims and required evidence.
2. Approve the draft enquiry privacy notice, actual retention/processor arrangements, privacy contact workflow and any additional disclosures.
3. IWHost: private persistent throttle storage / locking, real visitor address behind proxies, PHP configuration, HTTPS cookies, Apache headers/compression and private-file restrictions.
4. Verify actual email receipt and spam placement, authorised sender and domain authentication. Local mail acceptance is not evidence of delivery.
5. Real iOS/Android testing, app handoffs, Google Maps and slow-network behaviour on staging. Confirm final canonical/social/sitemap domain and paths.

Follow DEPLOYMENT.md to use a separate, password-protected, non-indexed staging subdomain. Do not extract into or overwrite the live WordPress root. Production deployment is outside this task and has not been attempted.
