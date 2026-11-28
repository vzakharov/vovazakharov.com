# Steering since the first answers

The second half of the plan (`docs/plans/horowo-clip.in-progress.md` § "Steering since"), split off for the 400-line cap. Each of the operator's messages verbatim, in order, with the lead's reading; a new one is appended here in a commit of its own before any code changes.

2026-11-28, with a screenshot of the usage limits (5-hour 28%, weekly all models
78%, weekly Fable 4%, the weekly ones resetting Monday 23:00), verbatim:

> 1- нужно поглядывать за лимитом и вовремя фиксировать прогресс (в идеале ещё
> разворачивать его -- либо артефактом, либо на превью. в принципе артефакта
> должно хватить)
>
> 2- #240 скоро смерджится, надо будет его вмерджить
>
> 3- как всё закончим, и если лимит ещё не кончится, нужно сделать вертикальную
> версию 30 секунд для сториса в телеграмме, и заканчиваться он должен короткой
> нарезкой из видюшек, как в конце
> https://github.com/vovas-music/lebed/commit/161d879e7e1e9dd0e1c7299ddf4bc5b8fc92fe6d#diff-99cc97a52a50eeba0c2eb0eb798aeafc2ecf7d006de07acb4c6324b82ef8acb1
> (только используемые видюшки надо выложить в релиз, а не в репу)
>
> 4- а, ну и то что здесь делаем, тоже лучше делать через релизы, чтобы не
> забить всю историю

And a question a few minutes later, verbatim:

> а, собственно, видео же никто генерить и не будет пока мы не завершим, это
> будет обычный хтмл? у тебя чуть ли не тула для таких видео-артефактов
> ("эксплейнеров") есть, но не знаю, насколько она подходит для концертов в
> дурдоме гг

Answered: yes, plain HTML until the end, the mp4 walked out of the same code
last. The tool is the "Motion" artifact type, and it was weighed and left: it
allows no scene under a second and no more than three cuts a second, which is
the zapping; its looks must suit a room of coworkers; and a film lives in the
artifact's own store, so the site's page would no longer be the clip's code. One
thing is taken from it as the clip's own rule: **no full-frame flash faster than
three a second** — cuts ride the beat (about 2.6 a second), never a strobe.

Then the song's structure by feel, verbatim:

> обращай внимание ещё на изменения темпа, там примерно такая структура:
>
> до 0:19 -- вступление (дискретные удары в начале такта), до 0:28 --
> double-time мясо до 0:36 -- первые полкуплета, бочка на четвертях, почти
> танцевальная до 0:43 -- вторая половина, типичный панковский standard time до
> 1:00 -- припев, халфтайм до 1:17 -- предбридж, четверть тайм (т.е. в 2 раза
> медленнее халфатайма) до 1:35 -- мелодичный бридж, четверть тайм потом до
> конца -- полностью меняется темп, медленный брейдаун с глитчами

It replaces the lead's own section map wherever they differ; § "The cut by feel"
below is the shot list redone against it.

And on how the rhythm shows, verbatim:

> ритм должен чувствоваться в видеоряде -- не перебарщивая, конечно, но нет-нет
> да бочка/ведущий должны совпадать со сменами кадра или ещё какими-то ощутимыми
> движениями

Then, on the lead's "measure the ending's tempo separately", verbatim:

> я не уверен что это только к концовке относится, интро возможно тоже другого
> темпа. пусть по каждой секции замерит
>
> #240 тем временем смерждился

So every section's tempo and downbeat is measured on its own, none assumed.

On the rhythm note: the kick and the snare are onset lists in the score, and
every scene has at least one thing that lands on them — a cut, a camera punch, a
head coming down, the TV's glow — while most of the frame stays off the grid, so
it reads as feel and not as a metronome.

Then, with the storyboard's kids'-show panel attached (the host waving on the
meadow under the grinning sun, the bunny behind the hill), verbatim:

> припев такой faux-счастливый должен быть, понимаешь, типа все веселятся и
> скачут по этому creepy лугу (но конечно это должно перемежаться с выскребанием
> надписи в дурдоме)

And right after: «врезки группы тоже можно делать» — the band playing live may
cut in as well.

Then, on what comes after and on moving accounts, verbatim:

> в конце видео нужно будет добавить на страницу песни -- но это уже скорее
> после тебя опус займётся, и скорее с нового аккаунта (лимит тут кончится).
>
> кстати, да, необходимость переноса на новый акк нужно учитывать -- релеи
> должны быть актуальными

So: the finished video goes onto the song's page (`/music/songs/horowo`) as a
last step, likely by an Opus session on another account. And the limit here will
run out, so the run must be resumable from the repository alone by a session
that can reach none of these sessions: the parked relay file is brought current
at every milestone, and nothing that matters lives only in a session.

The lead's reading of the four notes, each its own and open to correction:

1. Every milestone ends committed, pushed and playable from a link: the clip as
   it stands is published as an artifact (the page's code bundled into one HTML
   file, the song beside it). A preview slot is the fallback. The weekly limit
   across all models is the tight one, so wave 2 is sized to what is left rather
   than to what would be fastest.
2. When PR 240 lands on `main`, `main` is merged into this branch, `clip` takes
   `music` as a parent and the audio comes from the catalogue.
3. Last, if the limit allows: a vertical 30-second cut for a Telegram story,
   ending on a quick montage of video clips as that commit's does. The clips it
   uses go into a GitHub release, never the repository.
4. Nothing binary and heavy that this work produces is committed: every mp4 is a
   release asset. Board frames stay committed, small and few, under
   `docs/remove-before-merging/`, which a squash never carries to `main`.

On the tape's test card frame (the plate reading «КАНАЛ / ГБ»), attached to the
message:

> телеканал / грёбаный бал / представляет

The lead's reading: «ГБ» stands for «Грёбаный бал», and the clip opens on the
channel's ident — the test card's plate reads «ТЕЛЕКАНАЛ», «ГРЁБАНЫЙ БАЛ»,
«ПРЕДСТАВЛЯЕТ» on three lines, each line arriving on one of the intro's
bar-start hits, before the kids' show begins. The bug in the corner stays «ГБ».
The slashes are read as line breaks, not as three separate cards.

And a few minutes later, correcting that reading:

> заставка с телешумом/паттерном же ДО начала музыки показывается, да?

Yes: the ident is a pre-roll, before the first note. The film opens on about
three seconds without music — snow, the test card, the three lines arriving one
after another — and the song's first hit zaps to the kids' show. So the film is
longer than the song by the pre-roll: the film's playhead and the song's time
differ by that offset, the page starts the audio after it, and the mp4 carries
silence there. The lines on the intro's bar-start hits, as first read, are
dropped.

> а, и t.me/fknball вставить где подойдёт (лучше раньше)

The lead's reading: the channel's Telegram address is on screen from the first
second — written on the test card under the ident, in the tape's dot face, as a
TV channel prints its address. It may come back once more on the last frame
before the tube switches off, if the ending has room for it.

On the cast sheet, attached:

> чё-то у нас басисты-гитаристы левую руку не с той стороны грифа держат) я
> понимаю что треш, но на святое!

The lead's reading: the guitarist's and the bassist's fretting arm is draped
over the neck from above, the fist sitting on top of the fretboard. A player's
fretting hand comes from under the neck: elbow down, palm behind the neck,
fingers curling over its top edge onto the frets. A fix-up package on Opus,
branch `claude/horowo-clip-cast-fix-lrxscd`.

At 11:05 UTC, on the limit:

> так, мы на сейчас потратили 10% недельного лимита, остаётся 15%, оцени сколько
> это по API-костам и на сколько это хватит до того как нужно будет релейнуться
> и переключить акк

and «имею в виду "запарковаться"». The lead's answer, from the cost ledger: the
run's 10% is about $65–70 at API rates, so 1% is about $7 and the 15% left about
$100; at wave 1's pace that is an hour to an hour and a half. What is left of
the clip to a first full cut is about $65–70. The run parks (`/relay park`) when
about 3% is left; wave 2 runs on Opus only, and children wire their own scenes
so the lead reads less.

At about 14:15 UTC, after the five-hour limit had stopped every session for two
hours:

> Можешь продолжать но в принципе надо закругляться. Подсессии разбудил

The lead's reading: no new scenes and no third passes. The second passes over A,
B and C and the engine's pre-roll, which he woke, are let finish and merged;
then the run closes — the code's quality passes, a green vet, the mp4 in a
release, the PR and the relay summary current.

To the lead's one question — whether to put `masd-disable promotion` in
`puppet/body` and `puppet/head`, since the bedroom and the ward take only the
body from the puppet and the ending only the head, and neither can move out from
under the band, which stands on the body:

> Ок

Read as the yes for those two markers and nothing wider.
