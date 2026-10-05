import { useEffect, useState } from 'react'
import fireGif from '../../assets/fire-fireball.gif'
import { useHardMode } from '../useHardMode'

export type SupportVariant = 'support' | 'question' | 'discount'

interface VariantCopy {
  frameTitle: string
  heading: string
  label: string
  /** `email` renders a single-line email input instead of a textarea. */
  field: 'textarea' | 'email'
  submit: string
  /** Shown after the "rate us" modal; `#N` is the seeded ticket number. */
  done: string
  /** Ms until the page-level close button appears. */
  closeAfter: number
  /** Shows the animated fireball next to the heading. */
  fire?: boolean
}

const VARIANTS: Record<SupportVariant, VariantCopy> = {
  support: {
    frameTitle: 'Support chat',
    heading: 'Support',
    label: 'Describe your issue',
    field: 'textarea',
    submit: 'Submit ticket',
    done: 'Ticket #N created',
    closeAfter: 0,
  },
  question: {
    frameTitle: 'Question form',
    heading: 'Ask us',
    label: "What's your question?",
    field: 'textarea',
    submit: 'Send question',
    done: 'Question #N received',
    closeAfter: 2000,
    fire: true,
  },
  discount: {
    frameTitle: 'Discount form',
    heading: 'Get 10% off',
    label: 'Leave your email for a 10% discount',
    field: 'email',
    submit: 'Get discount',
    done: 'Discount code #N sent',
    closeAfter: 4000,
    fire: true,
  },
}

// A self-contained page rendered via srcdoc: its DOM is out of reach of page
// locators, so tests have to go through frameLocator(). It has its own modal
// ("rate us") that pops up after submitting. Sizes are in em off the body
// font, so the whole form scales with the iframe.
function supportPageHtml(copy: VariantCopy, ticket: number): string {
  const field =
    copy.field === 'email'
      ? '<input id="issue" name="email" type="email" autocomplete="email">'
      : '<textarea id="issue" name="issue"></textarea>'
  const done = copy.done.replace('#N', `#${ticket}`)
  // srcdoc frames resolve URLs against the parent page, so Vite's asset URL works.
  const fire = copy.fire ? `<img class="fire" src="${fireGif}" alt="">` : ''
  return `<!doctype html>
<html><head><meta charset="utf-8"><style>
  * { box-sizing: border-box; }
  /* vh/vw are the iframe's own size: shrink the type when it's squeezed so
     the form always fits without a scrollbar. */
  html { overflow: hidden; }
  body { margin: 0; padding: 0.92em;
    font: min(39px, 6.5vh, 4.5vw)/1.4 system-ui, sans-serif;
    color: #e3e6f0; background: #11131d; }
  p { margin: 0.6em 0 0; }
  h1 { display: flex; gap: 0.4em; align-items: center; margin: 0 0 0.6em;
    font-size: 1.08em; }
  .fire { width: 1.8em; height: 1.8em; margin: -0.4em 0; image-rendering: pixelated; }
  label { display: block; margin-bottom: 0.3em; color: #a5a8bd; }
  textarea, input { width: 100%; padding: 0.46em;
    border: 1px solid #343850; border-radius: 0.46em; background: #181b28;
    color: inherit; font: inherit; }
  textarea { height: 4.15em; resize: none; }
  button { margin-top: 0.6em; padding: 0.38em 0.77em; border: 1px solid #4a4f6e;
    border-radius: 0.46em; background: #262a3d; color: inherit; font: inherit;
    cursor: pointer; }
  button:disabled { opacity: .45; cursor: not-allowed; }
  .primary { background: #6d4cff; border-color: #6d4cff; color: #fff; }
  .overlay { position: fixed; inset: 0; display: flex; align-items: center;
    justify-content: center; background: rgb(0 0 0 / 70%); }
  .dialog { width: 85%; padding: 0.92em; border: 1px solid #343850;
    border-radius: 0.6em; background: #181b28; }
  .dialog h2 { margin: 0 0 0.46em; font-size: 1em; }
  .stars button { margin-right: 0.3em; }
  [hidden] { display: none !important; }
</style></head><body>
  <h1>${fire}${copy.heading}</h1>
  <form id="form">
    <label for="issue">${copy.label}</label>
    ${field}
    <button type="submit" class="primary" id="submit" disabled>${copy.submit}</button>
  </form>
  <p id="done" role="status" hidden></p>
  <div class="overlay" id="rate" hidden>
    <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="rate-title">
      <h2 id="rate-title">How was your experience?</h2>
      <div class="stars">
        <button type="button" data-score="1">1</button>
        <button type="button" data-score="2">2</button>
        <button type="button" data-score="3">3</button>
        <button type="button" data-score="4">4</button>
        <button type="button" data-score="5">5</button>
      </div>
      <button type="button" id="skip">Skip</button>
    </div>
  </div>
<script>
  const issue = document.getElementById('issue')
  const submit = document.getElementById('submit')
  const form = document.getElementById('form')
  const rate = document.getElementById('rate')
  const done = document.getElementById('done')
  issue.addEventListener('input', () => {
    submit.disabled = !issue.value.trim() || !issue.checkValidity()
  })
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    rate.hidden = false
  })
  function finish(score) {
    rate.hidden = true
    form.hidden = true
    done.hidden = false
    done.textContent = ${JSON.stringify(done)} + (score ? ' — rated ' + score + '/5' : '') + '.'
  }
  document.querySelectorAll('[data-score]').forEach((b) =>
    b.addEventListener('click', () => finish(b.dataset.score)))
  document.getElementById('skip').addEventListener('click', () => finish(null))
</script>
</body></html>`
}

export default function SupportWidget({ variant = 'support' }: { variant?: SupportVariant }) {
  const { rand } = useHardMode()
  // The original support form keeps its old rng key so its ticket stays put.
  const draw = variant === 'support' ? rand('ticket') : rand('ticket', variant)
  const ticket = 1000 + Math.floor(draw * 9000)
  const copy = VARIANTS[variant]
  const [closable, setClosable] = useState(copy.closeAfter === 0)
  const [closed, setClosed] = useState(false)

  useEffect(() => {
    if (copy.closeAfter === 0) return
    const timer = setTimeout(() => setClosable(true), copy.closeAfter)
    return () => clearTimeout(timer)
  }, [copy.closeAfter])

  if (closed) return null

  // The close button sits on the page, outside the iframe, over its corner.
  return (
    <div className={`hm-support hm-support--${variant}`}>
      <iframe
        className="hm-support__frame"
        title={copy.frameTitle}
        srcDoc={supportPageHtml(copy, ticket)}
      />
      {closable && (
        <button
          type="button"
          className="hm-support__close"
          aria-label={`Close ${copy.frameTitle.toLowerCase()}`}
          onClick={() => setClosed(true)}
        >
          ×
        </button>
      )}
    </div>
  )
}
