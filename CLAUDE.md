# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build
npm run lint         # Next.js lint
npm run format       # Biome formatter
npm run migrate:up   # Run DB migrations
npm run migrate:down # Rollback DB migrations
```

## Environment Variables

Create a `.env` file in the project root:
```
PEXELS_API_KEY=""
```

## Architecture

This is a React-based video editor built on **Next.js 16** (App Router) with **React 19**, using **Remotion** for video rendering and **DesignCombo** packages for the editor core.

### Key Packages
- **@designcombo/state** — Centralized `StateManager` for video composition state (tracks, clips, timing)
- **@designcombo/timeline** — Canvas-based timeline UI (drag, trim, zoom, multi-track)
- **@designcombo/animations / transitions** — Effect presets
- **Remotion** — React-based video player and renderer; all video preview is React components rendered by Remotion

### State Management
Multiple Zustand stores, each scoped to one concern:
- `useSceneStore` — active scene/composition state
- `useLayoutStore` — which editor panel is active (menu, controls)
- `useDataState` — asset library data
- `useFolderStore`, `useUploadStore`, `useDownloadStore`, `useCropStore` — feature-specific state

React Query handles server state (API calls, caching).

### Editor Feature Structure (`src/features/editor/`)
The editor is a single large feature module:
- **`editor.tsx`** — Root layout: `ResizablePanelGroup` splits into sidebar menus, center scene/player, and bottom timeline
- **`scene/`** — Remotion `<Player>` wrapper; renders the video composition in real time
- **`timeline/`** — Canvas timeline; communicates with StateManager via events
- **`menu/`** — Left sidebar: uploads, stock media, text, audio, transitions, animations
- **`controls/`** — Right sidebar: element-specific property panels (text, video, audio, image)
- **`player/`** — Animated text components, transition renderers used inside Remotion compositions

### Data Flow
1. User action in menu/controls → updates Zustand store or calls StateManager
2. StateManager dispatches events → timeline and scene re-render
3. Remotion `<Player>` re-renders composition with new state
4. Export triggers Remotion renderer via `/api/render`

### API Routes (`src/app/api/`)
Internal proxy routes:
- `/api/render` — Triggers Remotion video rendering/export
- `/api/pexels`, `/api/pexels-videos` — Proxies Pexels stock media API
- `/api/transcribe` — Audio transcription
- `/api/uploads`, `/api/voices` — Asset management

External APIs used: DesignCombo API (`api.designcombo.dev`), Google GenAI, Stripe.

### Path Aliases
`@/*` maps to `./src/*` (configured in `tsconfig.json`).

### Code Style
- **Biome** for linting and formatting (tabs, organized imports); run `pnpm format` before committing
- TypeScript strict mode enabled
- `reactStrictMode` is disabled in `next.config.ts`
