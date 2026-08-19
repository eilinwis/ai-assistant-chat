# AI Assistant Chat 💬

![CI](https://github.com/eilinwis/ai-assistant-chat/actions/workflows/ci.yml/badge.svg)
![e2e](https://github.com/eilinwis/ai-assistant-chat/actions/workflows/e2e.yml/badge.svg)
![GitHub Repo stars](https://img.shields.io/github/stars/eilinwis/ai-assistant-chat?style=flat-square&color=ffa500)
![GitHub Repo contributors](https://img.shields.io/github/contributors/eilinwis/ai-assistant-chat?style=flat-square&color=ffa500)
![GitHub Repo forks](https://img.shields.io/github/forks/eilinwis/ai-assistant-chat?style=flat-square&color=ffa500)
![GitHub Repo commits](https://badgen.net/github/commits/eilinwis/ai-assistant-chat/main?color=purple)

A React/TypeScript chat application built as a purpose-made target for practicing Playwright end-to-end testing, paired with a self-contained, in-repo Playwright course that teaches E2E testing against it.

**No real AI ships by default** — "Funny mode" is a small, deterministic reply engine (canned jokes, plus real answers to real questions about the app itself — try asking it "how does reset work?"). The name is earned *architecturally*, not by a live model: `src/api/chatApi.ts` already implements the full request/response contract (`GET /api/messages`, `POST /api/chat`, `POST /api/reset`) a real LLM backend would need — it's AI-ready, just not AI-connected, by design, so the app and every test stay free, offline, and deterministic.

## Overview

Two things, developed together:

1. **A small chat web app** (`src/`) — client-side routing, local persistence, and a testable UI (`data-testid`s, predictable loading/disabled states).
2. **A Playwright course** (`lessons/`) — lessons that use the app above as the system under test, each pairing an explanation with a working demo and a homework exercise.

Aimed at engineers who know JS/TypeScript and want to learn or teach Playwright against a realistic small app. The codebase is exercised from two angles: a regression-style E2E suite (`e2e/`, Page Object Model) and the teaching suite (`lessons/`).

## Key Features

- **Four-screen chat app**: Chat, Search (full-text over local history), Message history (by day), Help (collapsible troubleshooting).
- **Deterministic offline mode ("Funny mode")**: canned, letter-keyed replies, no network — the app and every test run without a backend.
- **A small assistant for the app itself** (`src/lib/appAssistantReply.ts`): ask it a real question ("how does reset work?", "what is funny mode?", "are you a real AI?") and it answers honestly, instead of joking — only for messages phrased as a question, so it never collides with a canned test message.
- **AI-ready, not AI-connected**: typed `fetch` client (`src/api/chatApi.ts`) implements the full contract (`GET /api/messages`, `POST /api/chat`, `POST /api/reset`) a real LLM backend would need — used automatically when Funny mode is off, but no backend ships in this repo.
- **Client-side history**: persisted to `localStorage`, merging server and local exchanges with de-duplication.
- **Page Object Model E2E suite** (`e2e/`): one page-object class per screen via a `PageManager`.
- **11-lesson Playwright course** (`lessons/`), from anatomy of a test through CI, parallelism, and best practices.
- **Strict TypeScript** (`strict`, `noUnusedLocals`, `noUncheckedSideEffectImports`, …) and **GitHub Actions CI**: `ci.yml` (lint + build, on push/PR to `main`) and `e2e.yml` (runs one spec file on demand, see [Testing Strategy](#testing-strategy)).

## How It Works

```mermaid
flowchart LR
    U[User sends a message] --> S{Funny mode?}
    S -- on --> L[Local canned reply]
    S -- off --> A["POST /api/chat (external, not included)"]
    L --> H[ChatHistoryProvider]
    A --> H
    H --> P[localStorage] --> R[Search / History screens]
```

## Testing Strategy

Two independent Playwright suites:

- **`e2e/` (regression, POM)** — root `playwright.config.ts`, Chromium, headed locally / headless in CI, auto-started `webServer`. `PageManager` exposes one page object per screen. Covers: chat controls render + send flow (`chat.spec.ts`), search retrieval (`search.spec.ts`), nav tabs visible (`navigation.spec.ts`), Help accordion toggling (`help.spec.ts`). Uses web-first `expect(locator)` assertions and readiness-based waits over arbitrary sleeps.
- **`lessons/` (teaching)** — own config, same `baseURL` + auto-started `webServer` pattern. Each lesson has a working `demo.spec.ts` and a `test.fixme()`-gated `homework.spec.ts`. See `lessons/README.md`.

Both configs start the dev server for you — no need to run `npm run dev` in a separate terminal first.

```bash
# e2e/ suite
npm run test:e2e

# lessons/ course
npm run test:lessons

# either one, scoped to a single file
npm run test:e2e -- e2e/tests/chat.spec.ts
npm run test:lessons -- lessons/01-getting-started

# open the last run's HTML report
npx playwright show-report
```

`ci.yml` runs lint + build on every push/PR to `main`. `e2e.yml` doesn't run
automatically — comment `e2e <path/to/spec.ts>` on a PR and it runs just
that file, reporting back as a check on the PR's commit.

## Getting Started

```bash
npm install
npx playwright install chromium

npm run dev
npm run lint
npm run build
npm run preview
```

## Project Structure

```
ai-assistant-chat/
├── .github/workflows/
│   ├── ci.yml                  # lint + build on push/PR to main
│   └── e2e.yml                 # runs one spec file on a PR comment: "e2e <path>"
├── src/
│   ├── api/chatApi.ts         # client for the optional external backend
│   ├── components/            # AppLayout, ChatWindow, ChatInput, ChatMessage, ...
│   ├── lib/                   # funnyReply.ts, chatHistoryStorage.ts
│   ├── pages/                 # ChatPage, SearchChatsPage, HistoryPage, HelpPage
│   └── types/                 # Message, ChatExchange
├── e2e/
│   ├── pages/                  # Page Object Model: PageManager + per-screen classes
│   └── tests/                  # chat, search, navigation, help specs
├── lessons/
│   ├── playwright.config.ts    # standalone config; auto-starts the dev server
│   └── 01-getting-started … 11-ci-parallelism-and-best-practices/
└── playwright.config.ts        # config for e2e/
```

## License

No license file is currently included. All rights reserved by default until one is added.
