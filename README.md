# Master Set

A trading card collection tracker built with Next.js 16 (App Router).

Track every card in your master set — upload an image, add metadata, set a max budget, mark when you've acquired it, and upload photos of the physical card.

## Features

- **Collections**: Organise cards into separate sets or games
- **Card Grid**: View all cards at a glance with thumbnails and purchase status
- **Filter**: Switch between All / Owned / Wanted views per collection
- **Add Cards**: Upload a card image (click, drag-and-drop, or paste from clipboard) with name, purchase link, max budget, and notes
- **Purchase Tracking**: Mark cards as purchased / wanted with a single click
- **Physical Photos**: Upload photos of acquired physical cards
- **Edit & Delete**: Update card details or remove cards from the collection
- **Admin Auth**: Google OAuth login — only authorised emails can create or edit; collections are publicly readable

## Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| Next.js | 16 | Framework (App Router, Server Components, Server Actions) |
| React | 19 | UI |
| TypeScript | 6 | Type safety |
| Tailwind CSS | 4 | Styling |
| shadcn/ui | latest | Component library |
| Auth.js | 5 (beta) | Google OAuth authentication |
| Zod | 4 | Runtime validation |
| Sharp | 0.34 | Image thumbnails |
| Vercel Blob | latest | Cloud image + data storage |
| Mocha + Chai | 11 / 6 | Testing |

## Getting Started

### Prerequisites

- Node.js v24 (use `nvm use` — `.nvmrc` is included)

### Installation

```bash
git clone <repo>
cd master-set
npm install
```

### Environment Variables

Copy `.env.local` and fill in the values:

```bash
# Generate with: openssl rand -base64 32
AUTH_SECRET=

# From Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client IDs
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=

# Comma-separated list of Google account emails that can edit
AUTHORIZED_EMAILS=you@gmail.com

# Injected automatically when a Vercel Blob store is linked
# Leave unset for local development (uses filesystem instead)
BLOB_READ_WRITE_TOKEN=
```

For Google OAuth, add `http://localhost:3000/api/auth/callback/google` as an authorised redirect URI in the Google Cloud Console.

### Run

```bash
npm run dev   # http://localhost:3000
```

### Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Production build
npm run start      # Start production server
npm run typecheck  # TypeScript type checking
npm run lint       # ESLint
npm test           # Mocha tests
```

## Storage

The app auto-selects a storage backend based on environment:

| Environment | Data | Images |
|-------------|------|--------|
| Local (no `BLOB_READ_WRITE_TOKEN`) | `data/cards.json`, `data/collections.json` on filesystem | `data/images/` served via `/api/images/` |
| Vercel (with `BLOB_READ_WRITE_TOKEN`) | `data/cards.json`, `data/collections.json` in Vercel Blob | Vercel Blob CDN URLs |

Storage is abstracted behind `ICardRepository` / `ICollectionRepository` interfaces — see `lib/repositories/`.

## Deploying to Vercel

1. Push to GitHub and import the repo in Vercel
2. In the Vercel dashboard, go to **Storage** and create a Blob store, then link it to the project
3. Set the following environment variables in Vercel:

   | Variable | Value |
   |----------|-------|
   | `AUTH_SECRET` | `openssl rand -base64 32` |
   | `AUTH_GOOGLE_ID` | From Google Cloud Console |
   | `AUTH_GOOGLE_SECRET` | From Google Cloud Console |
   | `AUTHORIZED_EMAILS` | Comma-separated editor emails |

4. Add `https://<your-domain>.vercel.app/api/auth/callback/google` as an authorised redirect URI in Google Cloud Console
5. Deploy

## Project Structure

See [CLAUDE.md](./CLAUDE.md) for the full architecture overview.
