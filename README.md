# RevuOps Web

Frontend for [RevuOps](https://revuops-web.vercel.app) — an autonomous AI code review platform. Built with Next.js 16, Supabase Auth, and Tailwind CSS.

## What it does

- GitHub OAuth login via Supabase Auth
- GitHub App install flow — connect any repo in one click
- Dashboard showing review history, connected repos, and usage
- Review detail pages with security, performance, and architecture findings
- Analytics page with approval rate and weekly chart
- Public status page
- Light and dark mode

## Stack

- **Framework:** Next.js 16 (App Router)
- **Auth:** Supabase Auth with GitHub OAuth
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Theme:** next-themes
- **Charts:** Recharts
- **Deployment:** Vercel

## Related

- [reviewer-agent](https://github.com/YOUR_GITHUB_USERNAME/reviewer-agent) — the FastAPI + LangGraph backend that powers the review pipeline

## Local development

Clone and install:

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/revuops-web.git
cd revuops-web
npm install
```

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GITHUB_APP_NAME=RevuOps
```

Run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The backend must also be running locally for repo fetching to work. See the [reviewer-agent](https://github.com/YOUR_GITHUB_USERNAME/reviewer-agent) repo for setup instructions.

## Deployment

Deployed on Vercel. Every push to `main` triggers an automatic deploy.

Required environment variables on Vercel:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `NEXT_PUBLIC_API_URL` | Backend URL (Render) |
| `NEXT_PUBLIC_GITHUB_APP_NAME` | GitHub App name |