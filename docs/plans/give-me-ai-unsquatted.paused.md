# The lightbulb behind "give me ai"

## The task, as asked

> дополнительный запрос, давай всё-таки сделаем ИИ доступной _не_ всем и не
> сразу, кажется, что долгота её работы может детрактить и размывать "blazing
> fast".
>
> давай если в поле ввода появляется дословно "give me ai", "выскакивает" (с
> небольшой анимацией) кнопочка лампочки и на неё стрелочка с надписью there you
> go, "весёлым" шрифтом как на превьюхах ("okay maybe not this one")

## Done

Nothing yet: the session that took the ask paused on its context budget before
editing.

## Left

1. **The gate.** `IdeasOffer` (`src/unsquatted/pages/home/ideas/offer/ui/`)
   returns nothing unless `available`; add an unlock: the field's value being
   exactly "give me ai" (case and surrounding spaces to decide; "дословно" reads
   as the phrase, not its casing). `useIdeas(label)` already gets the field's
   label in `page/ui/name-checker.tsx`.
2. **The pop-in.** The bulb appears with a small animation (a scale/overshoot
   pop), honouring `prefers-reduced-motion` as `deck/ui/shuffle-motion.ts` does.
3. **The arrow and "there you go"**, in the hand face: Caveat, which main
   carries as `--font-hand` (`src/unsquatted/app/ui/root-layout.tsx`, #248's
   41a1673b) and this branch does not yet — main has to be merged in first (the
   PR is `CONFLICTING`), or the face added here and reconciled at the merge. The
   copy goes in `checker/config/messages/en.json`.
4. Open questions for the operator (ask, and build what they do not block):
   - Does the unlock persist (localStorage), and does an opted-in visitor see
     the bulb without typing the phrase again? Default: yes to both.
   - What happens to "give me ai" in the field once it has unlocked — left to be
     checked as a name, or cleared? Default: left; it is a funny name to check.
   - When does the arrow go away — on press, on a timeout, on the next
     keystroke?
5. `/polish`, `/pr` refresh, republish the preview.

## Decisions

- The hand face is the one on the taken-name share card ("okay, maybe not these
  ones"), not a new font.
