import { sendChatMessage } from '../api/chatApi'
import type { Message } from '../types/Message'
import { getAppAssistantReply } from './appAssistantReply'
import { createFunnyAssistantMessage, getFunnyReplyContent } from './funnyReply'

export const FUNNY_REPLY_DELAY_MS = 120

export type ReplyMode = 'funny' | 'assistant'

/** Produces the assistant's reply to `text`, or throws. */
export type GetReply = (text: string, mode: ReplyMode) => Promise<Message>

export const getReply: GetReply = async (text, mode) => {
  if (mode === 'funny') {
    await new Promise((r) => setTimeout(r, FUNNY_REPLY_DELAY_MS))
    const content = getAppAssistantReply(text) ?? getFunnyReplyContent(text)
    return createFunnyAssistantMessage(text, content)
  }

  try {
    return await sendChatMessage(text)
  } catch {
    // No real backend is configured (or it failed) — fall back to the
    // local app assistant for recognized questions, same as funny mode
    // does, instead of just erroring. Only applies when it actually
    // recognizes the message; anything else still surfaces the error.
    const fallbackContent = getAppAssistantReply(text)
    if (fallbackContent) {
      return createFunnyAssistantMessage(text, fallbackContent)
    }
    throw new Error('Failed to get AI response')
  }
}
