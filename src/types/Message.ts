export type MessageRole = 'user' | 'assistant'

export interface Message {
  id: string
  role: MessageRole
  content: string
  timestamp: string
  /** Optional image shown under the text (e.g. funny-mode Easter egg). */
  imageSrc?: string
  /** Name of a file the user attached (hard mode `files`). */
  attachmentName?: string
  /** A user message whose send failed and hasn't been retried yet. */
  failed?: boolean
}
