# Ismam Ferdous - Personal Website

Static personal portfolio built with HTML, CSS, and JavaScript. The site files are at the repository root; no dependencies or build step are required.

## Update content

Edit `content.js` to change projects, experience, coursework, readings, and other folder content. Photography starts empty; add a photo record to `window.PHOTOGRAPHS` only after adding its image under `assets/photos/`.

The resume preview and download are in `assets/documents/`. Replace both the PDF and PNG when updating the resume.

## Preview locally

Run `python3 -m http.server 4173 --bind 127.0.0.1` from this directory, then open `http://127.0.0.1:4173/`.

## Cloudflare Pages

In Cloudflare, choose **Workers & Pages > Create application > Pages > Import an existing Git repository**, then select `iferdous/iferdous.github.io`.

- Production branch: `main`
- Framework preset: None
- Build command: `exit 0` (or leave blank)
- Build output directory: `.` (repository root)

The site is already deployable as static files. Cloudflare Pages will publish new commits automatically after the Git integration is connected. This repository currently has GitHub Pages enabled too; disable that in GitHub repository settings after the Cloudflare site is working if you want Cloudflare to be the only host.
