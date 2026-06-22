/**
 * One silly reply per English letter (A–Z). The first letter in the user’s
 * message (skipping leading non-letters) picks the line.
 */
export const FUNNY_REPLIES_BY_LETTER: Record<string, string> = {
  A: 'Actually, your Wi‑Fi password is judging your snack choices.',
  B: 'Bananas are just shy yellow kayaks that never learned to swim.',
  C: 'Cats believe “close enough” is a formal software release strategy.',
  D: 'Ducks think breadcrumbs are cryptocurrency with excellent UX.',
  E: 'Error 418: I am a teapot and I deny all responsibility for your bugs.',
  F: 'Fun fact: Friday was invented so Thursday could finally exhale.',
  G: 'Gravity is just the Earth being clingy in a scientifically dignified way.',
  H: 'Historians agree: the first bug was a literal beetle with opinions.',
  I: 'If debugging was easy, it would be called “catching butterflies.”',
  J: 'JavaScript and I have the same relationship: love, fear, semicolons.',
  K: 'Keyboards are really just aggressive finger trampolines.',
  L: 'Lemons walk into bars and expect you to make the punchline.',
  M: 'My codebase is “legacy” the way pizza is “slightly experimental.”',
  N: 'Never trust a function that smiles without a return type.',
  O: 'Ostriches would make great PMs: great vision, questionable sprints.',
  P: 'Programmers don’t panic; we just `console.log` our feelings.',
  Q: 'Queue is just Q with four impatient friends standing behind it.',
  R: 'Recursion: see “Recursion,” but bring snacks.',
  S: 'Socks in the dryer are off-chain NFTs with zero provenance.',
  T: 'Tabs versus spaces? The real war is humans versus reasonable bedtimes.',
  U: 'Underpromise, overdeliver, overuse umbrella metaphors.',
  V: 'Variables hold hands with values in a strictly platonic scope.',
  W: 'White lemmings do not exist in the modern digital era',
  X: 'XML was a social experiment to make angle brackets feel important.',
  Y: 'YAML stands for “You Aren’t Making Layouts” … roughly.',
  Z: 'ZIP files are introverted folders wearing compression hoodies.',
}

export const FUNNY_HELLO_THERE_EXACT_REPLY = 'GENERAL KENOBI!!'

export const FUNNY_NO_LETTER_FALLBACK =
  "Hmm, I need at least one letter—otherwise my joke alphabet files for unemployment."

/** Duration to show the animated GIF before freezing on the last frame (chat only). */
export const CHAT_INLINE_GIF_PLAY_DURATION_MS = 6200
