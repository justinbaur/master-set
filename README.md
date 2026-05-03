# Master Set

A trading card collection tracker built with Next.js 16 (App Router).

Track every card in your master set — upload an image, add metadata, mark when you've acquired it, and upload photos of the physical card.

## Features

- **Card Grid**: View all tracked cards at a glance with thumbnails and purchase status
- **Add Cards**: Upload a card image (drag-and-drop or file picker) and annotate with name, purchase link, and notes
- **Purchase Tracking**: Mark cards as purchased / wanted with a single click
- **Physical Photos**: Upload photos of your acquired physical cards
- **Edit & Delete**: Update card details or remove cards from the collection

## Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| Next.js | 16 | Framework (App Router, Server Components, Server Actions) |
| React | 19 | UI |
| TypeScript | 5 | Type safety |
| Tailwind CSS | 4 | Styling |
| shadcn/ui | latest | Component library |
| Zod | 4 | Runtime validation |
| Sharp | 0.34 | Image thumbnails |
| Mocha + Chai | 11 / 6 | Testing |

## Getting Started

### Prerequisites

- Node.js v24 (use `nvm use` if you have `.nvmrc` support)

### Installation

```bash
git clone <repo>
cd master-set
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

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

Card data is stored on the **filesystem** in the `data/` directory (gitignored):

```
data/
  cards/cards.json        # Card metadata (JSON)
  images/
    original/             # Full-size uploads
    thumbnails/           # 400×400 WebP thumbnails
```

Images are served via the `/api/images/[...path]` route.

> **Note**: The filesystem storage is fine for local development. For Vercel deployment, migrate to a database (Vercel Postgres, Supabase) and cloud image storage (Vercel Blob, Cloudinary). The Repository Pattern makes this a straightforward swap.

## Deploying to Vercel

1. Push to GitHub
2. Import the repository in Vercel
3. Set Node.js version to 24.x in project settings
4. Deploy

## Project Structure

See [CLAUDE.md](./CLAUDE.md) for the full architecture overview.
