# AI Assistant Chat

React + Vite + TypeScript chat UI for manual use and Playwright E2E tests.

## Setup

```bash
npm install
```

Copy the API base URL (optional if you use the default `http://localhost:3001` baked into the client):

```bash
cp .env.example .env
```

Set `VITE_API_URL` in `.env` to your backend origin (no trailing slash required).

## Run

```bash
npm run dev
```

Routes:

- `/` — Chat
- `/search` — Search in chats (local history)
- `/history` — Message history (grouped by day, local storage)
- `/help` — Help / troubleshooting (English)

## Build

```bash
npm run build
```
## Give it a try

Go to chat and send message: "Hello there!"