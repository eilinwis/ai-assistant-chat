import type { Message } from '../types/Message'

function getBaseUrl(): string {
  const raw = import.meta.env.VITE_API_URL as string | undefined
  const url = raw?.trim() || 'http://localhost:3001'
  return url.replace(/\/$/, '')
}

function messagesUrl(): string {
  return `${getBaseUrl()}/api/messages`
}

function chatUrl(): string {
  return `${getBaseUrl()}/api/chat`
}

function resetUrl(): string {
  return `${getBaseUrl()}/api/reset`
}

export async function fetchMessages(): Promise<Message[]> {
  const res = await fetch(messagesUrl())
  if (!res.ok) {
    throw new Error('Failed to fetch messages')
  }
  const data = (await res.json()) as { messages?: Message[] }
  return data.messages ?? []
}

export async function sendChatMessage(text: string): Promise<Message> {
  const res = await fetch(chatUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: text }),
  })
  if (!res.ok) {
    throw new Error('Failed to send chat message')
  }
  const data = (await res.json()) as { reply: Message }
  return data.reply
}

export async function resetChat(): Promise<void> {
  const res = await fetch(resetUrl(), { method: 'POST' })
  if (!res.ok) {
    throw new Error('Failed to reset chat')
  }
  const data = (await res.json()) as { status?: string }
  if (data.status !== 'ok') {
    throw new Error('Unexpected reset response')
  }
}
