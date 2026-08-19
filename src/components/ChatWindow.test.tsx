import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ChatHistoryProvider } from './ChatHistoryProvider'
import ChatWindow from './ChatWindow'

vi.mock('../api/chatApi', () => ({
  fetchMessages: vi.fn().mockResolvedValue([]),
  sendChatMessage: vi.fn(),
  resetChat: vi.fn(),
}))

import { resetChat, sendChatMessage } from '../api/chatApi'

function renderChatWindow() {
  render(
    <ChatHistoryProvider>
      <ChatWindow />
    </ChatHistoryProvider>,
  )
}

async function sendMessage(user: ReturnType<typeof userEvent.setup>, text: string) {
  const input = await screen.findByTestId('chat-input')
  await waitFor(() => expect(input).toBeEnabled())

  await user.type(input, text)
  await user.click(screen.getByTestId('send-button'))

  await waitFor(() => expect(screen.getByTestId('message-assistant')).toBeInTheDocument())
}

describe('ChatWindow reset behavior', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.mocked(resetChat).mockReset()
  })

  afterEach(() => {
    cleanup()
  })

  it('clears the on-screen thread when resetChat() succeeds', async () => {
    vi.mocked(resetChat).mockResolvedValue(undefined)
    const user = userEvent.setup()
    renderChatWindow()
    await sendMessage(user, 'Bananas are great')

    await user.click(screen.getByTestId('reset-button'))

    await waitFor(() => {
      expect(screen.queryByTestId('message-user')).not.toBeInTheDocument()
      expect(screen.queryByTestId('message-assistant')).not.toBeInTheDocument()
    })
    expect(screen.getByText('No messages yet.')).toBeInTheDocument()
  })

  it('still clears the on-screen thread when resetChat() rejects (no backend)', async () => {
    vi.mocked(resetChat).mockRejectedValue(new Error('network error'))
    const user = userEvent.setup()
    renderChatWindow()
    await sendMessage(user, 'Historians unite')

    await user.click(screen.getByTestId('reset-button'))

    await waitFor(() => {
      expect(screen.queryByTestId('message-user')).not.toBeInTheDocument()
      expect(screen.queryByTestId('message-assistant')).not.toBeInTheDocument()
    })
    expect(screen.getByText('No messages yet.')).toBeInTheDocument()
  })

  it('still calls resetChat() best-effort, even though its outcome no longer matters', async () => {
    vi.mocked(resetChat).mockRejectedValue(new Error('network error'))
    const user = userEvent.setup()
    renderChatWindow()
    await sendMessage(user, 'Ostriches assemble')

    await user.click(screen.getByTestId('reset-button'))

    await waitFor(() => expect(resetChat).toHaveBeenCalledTimes(1))
  })
})

describe('ChatWindow normal mode (funny mode off) fallback', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.mocked(sendChatMessage).mockReset()
  })

  afterEach(() => {
    cleanup()
  })

  it('answers a recognized question locally when the real API call fails', async () => {
    vi.mocked(sendChatMessage).mockRejectedValue(new Error('network error'))
    const user = userEvent.setup()
    renderChatWindow()

    const input = await screen.findByTestId('chat-input')
    await waitFor(() => expect(input).toBeEnabled())
    await user.click(screen.getByTestId('funny-mode-toggle'))

    await user.type(input, 'How does reset work?')
    await user.click(screen.getByTestId('send-button'))

    await waitFor(() =>
      expect(screen.getByTestId('message-assistant')).toHaveTextContent('Reset Chat clears'),
    )
    expect(screen.queryByTestId('error-message')).not.toBeInTheDocument()
  })

  it('still shows the error message for an unrecognized failure', async () => {
    vi.mocked(sendChatMessage).mockRejectedValue(new Error('network error'))
    const user = userEvent.setup()
    renderChatWindow()

    const input = await screen.findByTestId('chat-input')
    await waitFor(() => expect(input).toBeEnabled())
    await user.click(screen.getByTestId('funny-mode-toggle'))

    await user.type(input, 'trigger a failure')
    await user.click(screen.getByTestId('send-button'))

    await waitFor(() =>
      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'Error: failed to get AI response',
      ),
    )
    expect(screen.queryByTestId('message-assistant')).not.toBeInTheDocument()
  })
})

describe('ChatWindow Help suggestion', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.mocked(sendChatMessage).mockReset()
    vi.mocked(sendChatMessage).mockRejectedValue(new Error('network error'))
  })

  afterEach(() => {
    cleanup()
  })

  it('switches the toggle to Assistant mode and shows the question menu, even while Funny mode is on', async () => {
    const user = userEvent.setup()
    renderChatWindow()

    const funnyModeToggle = await screen.findByTestId('funny-mode-toggle')
    await waitFor(() => expect(funnyModeToggle).toBeEnabled())
    expect(funnyModeToggle).toBeChecked() // Funny mode is on by default

    await user.click(screen.getByTestId('help-suggestion'))

    await waitFor(() => expect(funnyModeToggle).not.toBeChecked())
    await waitFor(() =>
      expect(screen.getByTestId('message-assistant')).toHaveTextContent(
        "Here's what I know how to answer",
      ),
    )
    expect(screen.getByTestId('message-user')).toHaveTextContent('Help')
  })
})
