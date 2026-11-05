# jackchu.com

This repository contains the Hugo site for [jackchu.com](https://jackchu.com/). The layouts, styles and fonts live in this repository (`layouts/`, `assets/`, `static/`), with page content in `data/homepage.yml`. It deploys to GitHub Pages.

## Run the site locally

Start the Hugo development server:

```sh
hugo server
```

Open `http://localhost:1313/` in a browser.

## Deploy the site

The [GitHub Pages workflow](.github/workflows/gh-pages.yml) builds and deploys changes merged into `main`.
