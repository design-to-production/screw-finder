# screw-finder (Next.js static)

## Local dev

To install dependencies:

```bash
bun install
```

To start a dev server:

```bash
bun dev
```

To build a static export (outputs to `out/`):

```bash
bun run build
```

To preview the exported site locally:

```bash
bun run preview
```

## GitHub Pages

- The workflow in `.github/workflows/deploy.yml` deploys on pushes to `main`.
- In your GitHub repo settings, set **Pages → Build and deployment → Source** to **GitHub Actions**.
