# Relay 1 — iPhone plays the preloaded next track over the current one

Parked by the keepalive's last wake on an idle session, with no successor
started.

## Standing constraints

None stated.

## The conversation

1. **Operator:** «словил баг на айфоне (только на нём): при определённых
   обстоятельствах (кажется, как-то связано с обновлением страницы,
   переключением аппов, или какими-то другими аппами которые могут воспроизводить
   звук -- но ничто из этого не точно), начинаются одновременно играться и
   текущий трек и предзагруженный следующий (тот который по плану молчит пока не
   произошла подмена). посмотри можно ли найти причину в коде»

   Mid-turn addition: «если найдёщь однозначно, то менять»

   **Agent:** routed it as rung 2 (no change). Read `decks.ts`,
   `use-audio-player.ts`, `use-station.ts` and `use-media-session.ts`, plus
   WebKit's media sources (fetched into the scratchpad, not the repo). Found no
   unambiguous cause, so it changed nothing. The finding: our code only ever
   calls `play()` on the active deck, so iOS must be starting the standby deck
   itself, either when an interruption ends (`PlatformMediaSession::
endInterruption` → `mayResumePlayback`) or when a lock-screen command is
   routed to one element and the page has no media-session handler. Every deck
   listener filters on `deck === active`, so nothing stops the standby deck.
   Proposed a guard: a `play` on the standby deck is paused at once. Made the
   muthur sync offer once (see Next step).

2. **Operator:** «точно, это происходило вроде когда я из экрана лока нажимал
   play»

   **Agent:** that fits the remote-command path: the lock-screen play is routed
   to one element, and when the page counts as interrupted WebKit plays or
   resumes elements itself. Still not proven which branch fires, so it offered
   the guard again and gave the context-budget figures for a relay.

3. **Operator:** «давай делать»

   **Agent:** `/task` → planless (one file, shape clear). Renamed the branch,
   committed the guard, ran `/polish` (nothing to change), opened draft PR #185
   with a QA checklist, and posted the squash proposal. Reported that the unit
   rows of the checklist are uncovered (the suite tests only pure functions) and
   asked whether to add a test with a faked `Audio`. No answer yet.

4. **Operator:** «> The player only ever starts the active deck, so a play on
   the standby deck is now paused on the spot

   а когда айфон сам начинает играть, он нашу аппу вообще что-то спрашивает? то
   есть в силах ли она вообще "остановить" что-то?»

   **Agent:** iOS asks nothing; it starts the element and then fires `play` to
   JS. `pause()` still works there: the deck has already had its user-gesture
   restriction lifted (it played before, or the remote command counts as a
   gesture), the interruption is over by the moment of the self-start, and the
   page's JS is awake while audio plays. Caveat: the event is async, so a
   fraction of a second of the next track may be heard before the pause. This is
   from reading WebKit, not from a device.

## Intent

Stop the iPhone from playing two tracks at once, the next one preloaded on the
standby deck. The operator allowed a code change only if the cause was found
"однозначно"; they then accepted the guard ("давай делать") knowing the exact
iOS trigger is unproven.

## Decisions

- **Guard over a root-cause fix.** The guard pauses the standby deck on its own
  `play` event, whichever iOS path starts it. It beat chasing one trigger
  because the trigger depends on the iOS version and could not be settled
  without a device and Web Inspector.
- **Planless.** One file, its shape clear.
- **Terms:** _active deck_ / _standby deck_ are `decks.ts`'s two audio
  elements, the one that plays and the one preloading the next file.

## Errors and dead ends

- Deleting the old remote branch `claude/clever-goodall-wp3lnz` was refused
  with a 403 by the git proxy. It has no PR, so it was left.
- WebKit's ended path and src changes were checked as ways for the standby deck
  to keep a "resume me" state; neither held up in current WebKit `main`.

## State

- **Branch:** `claude/guard-standby-deck-wp3lnz`, pushed, working tree clean.
- **PR:** https://github.com/vzakharov/vovazakharov.com/pull/185 — draft,
  open, mergeable. Its squash proposal is posted and tracked in
  `docs/remove-before-merging/squash-message.md`.
- **Plan file:** none; the work was planless.
- **Vet:** not run, being `/finalize`'s job. Lint, Prettier and type-check of
  `decks.ts` passed.
- **Estimate:** 3 h senior developer, unchanged. It covers the whole job, and
  what is left is `/finalize`.
- Nothing running: no CI on PRs, no subscription, no check-in.

## Pointers

- `src/pages/music/lib/decks.ts` — the guard: a `listen()` helper and the
  standby `play` → `pause()` listener.
- `docs/remove-before-merging/squash-message.md` — the squash body.
- WebKit sources that carried the reasoning (not in the repo), re-fetched with
  `curl -sSfL https://raw.githubusercontent.com/WebKit/WebKit/main/<path>`:
  `Source/WebCore/html/HTMLMediaElement.cpp` (`mayResumePlayback`,
  `didReceiveRemoteControlCommand`, `pause`),
  `Source/WebCore/platform/audio/PlatformMediaSession.cpp`
  (`beginInterruption`, `endInterruption`),
  `Source/WebCore/html/MediaElementSession.cpp`
  (`playbackStateChangePermitted`, `didReceiveRemoteControlCommand`),
  `Source/WebCore/platform/audio/MediaSessionManagerInterface.cpp`
  (`processDidReceiveRemoteControlCommand`).
- Transcript: https://claude.ai/code/session_015pp9rsDnuYA2ugzeRgGU2Q

## Next step

Wait for the operator. Two things are open:

- Their answer to «добавь тест?», which would add a unit test for the guard
  with a faked `Audio`.
- Their QA on the iPhone, chiefly the `lock-screen-play` row of the PR's
  checklist, then `/finalize`.

The muthur sync offer was made; do not make it again.
