Short specification: Jekyll site using Just the Docs
Purpose

Present publications, their AI reviews, and principle-based complaints clearly with minimal ongoing maintenance
Prioritize NZMC principles (P1, P4, P6, Conflicts of Interest) with cross-links and search
Platform and theme

Static site built with Jekyll
Theme: Just the Docs (docs-style navigation + built-in search)
Hosting: GitHub Pages
Build: GitHub Actions (recommended by Just the Docs) to render the site and publish to Pages
References:
Configuration: https://just-the-docs.com/docs/configuration/
Customization (color schemes, overrides): https://just-the-docs.com/docs/customization/
Information architecture

Use Jekyll collections to group content and show them in the left sidebar:
articles: original Crux articles
reviews: AI reviews mapped to each article
principles: P1, P4, P6, Conflicts of Interest overview pages
complaints: principle-based complaint documents referencing multiple reviews
nzmc-cases: historical NZMC complaints
facebook: optional section for posts + reviews
Each item is a Markdown file with front matter (title/date/links/principles)
Navigation and search

Sidebar navigation includes all collections with names and optional folding (nav_fold)
Built-in Lunr search enabled; can exclude specific collections from search if needed
Breadcrumbs and in-page headings enabled by default
URLs and structure

One directory per collection (e.g., _articles, _reviews, _principles, _complaints, _nzmc-cases, _facebook)
Permalinks per collection: "/:collection/:path/"
Optional collections_dir if you prefer grouping all collections under a parent folder
Color scheme and future customization

Start with light (default) or dark color scheme; can switch later via _config.yml
For text color and brand tweaks, define a custom color scheme (e.g., media) under _sass/color_schemes/media.scss and set color_scheme: media
Small CSS tweaks go in _sass/custom/custom.scss (recommended approach per docs)

Minimal configuration (example)

Color scheme toggle now (optional)

Future custom text color (example)

Activate custom scheme later

Content front matter (example)

Notes

Keep filenames and slugs stable for reliable cross-linking
Use front matter fields consistently (title, date, principles, source_url, related_review, etc.)
You can fold large collections (nav_fold: true) to keep the sidebar manageable
If you’d like, I can also provide a one-file starter _config.yml you can paste in when you’re ready to initialize the site.