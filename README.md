# chadwadden.ca

Personal brand website for Chad Wadden — educator, coach, and writer.

## Structure

```
/                   → Homepage (index.html)
/blog/              → Writing index + individual posts
/coaching/          → Coaching performance hub
/resources/         → Free + paid resource downloads
/css/style.css      → Full site stylesheet
/js/main.js         → Tabs, nav, interactions
/images/            → Photos and infographics
```

## To Do

- [ ] Add photo to about section (`images/chad-wadden.jpg`)
- [x] Connect Kit newsletter form
- [ ] Connect Gumroad links for paid resources
- [ ] Set up custom domain (chadwadden.ca or .com)
- [x] Add GA4 page, campaign, article, demo, live-tool, evidence-image, and newsletter funnel tracking
- [ ] Build resources/index.html page
- [ ] Add more blog posts

## Deploy

Push to `main` branch of `macchady-spec/chadwadden` on GitHub.  
Enable GitHub Pages → Deploy from branch → `main` → `/ (root)`.  
Point custom domain in repo Settings → Pages → Custom domain.

## TRACE measurement

GA4 measurement ID: `G-JR7LL2L3DE`.

The TRACE article records privacy-safe events only: `campaign_landing_view`,
`article_progress`, `article_engaged_60s`, `demo_start`, `demo_progress`,
`demo_complete`, `try_tool`, `evidence_image_open`,
`newsletter_form_start`, and `newsletter_form_submit`. No form values, email
addresses, or student content are sent to analytics.

Configure Kit's confirmed-subscription redirect to:
`https://chadwadden.ca/newsletter-confirmed.html`. That page records the GA4
recommended `generate_lead` event once per browser session after confirmation.
