# SEO operations for Frontier DevConsults

## Positioning and keyword map

The website targets business intent rather than isolated fragments such as `front` or `dev`. Use the phrases naturally; do not repeat them merely to increase frequency.

| Page | Primary search intent | Market emphasis |
| --- | --- | --- |
| `/` | custom software and embedded systems development | Accra and Ghana first |
| `/services/custom-software-development-ghana` | custom software development Ghana | Ghana, Africa, worldwide |
| `/services/flutter-mobile-app-development-ghana` | Flutter and mobile app development Ghana | Ghana and Africa |
| `/services/web-application-development-ghana` | web application development Ghana | Ghana and worldwide |
| `/services/ai-integration-africa` | AI integration and automation Africa | Ghana and Africa |
| `/services/embedded-iot-engineering` | embedded systems, IoT, hardware-software co-engineering | Ghana, Africa, worldwide |

Brand wording should include `Frontier DevConsults` and the natural variant `Frontier Dev Consults` where useful. Titles, headings, and body content must remain readable and page-specific.

## Search-platform activation

The production site has environment-backed Google and Bing verification meta tags. Empty values emit no placeholder tag. DNS verification is preferred for the Google domain property because the domain uses Vercel DNS; the meta-tag environment variable remains a supported fallback.

These steps require the owner's genuine external accounts and tokens and cannot be completed from source code alone:

1. Add the `frontier-devconsults.com` domain property in Google Search Console and place Google's genuine TXT record in Vercel DNS. Alternatively, add the `https://frontier-devconsults.com` URL-prefix property, copy only the genuine HTML-tag token into the server-side `GOOGLE_SITE_VERIFICATION` Vercel environment variable, redeploy, then verify.
2. Submit `https://frontier-devconsults.com/sitemap.xml` and inspect the homepage plus all five service pages for indexing.
3. Create or import the site in Bing Webmaster Tools. Set its HTML verification value as `BING_SITE_VERIFICATION`, redeploy, verify, and submit the same sitemap.
4. Claim and verify the Google Business Profile using the real business name, Greater Accra service/location details, current telephone numbers, website, hours, services, and genuine project photos. Keep these facts consistent everywhere.
5. Request genuine client reviews after completed work. Never purchase, fabricate, or gate reviews.

## IndexNow operations

`INDEXNOW_KEY` is a server-only Vercel environment variable containing 8-128 letters, numbers, or hyphens. When configured, `/indexnow-key.txt` returns the exact key for search-engine validation. Publication endpoints submit only affected public production URLs; unchanged updates and repeat submissions within five minutes are suppressed. A submission failure is logged and never rolls back or blocks a content publication.

The authenticated `POST /api/admin/indexnow` endpoint accepts `{ "urls": ["https://frontier-devconsults.com/path"] }` for an owner-approved major static metadata/content update or public URL deletion. It rejects non-production, query-string, private, and unknown route families. Do not use it for unchanged pages.

## Measurement

The existing opt-in first-party monitoring records anonymous page views, attribution, and enquiry submissions. Review organic landing pages and submitted enquiries monthly. Add Google Analytics only after selecting an account/property, supplying a measurement ID, and confirming the consent and privacy configuration; do not introduce third-party tracking silently.

Track monthly:

- Search Console impressions, clicks, click-through rate, average position, indexed pages, and query/landing-page pairs.
- Organic contact submissions and build requests.
- Core Web Vitals and mobile usability.
- Google Business Profile calls, website visits, direction requests, and reviews.
- Referring domains and qualified brand mentions.

## Publishing cadence

Publish one substantial, evidence-led item every two to four weeks. Each article should answer a real client question, identify an author/reviewer, show an accurate update date, link to the relevant service and case study, and avoid invented outcomes.

Initial topics:

1. Building offline-first Flutter applications for African network conditions.
2. Connecting sensors, embedded controllers, APIs, and monitoring dashboards.
3. Choosing between custom software and an off-the-shelf platform in Ghana.
4. Safely integrating AI into a production business workflow.
5. A case-study expansion covering problem, constraints, approach, stack, validation, and owner-approved outcome.

Quarterly, review Search Console evidence, refresh pages that receive impressions without clicks, remove obsolete claims, test structured data, and update sitemap dates only for pages whose content materially changed.
