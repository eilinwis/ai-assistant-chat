export interface ChatExchange {
  id: string
  userContent: string
  assistantContent: string
  userTimestamp: string
  assistantTimestamp: string
  assistantImageSrc?: string
}
