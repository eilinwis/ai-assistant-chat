import { useHardMode } from '../useHardMode'

// A self-contained page rendered via srcdoc: its DOM is out of reach of page
// locators, so tests have to go through frameLocator(). It has its own modal
// ("rate us") that pops up after submitting.
function supportPageHtml(ticket: number): string {
  return `<!doctype html>
<html><head><meta charset="utf-8"><style>
  * { box-sizing: border-box; }
  body { margin: 0; padding: 12px; font: 13px/1.4 system-ui, sans-serif;
    color: #e3e6f0; background: #11131d; }
  h1 { margin: 0 0 8px; font-size: 14px; }
  label { display: block; margin-bottom: 4px; color: #a5a8bd; }
  textarea { width: 100%; height: 54px; resize: none; padding: 6px;
    border: 1px solid #343850; border-radius: 6px; background: #181b28;
    color: inherit; font: inherit; }
  button { margin-top: 8px; padding: 5px 10px; border: 1px solid #4a4f6e;
    border-radius: 6px; background: #262a3d; color: inherit; font: inherit;
    cursor: pointer; }
  button:disabled { opacity: .45; cursor: not-allowed; }
  .primary { background: #6d4cff; border-color: #6d4cff; color: #fff; }
  .overlay { position: fixed; inset: 0; display: flex; align-items: center;
    justify-content: center; background: rgb(0 0 0 / 70%); }
  .dialog { width: 85%; padding: 12px; border: 1px solid #343850;
    border-radius: 8px; background: #181b28; }
  .dialog h2 { margin: 0 0 6px; font-size: 13px; }
  .stars button { margin-right: 4px; }
  [hidden] { display: none !important; }
</style></head><body>
  <h1>Support</h1>
  <form id="form">
    <label for="issue">Describe your issue</label>
    <textarea id="issue" name="issue"></textarea>
    <button type="submit" class="primary" id="submit" disabled>Submit ticket</button>
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
  issue.addEventListener('input', () => { submit.disabled = !issue.value.trim() })
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    rate.hidden = false
  })
  function finish(score) {
    rate.hidden = true
    form.hidden = true
    done.hidden = false
    done.textContent = 'Ticket #${ticket} created' + (score ? ' — rated ' + score + '/5' : '') + '.'
  }
  document.querySelectorAll('[data-score]').forEach((b) =>
    b.addEventListener('click', () => finish(b.dataset.score)))
  document.getElementById('skip').addEventListener('click', () => finish(null))
</script>
</body></html>`
}

export default function SupportWidget() {
  const { rand } = useHardMode()
  const ticket = 1000 + Math.floor(rand('ticket') * 9000)
  return (
    <iframe
      className="hm-support"
      title="Support chat"
      srcDoc={supportPageHtml(ticket)}
    />
  )
}
