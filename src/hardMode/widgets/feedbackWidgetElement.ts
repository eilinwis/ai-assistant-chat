export const FEEDBACK_WIDGET_TAG = 'feedback-widget'

const TEMPLATE = `
<style>
  :host { display: block; }
  .box { display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;
    padding: 0.55rem 0.8rem; border: 1px dashed var(--line, #444);
    border-radius: var(--radius-md, 10px); color: var(--text-muted, #aaa);
    font-size: 0.85rem; }
  .q { margin: 0; flex: 1; }
  button { font: inherit; padding: 0.3rem 0.7rem; border-radius: 999px;
    border: 1px solid var(--line, #444); background: var(--surface, transparent);
    color: var(--text, #eee); cursor: pointer; }
  button:hover { background: var(--surface-hover, #333); }
  [hidden] { display: none !important; }
</style>
<div class="box">
  <p class="q">Was this chat helpful?</p>
  <span class="actions">
    <button type="button" data-vote="yes">👍 Yes</button>
    <button type="button" data-vote="no">👎 No</button>
  </span>
  <p class="q thanks" role="status" hidden></p>
</div>`

/** Registers <feedback-widget>, whose UI lives in an open shadow root. */
export function defineFeedbackWidget(): void {
  if (customElements.get(FEEDBACK_WIDGET_TAG)) return

  class FeedbackWidgetElement extends HTMLElement {
    connectedCallback() {
      if (this.shadowRoot) return
      const root = this.attachShadow({ mode: 'open' })
      root.innerHTML = TEMPLATE
      const question = root.querySelector<HTMLElement>('.q:not(.thanks)')
      const actions = root.querySelector<HTMLElement>('.actions')
      const thanks = root.querySelector<HTMLElement>('.thanks')
      root.querySelectorAll<HTMLButtonElement>('button[data-vote]').forEach((button) => {
        button.addEventListener('click', () => {
          if (!question || !actions || !thanks) return
          question.hidden = true
          actions.hidden = true
          thanks.hidden = false
          thanks.textContent =
            button.dataset.vote === 'yes'
              ? 'Thanks for your feedback!'
              : "Thanks — we'll try to be funnier."
        })
      })
    }
  }

  customElements.define(FEEDBACK_WIDGET_TAG, FeedbackWidgetElement)
}
