/**
 * A small assistant scoped to this app itself,
 * just canned help for questions about how the app works. Only activates
 * for messages that read as a question (contain "?"), so it never
 * intercepts a plain statement — every canned lesson/test message in this
 * repo is a plain statement, by design.
 */

interface Topic {
  keywords: string[]
  reply: string
}

const TOPICS: Topic[] = [
  {
    keywords: ['reset'],
    reply:
      "Reset Chat clears this on-screen conversation right away. It also tries to notify a backend at POST /api/reset, but that's best-effort — no backend is required for the reset itself to work.",
  },
  {
    keywords: ['funny mode', 'funny'],
    reply:
      'Funny mode picks a canned, deterministic reply based on the first letter of your message — no network call, no real AI. Uncheck it to send a real POST /api/chat request instead (needs a backend).',
  },
  {
    keywords: ['history'],
    reply:
      "Every successful exchange is saved to this browser's localStorage. Check the Message history screen to see it grouped by day, or Search to look something up.",
  },
  {
    keywords: ['search'],
    reply:
      'The Search screen does a full-text search over your local chat history — type a few words from something you sent earlier.',
  },
  {
    keywords: ['playground'],
    reply:
      'The Playground screen has a handful of extra widgets (drag-and-drop, a slider, a modal, a calendar…) — built for practicing Playwright, not for chatting.',
  },
  {
    keywords: ['who are you', 'what are you', 'are you ai', 'are you real', 'real ai'],
    reply:
      "I'm not a real AI — just a small, honest assistant for this app itself. Its POST /api/chat endpoint is ready for a real one, though; wire up a key and I'd hand you off to it.",
  },
  {
    keywords: ['help'],
    reply: 'Check the Help screen for troubleshooting — common issues and what causes them.',
  },
  {
    keywords: ['playwright', 'end-to-end', 'e2e', 'testing'],
    reply:
      "This whole app is a purpose-built target for practicing Playwright end-to-end testing — every screen has data-testid's and predictable loading/disabled states specifically so it's easy to write reliable tests against.",
  },
  {
    keywords: ['lesson', 'course', 'homework'],
    reply:
      "There's a full Playwright course in this repo's lessons/ folder — each lesson has a working demo.spec.ts and a homework.spec.ts exercise, using this very app as the system under test.",
  },
  {
    keywords: ['backend', 'api', 'llm', 'model'],
    reply:
      "No real backend ships in this repo, so non-funny-mode replies fail by default. src/api/chatApi.ts already implements the full GET /api/messages / POST /api/chat / POST /api/reset contract a real LLM backend would need — it's AI-ready, just not AI-connected.",
  },
  {
    keywords: ['your name', 'why is this called', 'why are you called', "why's it called"],
    reply:
      "This project is called \"AI Assistant Chat\" for the shape of it — a chat UI built around an assistant contract — not because a real model is wired in by default. That's earned architecturally (see src/api/chatApi.ts), not by a live model.",
  },
  {
    keywords: ['what can you do', 'what do you do', 'chat screen'],
    reply:
      'This app has five screens: Chat (you\'re here), Search (full-text over your local history), Message history (grouped by day), Playground (widgets for practicing Playwright), and Help.',
  },
]

const FALLBACK_REPLY =
  'I can only answer questions about this app itself — try asking about reset, funny mode, history, search, playground, or help.'

export function getAppAssistantReply(userText: string): string | null {
  const trimmed = userText.trim()
  if (!trimmed.includes('?')) return null

  const lower = trimmed.toLowerCase()
  const topic = TOPICS.find((t) => t.keywords.some((keyword) => lower.includes(keyword)))
  return topic ? topic.reply : FALLBACK_REPLY
}
