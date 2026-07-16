# PawClinic Theme — HubSpot Setup (manual UI steps)

Everything in code is uploaded to Design Manager (theme
`alan-pets-clinic-hubspot-theme`, portal **245981171 / production**). The steps
below can only be done in the HubSpot UI — the `hs` CLI can't create pages, forms,
languages, or dynamic-page settings.

Do them in this order.

## 1. Create the pages (from templates)

In **Marketing → Website → Website Pages → Create**:

| Page | Template | Suggested slug |
|------|----------|----------------|
| Home | Base Page | `/` |
| Services | Base Page | `/services` |
| Booking / Contact | Base Page | `/booking` |
| Doctors (listing + profiles) | **Doctor Profile (Dynamic)** | `/doctors` |
| Campaign landing | **Campaign Landing Page** | `/campaign` (or the promo slug you want) |

For the Base-Page pages, drag the modules you want into the page's content area
(hero-carousel, trust-badges, services-hubdb, doctors-hubdb, booking-form, etc.).
The Campaign and Doctor Profile pages come pre-composed by their templates.

## 2. Doctor Profile dynamic pages

The **Doctor Profile (Dynamic)** template is already bound to the `clinic_doctors`
HubDB table (`dynamicPageHubDBTable: 3092647629`, `useForPages: true`).

- The page you create at `/doctors` automatically generates a detail page for every
  doctor row at `/doctors/<path>` (e.g. `/doctors/emily-carter`).
- The base URL (`/doctors`) shows the listing; each card links to its detail page.
- On the **home page**, set the doctors teaser module's **Profile Page Base URL**
  field to match this slug (default `/doctors`).
- ⚠️ Do not delete/recreate the `clinic_doctors` table — its ID is pinned in the
  template. Edit rows in **Marketing → Files and Templates → HubDB** instead.

## 3. Bilingual 繁體中文

In **Settings → Website → Pages → Languages** (or the page's language menu):

1. Set English as the primary language for each page.
2. Add **繁體中文 (zh)** as a translation of each page, and translate the module-field
   copy (headings, CTAs, etc.) on each ZH variant.
3. HubDB content switches automatically: the modules render `*_zh` columns when the
   page language starts with `zh`. No per-row work needed.
4. The header language switcher (`{% language_switcher %}`) appears automatically once
   a page has a published translation.

## 4. Real booking form (lead capture)

Today `booking-form.module` shows a client-side "Booking Received" demo message until a
real HubSpot Form GUID is set. The module now submits the collected values to the
**HubSpot Forms Submissions API v3** (`js/form-steps.js`), mapping the custom 3-step UI
to standard contact properties — so real leads flow once you wire a form:

1. **Marketing → Forms → Create form** (Regular/Embedded form) that includes these
   default contact fields: **First name, Last name, Email, Phone number, Message**.
   (Pet type / pet name / service / doctor / date / time / notes are combined into the
   **Message** field, so no custom properties are required to get started.)
2. Copy the form's **GUID** (Share → Embed, or from the form URL).
3. Open a page using the booking form → edit the **Booking Form** module → paste the
   GUID into **HubSpot Form ID**. **HubSpot Portal ID** is already `245981171`.
4. Set the module's **HubSpot Data Center Region** field (`na1` default; use `eu1` for
   EU-hosted portals) — no code edit needed.

On submit the module POSTs to
`https://api.hsforms.com/submissions/v3/integration/submit/<portalId>/<formGuid>`;
a 200 shows the success state, an error surfaces inline. With no GUID set it stays in
client-side demo mode.

Optional: if you'd rather store pet type / service / date in their own contact
properties (instead of bundled in Message), create those custom properties + matching
form fields, then extend the `fields` array in `js/form-steps.js`.

## Re-uploading after code changes

```bash
npm run build && hs upload . alan-pets-clinic-hubspot-theme --account=production
```
