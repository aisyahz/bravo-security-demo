# Website image assets

The approved desktop hero (`hero-security.png`) and mobile hero
(`hero-security-mobile.png`) are already connected to the homepage and must not
be replaced. The official company logo is separate at `assets/img/` and must
not be recreated.

## Images currently in the project

- `hero-security.png` — approved desktop hero.
- `hero-security-mobile.png` — approved portrait hero for screens up to 720px.
- `about-team.png` — illustrative team image used in the homepage About section.
- `armed-guard.png` — supplied Armed Guard service image.
- `k9-security.png` — supplied K9 service image.
- `visitor-assistance.png` — supplied image used for Static Security Guard.
- `mobile-patrol.png` — supplied patrol image used on the homepage, service
  card and operations panel.
- `cctv-monitoring.png` — supplied CCTV image used for CCTV and
  tracking/monitoring previews.
- `entrance-security.png` — supplied entrance-guard image used in Security
  Personnel operations.
- `operations-team.png` — supplied team image used in the Security Team
  Briefing panel.
- `mobile-escort.png` — supplied close-protection image used for Mobile Escort
  Services.
- `industrial-security.png` — supplied warehouse-inspection image used for
  Security and Safety Equipment and Security Risk Assessment.
- `kuala-lumpur-skyline.png` — supplied Kuala Lumpur skyline used in the About
  section on the homepage and About page.
- `bodyguard.png` — supplied executive security image used for Bodyguard /
  Close Protection.
- `event-security.png` — supplied red-carpet security image used for Event
  Security Management.
- `cash-in-transit.png` — supplied cash transport image used for Cash in
  Transit.
- `corporate-security.png` — supplied lobby checkpoint image used for
  Corporate Security operations.

Supplied personnel images should not be presented as verified photographs of
Bravo staff or client sites unless the company confirms their details. Do not
alter faces in supplied photographs. The Armed Guard image includes a firearm;
use it only if it accurately represents an authorized service.

## Image coverage

All service cards and Security Operations cards on the Services page now have
photos. No image placeholders remain in those sections. PNG originals are
retained here; optimized WebP versions are used by the website and included in
the production package.

The latest supplied WebP images are stored in `assets/img/` and used once each
on the Services page: entrance guard, industrial patrol, team portrait, visitor
welcome, urban patrol and control room.

Use landscape compositions for service and operations images (16:9, around
1600 × 900 px). WebP is preferred for newly generated images. Keep faces and
important details near the center to accommodate responsive `object-fit:
cover` crops. The current Services page does not contain a separate operations
gallery, so gallery-specific images are not needed unless that section is
added later.

Future generated guard images should remain photorealistic, show diverse
fictional Malaysian men, and avoid invented logos, readable badges, company
names or watermarks. Do not alter faces in supplied photographs.
The homepage hero is eager-loaded at high priority; other image slots are
lazy-loaded. If responsive variants are prepared, add them via `srcset` and
`sizes` on the existing image elements rather than restructuring the pages.
