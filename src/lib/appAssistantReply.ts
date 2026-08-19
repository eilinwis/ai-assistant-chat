/**
 * A small assistant scoped to this app itself,
 * just canned help for questions about how the app works. Only activates
 * for messages that read as a question (contain "?"), so it never
 * intercepts a plain statement — every canned lesson/test message in this
 * repo is a plain statement, by design. The one exception is the bare word
 * "Help" (see HELP_SUGGESTION_MESSAGE) — an exact match, sent by the Help
 * suggestion chip, which lists every question below as a menu.
 */

interface Topic {
  keywords: string[]
  example: string
  reply: string
}

const TOPICS: Topic[] = [
  {
    keywords: ['reset'],
    example: 'How does reset work?',
    reply:
      "Reset Chat clears this on-screen conversation right away. It also tries to notify a backend at POST /api/reset, but that's best-effort — no backend is required for the reset itself to work.",
  },
  {
    keywords: ['funny mode', 'funny'],
    example: 'What is funny mode?',
    reply:
      'Funny mode picks a canned, deterministic reply based on the first letter of your message — no network call, no real AI. Uncheck it to send a real POST /api/chat request instead (needs a backend).',
  },
  {
    keywords: ['history'],
    example: 'Where is my history?',
    reply:
      "Every successful exchange is saved to this browser's localStorage. Check the Message history screen to see it grouped by day, or Search to look something up.",
  },
  {
    keywords: ['search'],
    example: 'How does search work?',
    reply:
      'The Search screen does a full-text search over your local chat history — type a few words from something you sent earlier.',
  },
  {
    keywords: ['playground'],
    example: "What's on the Playground screen?",
    reply:
      'The Playground screen has a handful of extra widgets (drag-and-drop, a slider, a modal, a calendar…) — built for practicing Playwright, not for chatting.',
  },
  {
    keywords: ['who are you', 'what are you', 'are you ai', 'are you real', 'real ai'],
    example: 'Are you a real AI?',
    reply:
      "I'm not a real AI — just a small, honest assistant for this app itself. Its POST /api/chat endpoint is ready for a real one, though; wire up a key and I'd hand you off to it.",
  },
  {
    keywords: ['help'],
    example: 'How do I get help?',
    reply: 'Check the Help screen for troubleshooting — common issues and what causes them.',
  },
  {
    keywords: ['playwright', 'end-to-end', 'e2e', 'testing'],
    example: 'Why is this good for testing?',
    reply:
      "This whole app is a purpose-built target for practicing Playwright end-to-end testing — every screen has data-testid's and predictable loading/disabled states specifically so it's easy to write reliable tests against.",
  },
  {
    keywords: ['lesson', 'course', 'homework'],
    example: 'Where do I find the homework?',
    reply:
      "There's a full Playwright course in this repo's lessons/ folder — each lesson has a working demo.spec.ts and a homework.spec.ts exercise, using this very app as the system under test.",
  },
  {
    keywords: ['backend', 'api', 'llm', 'model'],
    example: 'Is there a real backend?',
    reply:
      "No real backend ships in this repo, so non-funny-mode replies fail by default. src/api/chatApi.ts already implements the full GET /api/messages / POST /api/chat / POST /api/reset contract a real LLM backend would need — it's AI-ready, just not AI-connected.",
  },
  {
    keywords: ['your name', 'why is this called', 'why are you called', "why's it called"],
    example: 'Why is this called AI Assistant Chat?',
    reply:
      "This project is called \"AI Assistant Chat\" for the shape of it — a chat UI built around an assistant contract — not because a real LLM is wired in by default. That's earned architecturally (see src/api/chatApi.ts), not by a live model.",
  },
  {
    keywords: ['what can you do', 'what do you do', 'chat screen'],
    example: 'What can you do?',
    reply:
      'This app has five screens: Chat (you\'re here), Search (full-text over your local history), Message history (grouped by day), Playground (widgets for practicing Playwright), and Help.',
  },
]

const FALLBACK_REPLY =
  'I can only answer questions about this app itself — try asking about reset, funny mode, history, search, playground, or help.'

/** The exact message the Help suggestion chip sends. */
export const HELP_SUGGESTION_MESSAGE = 'Help'

const HELP_MENU_REPLY = [
  "Here's what I know how to answer — try asking me:",
  ...TOPICS.map((topic) => `- ${topic.example}`),
].join('\n')

export function getAppAssistantReply(userText: string): string | null {
  const trimmed = userText.trim()

  if (trimmed.toLowerCase() === HELP_SUGGESTION_MESSAGE.toLowerCase()) {
    return HELP_MENU_REPLY
  }

  if (!trimmed.includes('?')) return null

  const lower = trimmed.toLowerCase()
  const topic = TOPICS.find((t) => t.keywords.some((keyword) => lower.includes(keyword)))
  return topic ? topic.reply : FALLBACK_REPLY
}
