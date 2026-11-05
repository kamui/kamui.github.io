# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences, weighted equally:

- Hiring decision-makers (CEOs, boards, investors, recruiters) vetting Jack for a CTO / VP Engineering role. Their job: decide quickly whether he is credible and worth an email.
- Peers and network (founders, engineers, former colleagues) who already know him and want a current reference for what he is doing now.

## Product Purpose

jackchu.com is Jack Chu's personal site at https://jackchu.com/. It presents who he is, where he has worked, and how to reach him, and links to his resume (https://jackchu.com/resume/jack-chu_resume-ddb0685e.pdf), LinkedIn, GitHub, Twitter and Instagram. Success is a qualified visitor emailing him.

## Positioning

Builder-leader: a startup engineering leader who builds engineering organizations (with product and design alongside), ships the product while doing it, and still architects and codes, these days more with AI agents. Domains: e-commerce and omnichannel retail, more recently health and wellness.

## Operating Context

- Hugo static site (Hugo 0.92) using the Raditian Free Hugo Theme as a git submodule at `themes/raditian-free-hugo-theme`; project overrides live in `layouts/partials/`.
- Content is data-driven from `data/homepage.yml`; section order is `params.sections` in `config.toml`.
- Deployed to GitHub Pages by `.github/workflows/gh-pages.yml` on merge to `main`.
- Primary contact is `mailto:jack@jackchu.com`; Google Tag Manager is the only analytics.

## Capabilities and Constraints

- Single-page homepage: hero, "Who am I?", Experience (with per-company blurbs), Education.
- The resume PDF is the source of truth for all career claims. Do not invent metrics, clients, testimonials, or titles; the site currently lists only the Director title for Bonobos where the resume shows three.
- Contact stays a plain mailto link; no forms or additional trackers.
- The theme may be replaced or heavily customized; Hugo and GitHub Pages hosting are fixed.

## Brand Commitments

Name "Jack Chu"; hero greeting "Hello, I’m Jack." and subtitle "CTO / VP Engineering". Voice is first person and plain-spoken. No other visual commitments were made.

## Evidence on Hand

- Resume PDF at jackchu.com/resume with roles, team sizes and budgets (e.g. Away: 3 consultants to 30+, $9M+; Modern Age: zero to 21, launched in six months).
- Five roles on the site: fête, Legacy, Modern Age, Away, Bonobos.
- Existing hero image `static/img/showcase/design-sprint.png`.
- No testimonials, case studies, or press are on hand; do not fabricate them.

## Product Principles

1. Credibility from specifics: concrete team sizes, scope and domains beat adjectives.
2. Builder and leader together: show both the org-building and the hands-on work.
3. The resume is the authority; the site is a faster, friendlier front door to it.
4. Make the next step obvious: one clear way to contact Jack.
