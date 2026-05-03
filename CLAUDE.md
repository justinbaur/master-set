# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the master-set project.

## Project Overview

**Master-Set** is a Next.js 16 trading card tracker that allows users to build and manage a "master set" collection. Users upload card images, annotate them with metadata, track purchase status, and upload photos of physical cards after purchase.

## Architecture

### Tech Stack
- **Framework**: Next.js 16 (App Router, React 19)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Validation**: Zod 4
- **Image Processing**: Sharp (thumbnails)
- **Testing**: Mocha + Chai (workspace standard)
- **Node**: v24 (`.nvmrc`)

### Source Layout

```
app/                   # Next.js App Router pages
  layout.tsx           # Root layout (header + footer)
  page.tsx             # Home: card grid
  not-found.tsx        # 404 page
  cards/
    new/page.tsx       # Add new card
    [id]/page.tsx      # Card detail
    [id]/edit/page.tsx # Edit card
  api/
    images/[...path]/route.ts  # Serve uploaded images from /data/

lib/
  types/card.ts                  # TypeScript interfaces
  schemas/card-schema.ts         # Zod validation schemas
  repositories/
    card-repository.ts           # ICardRepository interface
    filesystem-card-repository.ts  # JSON + filesystem implementation
  actions/
    create-card.ts               # Server Action
    update-card.ts               # Server Action
    mark-purchased.ts            # Server Action
    add-image.ts                 # Server Action
    delete-card.ts               # Server Actions (delete card + delete image)
  utils/
    file-upload.ts               # saveImage(), deleteImageFile() with Sharp

components/
  layout/header.tsx footer.tsx   # App shell
  cards/
    card-grid.tsx                # Server: grid of all cards
    card-item.tsx                # Server: card thumbnail + badge
    purchased-badge.tsx          # Server: Purchased / Wanted badge
    card-form.tsx                # Client: create or edit form
    image-upload.tsx             # Client: drag-and-drop uploader
    mark-purchased-button.tsx    # Client: toggle purchase state
    add-image-form.tsx           # Client: upload physical card photos
    delete-card-button.tsx       # Client: confirm + delete card

data/                  # Filesystem storage (gitignored)
  cards/cards.json     # Card metadata
  images/
    original/          # Full-size uploaded images
    thumbnails/        # 400×400 WebP thumbnails

tests/
  unit/                # Schema, utility, repository tests
  integration/         # Server Action, CRUD tests
  fixtures/            # Test data
```

## Data Model

```typescript
interface Card {
  id: string;                       // UUID v4
  name: string;
  imageUrl: string;                 // /api/images/original/...
  thumbnailUrl: string;             // /api/images/thumbnails/...
  purchaseLink: string | null;      // URL where card is listed
  isPurchased: boolean;
  purchasedAt: Date | null;
  uploadedImages: UploadedImage[];  // Photos of physical cards
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

## Storage

Images are served through `app/api/images/[...path]/route.ts` which reads from `data/images/` on the filesystem.

**Migration path to database:**
1. Create `DatabaseCardRepository` implementing `ICardRepository`
2. Update Server Actions to instantiate the new class
3. Move image storage to Vercel Blob / Cloudinary

## Development Setup

```bash
source ~/.nvm/nvm.sh && nvm use   # activate Node v24
npm install
npm run dev                         # http://localhost:3000
npm run build
npm run typecheck
npm run lint
npm test
```

## Conventions

- Server Components by default; add `'use client'` only when needed
- Server Actions for all mutations (no client-side fetch to API routes)
- Zod validates all Server Action inputs before repository calls
- `revalidatePath()` called after every mutation
- `redirect()` only on successful creation (re-throw the redirect error)
- Data directory (`/data/`) is gitignored — ephemeral on Vercel; migrate to DB for production
