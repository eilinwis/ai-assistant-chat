import { describe, expect, it } from 'vitest'
import { getAppAssistantReply } from './appAssistantReply'

describe('getAppAssistantReply', () => {
  it('returns null for a plain statement (no question mark)', () => {
    expect(getAppAssistantReply('Bananas are great')).toBeNull()
  })

  it('returns null for every canned lesson/test message in this repo', () => {
    // These are all the exact strings sent through funny mode (or, for
    // "trigger a failure" / "slow request", with funny mode off) across the
    // whole course — none should ever be intercepted by this assistant.
    const cannedMessages = [
      'Hello there!',
      'Bananas are great',
      'Historians unite',
      'Ostriches assemble',
      'Ducks like bread',
      'Programmers unite',
      'Gravity always wins',
      'How odd',
      'If only',
      'Spaceships are neat',
      'trigger a failure',
      'slow request',
    ]
    for (const message of cannedMessages) {
      expect(getAppAssistantReply(message)).toBeNull()
    }
  })

  it("falls back to the generic answer for Lesson 9's own question, not a specific topic", () => {
    // The one canned message in the whole course that *does* contain "?" —
    // Lesson 9 relies on it reaching the (mocked) real POST /api/chat, so it
    // must not match any recognized topic here.
    expect(getAppAssistantReply('What does this button do?')).toBe(
      'I can only answer questions about this app itself — try asking about reset, funny mode, history, search, playground, or help.',
    )
  })

  it('answers a recognized question about the app, case-insensitively', () => {
    expect(getAppAssistantReply('How does Reset work?')).toMatch(/Reset Chat clears/)
    expect(getAppAssistantReply('WHAT IS FUNNY MODE?')).toMatch(/Funny mode picks/)
  })

  it('answers questions about the course, the backend, and the project name', () => {
    expect(getAppAssistantReply('Where do I find the homework?')).toMatch(/lessons\/ folder/)
    expect(getAppAssistantReply('Is there a real backend?')).toMatch(/No real backend ships/)
    expect(getAppAssistantReply('Why is this called AI Assistant Chat?')).toMatch(
      /earned architecturally/,
    )
  })

  it('falls back to a generic answer for an unrecognized question', () => {
    expect(getAppAssistantReply('What is the meaning of life?')).toBe(
      'I can only answer questions about this app itself — try asking about reset, funny mode, history, search, playground, or help.',
    )
  })

  it('answers honestly when asked whether it is a real AI', () => {
    expect(getAppAssistantReply('Are you a real AI?')).toMatch(/not a real AI/)
  })
})
