# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Primary: people already interested in Jack who want to know more about him. They arrive from one of his open-source projects, his resume, a job application, or LinkedIn, and already have most of the career context and a way to reach him.
- Secondary: peers and network (founders, engineers, former colleagues) who want a current picture of what he is doing now.

## Product Purpose

jackchu.com is Jack Chu's personal site at https://jackchu.com/: a page about him, not a hire-me marketing page. It covers who he is, what he is working on now, a brief job history, his projects, and life outside work, and links to email, GitHub, LinkedIn and his resume (stable alias https://jackchu.com/resume/pdf/). Content model follows personal sites like brittanychiang.com, taniarascia.com and lynnandtonic.com. Success is a visitor who leaves knowing who Jack is and what he is up to.

## Positioning

Builder-leader: a startup engineering leader who builds engineering organizations (with product and design alongside), ships the product while doing it, and still architects and codes, these days more with AI agents. Domains: e-commerce and omnichannel retail, more recently health and wellness.

## Operating Context

- Hugo static site with project-owned layouts (`layouts/`), styles and scripts (`assets/`) and self-hosted fonts (`static/fonts/`); no theme. Builds on Hugo 0.92 locally and the latest Hugo in CI.
- Content is data-driven from `data/homepage.yml`; section order is set in `layouts/index.html`.
- Deployed to GitHub Pages by `.github/workflows/gh-pages.yml` on merge to `main`.
- Contact details (`mailto:jack@jackchu.com`, LinkedIn, GitHub) are available but secondary; Google Tag Manager is the only analytics.

## Capabilities and Constraints

- Single-page homepage: cover, About (story, hobbies, and a dated Now list), Experience (with per-company blurbs), Projects, Education, and a closing Elsewhere sheet.
- The resume PDF is the source of truth for all career claims. Do not invent metrics, clients, testimonials, or titles; the site currently lists only the Director title for Bonobos where the resume shows three.
- No primary call to action. Email stays a plain mailto link; no forms or additional trackers.
- The theme may be replaced or heavily customized; Hugo and GitHub Pages hosting are fixed.

## Brand Commitments

Name "Jack Chu" and role "CTO / VP Engineering". Voice is first person and plain-spoken. Keep the design-sprint photo and the selfie. Visual world: see DESIGN.md.

## Evidence on Hand

- Resume PDF at jackchu.com/resume with roles, team sizes and budgets (e.g. Away: 3 consultants to 30+, $9M+; Modern Age: zero to 21, launched in six months).
- Five roles on the site: fête, Legacy, Modern Age, Away, Bonobos.
- Photos: `static/img/showcase/design-sprint-photo.jpg` (design-sprint wall) and `static/img/who-am-i/jack-picture.jpg` (selfie).
- No testimonials, case studies, or press are on hand; do not fabricate them.

## Product Principles

1. Credibility from specifics: concrete team sizes, scope and domains beat adjectives.
2. Builder and leader together: show both the org-building and the hands-on work.
3. The resume is the authority for career facts; the site adds the person around them.
4. Inform, do not sell. Personal and first person; links are quiet, never pushed.
5. Keep the Now list current; it carries an "Updated" month.
