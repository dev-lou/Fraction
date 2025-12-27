# Fraction

A demo project.

## Deploying to Vercel

This repo is set up to deploy to Vercel from the `main` branch:

1. Create a Vercel project and connect your GitHub repository.
2. Set the following GitHub secrets in your repo (Settings → Secrets):
   - `VERCEL_TOKEN` (Personal token)
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
3. Push the `main` branch to your remote and Vercel will deploy automatically.

If you prefer to deploy manually from your local machine, install the Vercel CLI and run:

```bash
npm run build
npx vercel --prod
```
