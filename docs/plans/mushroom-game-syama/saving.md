# The last bite — the meadow is kept

The bite after dusk, the last before `/relay finalize`: what Syama planted
survives a reload. Asked by the operator as a question, then agreed point by
point («время - ок, версионность - ок (тогда сохранение лучше отложить до
последнего момента), артефакт - ок»), so it comes last, once nothing else
reshapes the meadow's data.

- **Meadows are numbered in the URL hash.** `#1` is the first; `#new` opens
  a fresh meadow under the next number and rewrites the hash to it; a bare
  link goes to the highest number already kept (or `#1` when none is).
- **Kept in IndexedDB, written after every action.** Cheap, and nothing is
  lost to a closed tab.
- **Saved at rest.** The game's clock starts at zero on every load, so the
  timestamps in the meadow (a shower's start, a flier's take-off, a growth)
  mean nothing in the next one. What is kept is the meadow as it would
  stand once everything settled: grown, perched, no shower under way. The
  time of day is kept.
- **The format is versioned.** A kept meadow that this version cannot read
  is left where it is, never overwritten or deleted, and the game opens a
  fresh one beside it.
- **No storage, no keeping.** Where the browser refuses IndexedDB (a private
  window, the Artifact's sandbox), the game opens a fresh meadow, as it does
  today.
