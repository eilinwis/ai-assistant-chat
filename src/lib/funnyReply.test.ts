import { describe, expect, it } from 'vitest'
import { FUNNY_REPLIES_BY_LETTER } from '../data/funnyReplies'
import { createFunnyAssistantMessage, getFunnyReplyContent } from './funnyReply'

describe('getFunnyReplyContent', () => {
  it('returns the exact "GENERAL KENOBI!!" reply for "Hello there!"', () => {
    expect(getFunnyReplyContent('Hello there!')).toBe('GENERAL KENOBI!!')
  })

  it('matches "Hello there!" even with surrounding whitespace', () => {
    expect(getFunnyReplyContent('  Hello there!  ')).toBe('GENERAL KENOBI!!')
  })

  it('picks the reply for the first letter, case-insensitively', () => {
    expect(getFunnyReplyContent('bananas are great')).toBe(
      FUNNY_REPLIES_BY_LETTER.B,
    )
    expect(getFunnyReplyContent('BANANAS')).toBe(FUNNY_REPLIES_BY_LETTER.B)
  })

  it('skips leading non-letters to find the first letter', () => {
    expect(getFunnyReplyContent('  42 ducks!')).toBe(FUNNY_REPLIES_BY_LETTER.D)
  })

  it('falls back to the no-letter message when there are no letters at all', () => {
    expect(getFunnyReplyContent('123 456')).toBe(
      "Hmm, I need at least one letter—otherwise my joke alphabet files for unemployment.",
    )
  })
})

describe('createFunnyAssistantMessage', () => {
  it('builds an assistant message with the given content', () => {
    const message = createFunnyAssistantMessage('bananas', 'a silly reply')

    expect(message.role).toBe('assistant')
    expect(message.content).toBe('a silly reply')
    expect(message.imageSrc).toBeUndefined()
  })

  it('attaches an image only when the user input was exactly "Hello there!"', () => {
    const withImage = createFunnyAssistantMessage('Hello there!', 'GENERAL KENOBI!!')
    expect(withImage.imageSrc).toBeDefined()

    const withoutImage = createFunnyAssistantMessage('hello there', 'not a match')
    expect(withoutImage.imageSrc).toBeUndefined()
  })
})
