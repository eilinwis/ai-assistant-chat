export type MessageRole = 'user' | 'assistant'

export interface Message {
  id: string
  role: MessageRole
  content: string
  timestamp: string
  /** Optional image shown under the text (e.g. funny-mode Easter egg). */
  imageSrc?: string
}
