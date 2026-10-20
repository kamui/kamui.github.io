# jackchu.com

This repository contains the Hugo site for [jackchu.com](https://jackchu.com/). It uses the [Raditian Free Hugo Theme](https://github.com/radity/raditian-free-hugo-theme) and deploys to GitHub Pages.

## Run the site locally

Clone the theme submodule, then start the Hugo development server:

```sh
git submodule update --init --recursive
hugo server
```

Open `http://localhost:1313/` in a browser.

## Deploy the site

The [GitHub Pages workflow](.github/workflows/gh-pages.yml) builds and deploys changes merged into `main`.
