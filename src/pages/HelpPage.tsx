export default function HelpPage() {
  return (
    <div className="panel">
      <h2 className="panel__heading">Help</h2>
      <p className="panel__lede">
        Common issues and quick fixes for the AI Assistant Chat demo.
      </p>
      <div className="help-list">
        <details
          className="help-spoiler"
          data-testid="help-item-failed-ai-response"
        >
          <summary
            className="help-spoiler__summary"
            data-testid="help-trigger-failed-ai-response"
          >
            <span className="help-spoiler__title">
              “Error: failed to get AI response”
            </span>
            <span className="help-spoiler__cta">
              <span className="help-spoiler__cta-collapsed">Expand</span>
              <span className="help-spoiler__cta-expanded">Collapse</span>
            </span>
          </summary>
          <div className="help-spoiler__body">
            <p>
              The app could not reach <code>/api/chat</code> or the server
              returned an error. Confirm the backend is running,{' '}
              <code>VITE_API_URL</code> points to the correct host and port, and
              your network allows the request. Retry after the service is
              healthy.
            </p>
          </div>
        </details>
        <details className="help-spoiler" data-testid="help-item-blank-chat">
          <summary
            className="help-spoiler__summary"
            data-testid="help-trigger-blank-chat"
          >
            <span className="help-spoiler__title">
              Blank chat or missing past messages
            </span>
            <span className="help-spoiler__cta">
              <span className="help-spoiler__cta-collapsed">Expand</span>
              <span className="help-spoiler__cta-expanded">Collapse</span>
            </span>
          </summary>
          <div className="help-spoiler__body">
            <p>
              On load, the UI calls <code>GET /api/messages</code>. If that
              fails, the chat starts empty. Check the API URL, CORS settings,
              and server logs. Use <strong>Reset Chat</strong> only when you
              intend to clear the server-side session.
            </p>
          </div>
        </details>
        <details className="help-spoiler" data-testid="help-item-empty-history">
          <summary
            className="help-spoiler__summary"
            data-testid="help-trigger-empty-history"
          >
            <span className="help-spoiler__title">
              Message history or search looks empty
            </span>
            <span className="help-spoiler__cta">
              <span className="help-spoiler__cta-collapsed">Expand</span>
              <span className="help-spoiler__cta-expanded">Collapse</span>
            </span>
          </summary>
          <div className="help-spoiler__body">
            <p>
              History and search use <strong>local browser storage</strong> on
              this device only. Another browser, incognito mode, or clearing
              site data will not show the same archive. Successful replies are
              recorded after each completed exchange.
            </p>
          </div>
        </details>
        <details className="help-spoiler" data-testid="help-item-cannot-send">
          <summary
            className="help-spoiler__summary"
            data-testid="help-trigger-cannot-send"
          >
            <span className="help-spoiler__title">Cannot send a message</span>
            <span className="help-spoiler__cta">
              <span className="help-spoiler__cta-collapsed">Expand</span>
              <span className="help-spoiler__cta-expanded">Collapse</span>
            </span>
          </summary>
          <div className="help-spoiler__body">
            <p>
              Empty input is blocked. While the assistant is “Thinking…”,
              sending is disabled—wait for the reply or for an error to appear.
              If the input stays disabled, reload the page after fixing API
              connectivity.
            </p>
          </div>
        </details>
        <details className="help-spoiler" data-testid="help-item-reset-no-history">
          <summary
            className="help-spoiler__summary"
            data-testid="help-trigger-reset-no-history"
          >
            <span className="help-spoiler__title">
              Reset Chat does not clear history
            </span>
            <span className="help-spoiler__cta">
              <span className="help-spoiler__cta-collapsed">Expand</span>
              <span className="help-spoiler__cta-expanded">Collapse</span>
            </span>
          </summary>
          <div className="help-spoiler__body">
            <p>
              <strong>Reset Chat</strong> calls <code>POST /api/reset</code>{' '}
              and clears the on-screen thread. It does <strong>not</strong>{' '}
              delete entries under Message history (local archive). To clear
              local history, use your browser’s site data / storage settings for
              this origin.
            </p>
          </div>
        </details>
      </div>
    </div>
  )
}
