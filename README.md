# Shortify AI Frontend

Shortify AI Frontend is the web interface and editor workspace for Shortify AI, an autonomous AI video editing application. It enables creators to upload raw media assets, pick soundtracks, write creative render briefs, monitor multi-agent pipeline executions in real time, preview compiled vertical outputs in a custom viewport, and manage project workflows.

---

## Technical Stack

The frontend is built on a modern Next.js framework designed for local streaming stability and responsive layout scaling:

* **Framework**: Next.js 15 (App Router, React 19)
* **Language**: TypeScript
* **Styling**: Tailwind CSS with custom global theme rules and glassmorphism styling
* **State Management**:
  * **Server Cache**: TanStack Query (React Query) v5
  * **Workspace State**: Zustand
* **HTTP Client**: Axios with global authentication and API error toast handlers
* **Form Validation**: React Hook Form with Zod schemas
* **Animations**: Framer Motion
* **Iconography**: Lucide React

---

## Directory Structure

The repository is organized logically by features, utilities, and components:

```
src/
├── app/
│   ├── (auth)/             # Login and Registration routing views
│   ├── dashboard/          # Project list grid, deletion controls, and status checks
│   ├── create/             # Step-by-step project creation wizard
│   ├── editor/             # Workspace controller containing the timeline and video preview
│   ├── settings/           # System account configurations and backend engine information
│   ├── layout.tsx          # Root layout wrapping React Query and Auth bounds
│   └── page.tsx            # Redirection router
│
├── components/
│   ├── ui/                 # Reusable dark-theme buttons, cards, inputs, and toast notifiers
│   ├── layout/             # Navigation bars, sidebars, and main AppShell layouts
│   ├── video/              # Custom HTML5 playback viewport and multitrack seek timelines
│   ├── ai/                 # Agent progress monitors and status cards
│   └── upload/             # Drag-and-drop video/audio upload components
│
├── features/
│   ├── auth/               # Auth APIs, React Query mutations, and credential stores
│   ├── projects/           # Projects CRUD, file linking, and asset query handlers
│   ├── render/             # Render dispatch API and event status polling manager
│   └── editor/             # Zustand workspace timelines and playhead stores
│
├── lib/
│   ├── axios.ts            # Configured Axios client with Bearer session header attachments
│   └── query-client.tsx    # TanStack Query client wrapper component
│
└── types/
    ├── api.ts              # Request and response interface definitions
    └── models.ts           # Shared structural interfaces (User, Project, MediaAsset)
```

---

## Key Architectures

### 1. Session Authentication
The application connects to the backend signup and login routes, retrieving a unique session identifier:
* A request interceptor in `lib/axios.ts` checks local storage and automatically appends the token to protected routes:
  `Authorization: Bearer <session_id>`
* A response interceptor checks for 401 Unauthorized codes, automatically wipes session cache, notifies the user via Toast, and redirects to the login route.

### 2. Multi-Agent Progress Polling
The orchestrator pipeline runs asynchronously in the backend. When a render is triggered, the frontend redirects the user to the workspace page where the status polling manager takes over:
* It hits `GET /projects/{project_id}/render/status` every 3 seconds while status remains queued or running.
* It translates backend step strings (e.g., beat alignment, Whisper transcribing, subtitle overlay) and displays live progress states (pending, running, success, failed) across five specialized AI agents:
  1. **Rhythm Engineer** (Soundtrack beat matching)
  2. **Media Analyst** (Gemini frame parsing)
  3. **Creative Director** (Storyboard and layout composition)
  4. **Video Editor** (FFmpeg cuts and color grading)
  5. **Subtitle Agent** (Whisper transcripts and overlay burns)

### 3. Cross-Platform Video Streaming
Video asset relative paths are normalized to strip platform-specific backslashes (`\`) into web-safe forward slashes (`/`), allowing standard HTML5 video elements to play the compiled media from the mounted storage server.

---

## Setup and Installation

### Prerequisites
* Node.js (v18 or higher recommended)
* npm, pnpm, or yarn package manager

### Environment Configuration
Create a `.env.local` file in the root directory. Copy settings from `.env.example`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8002
```
*Note: Verify that the port matches your running FastAPI backend instance (defaults to 8002 during local testing).*

### Commands

**Install dependencies:**
```bash
npm install
```

**Run development server:**
```bash
npm run dev
```
The dev server will initialize at `http://localhost:3000`.

**Build production optimized bundle:**
```bash
npm run build
```

**Run linter check:**
```bash
npm run lint
```

---

## Backend Requirements
To successfully render and play videos on the frontend:
1. Ensure the FastAPI application has `CORSMiddleware` active, permitting origins `http://localhost:3000`, `http://127.0.0.1:3000`, and your local network IP addresses.
2. The backend entry point must mount the `storage/` directory statically to permit direct file access:
   ```python
   from fastapi.staticfiles import StaticFiles
   app.mount("/storage", StaticFiles(directory="storage"), name="storage")
   ```
