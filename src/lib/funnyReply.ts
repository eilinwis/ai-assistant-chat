import grievousGif from '../assets/grievous.gif'
import {
  FUNNY_HELLO_THERE_EXACT_REPLY,
  FUNNY_NO_LETTER_FALLBACK,
  FUNNY_REPLIES_BY_LETTER,
} from '../data/funnyReplies'
import type { Message } from '../types/Message'

export function getFunnyReplyContent(userText: string): string {
  const trimmed = userText.trim()
  if (trimmed === 'Hello there!') {
    return FUNNY_HELLO_THERE_EXACT_REPLY
  }
  const match = trimmed.match(/[a-zA-Z]/)
  if (!match) {
    return FUNNY_NO_LETTER_FALLBACK
  }
  const letter = match[0].toUpperCase()
  return FUNNY_REPLIES_BY_LETTER[letter] ?? FUNNY_NO_LETTER_FALLBACK
}

export function createFunnyAssistantMessage(
  userInput: string,
  content: string,
): Message {
  const isHelloThere = userInput.trim() === 'Hello there!'
  return {
    id: `funny-assistant-${crypto.randomUUID()}`,
    role: 'assistant',
    content,
    timestamp: new Date().toISOString(),
    ...(isHelloThere ? { imageSrc: grievousGif } : {}),
  }
}
