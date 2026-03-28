# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Setup (first time)
npm run setup          # Install deps + generate Prisma client + run migrations

# Development
npm run dev            # Start dev server with Turbopack
npm run build          # Production build
npm run start          # Start production server

# Testing & Linting
npm test               # Run Vitest tests
npm run lint           # Run ESLint

# Database
npm run db:reset       # Reset database (destructive)
```

Run a single test file: `npx vitest run src/lib/__tests__/<file>`

## Architecture

UIGen is an AI-powered React component generator. Users describe components in a chat interface; Claude generates code using tool calls; components are immediately previewed in a sandboxed iframe.

### Request Flow

1. User message → `POST /api/chat` (streaming)
2. API route calls Claude with two tools: `str_replace_editor` (view/create/edit files) and `file_manager` (create/delete/list/read)
3. Claude responds with tool calls that manipulate the virtual file system
4. Tool results are sent back; Claude streams a text response
5. Frontend updates file tree, editor, and live preview

### Key Abstractions

**Virtual File System** (`src/lib/file-system.ts`) — In-memory tree of files/directories. No disk I/O. Serializes to JSON for database persistence. Shared via `FileSystemProvider` context.

**LLM Provider** (`src/lib/provider.ts`) — Returns a Claude Haiku 4.5 model if `ANTHROPIC_API_KEY` is set, otherwise falls back to `MockLanguageModel` that returns static demo components.

**JSX Transformer** (`src/lib/transform/jsx-transformer.ts`) — Converts virtual FS files into a self-contained HTML document with an import map and Babel standalone for in-browser JSX compilation. Injected into `PreviewFrame` as a sandboxed iframe `srcDoc`.

**Tools** (`src/lib/tools/`) — `str-replace.ts` implements `str_replace_editor` (supports `view`, `create`, `str_replace`, `insert` commands). `file-manager.ts` implements `file_manager` (supports `create`, `delete`, `list`, `read` commands). Both tools operate on the `VirtualFileSystem` instance passed at chat initialization.

**Chat Context** (`src/lib/contexts/chat-context.tsx`) — Wraps Vercel AI SDK's `useChat`. Syncs tool call results (file system mutations) back into `FileSystemProvider` state.

### Data Persistence

Prisma + SQLite. `Project` rows store the entire virtual file system as JSON (`data` column) and chat history as JSON (`messages` column). Auth is optional JWT-based sessions (middleware protects `/api/projects` and `/api/filesystem`).

### AI System Prompt

Located at `src/lib/prompts/generation.tsx`. Instructs the model to build React components with Tailwind CSS, use the provided tools for file operations, and keep a predictable file structure.

### Path Alias

`@/*` maps to `src/*` throughout the codebase.
