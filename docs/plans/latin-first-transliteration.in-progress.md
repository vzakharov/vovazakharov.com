# Latin first: names and words in a script the reader may not read

## Goal

A song, artist or album whose name or words are in a script the reader's locale does not read natively shows them **in Latin letters by default**. Clicking the song's title on its page switches to the original spelling, and the choice holds for every name and every song across the site until clicked again.

- **Which text gets a Latin spelling is decided by script, not language.** Under `en`, anything not in Latin letters. Under `ru`, anything neither Latin nor Cyrillic. So a Russian or Tatar song stays Cyrillic under `ru`, and Arabic or Greek is shown in Latin under both locales.
- **The two modes differ only in spelling.** _Nochnoy sad_ ↔ «Ночной сад». The muted line under a title carries the translation alone in both modes. The transliteration it carries today goes, because the title itself is now the transliteration.
- **Lyrics follow the same switch.** In Latin mode the words column shows the Latin lines in place of the script. A song flagged `keepsScript` (Mithqal) keeps its script in both modes: Latin mode sets the romanization line under line beneath it, as the switch does today, and original mode shows the script alone.
- **The lyrics switch above the words goes**: the title is the switch. It is a switch on any page with something to switch, including a Latin title over Cyrillic words (_Trisagion_ under `en`), where clicking it changes the words alone.
- **A line in a third script inside the words stays as it is now**, glossed by its note: farewell's Wang Wei lines in Chinese, among Russian. The rule romanizes only the main language's letters, so in Latin mode the Russian around them turns Latin and the Chinese does not. Setting a romanization over such a line as `<ruby>`, with the note keeping only the meaning, is a follow-up (§ "Not in this plan").
- **A Latin spelling is set in italics** wherever it shows, as a transliteration is today.
- **Metadata follows the default.** `<title>`, `og:title` and the feeds carry the Latin spelling where the locale gets one, so an English link preview of a Russian song reads _Nochnoy sad_.

## How the preference works without a flash

Both spellings are in the static HTML, each in its own `<span data-spelling="latin|original">`. A few lines of inline script in `<head>`, beside Mantine's `ColorSchemeScript` and built the same way, read the saved choice from `localStorage` and set `data-script="original"` on `<html>` before the body is painted. The stylesheet hides one span or the other by that attribute.

So the first paint is already the right spelling. React renders both spans regardless of the preference, so hydration never disagrees with the server's HTML. Places that take a string rather than markup (the Media Session's lock-screen metadata, `document.title` in original mode) read the same preference through one client hook. That hook also listens to the `storage` event, so a second open tab follows the switch.

## The tip

The tip is a Mantine popover anchored to the song title on its page.

- **First visit, no saved choice:** open, saying "Tap to see the original script" / «Нажми, чтобы увидеть оригинальное написание». It stays until the title is clicked or the tip is closed with its ×. Closing it is remembered, and Latin stays.
- **After any click:** the tip says how to go back — "Tap to switch back to Latin letters" / «Нажми, чтобы вернуться к латинице», or the reverse after a switch back. It closes after about four seconds or on the next tap anywhere.
- **"Tap" becomes "Click" on a device with a mouse**, via a `(hover: hover)` media query over two spans. That keeps it CSS-only, like the spellings.
- A page with nothing to switch under this locale has a plain-text title: no button and no tip.

## Where the Latin spelling comes from

- **Russian is romanized by rule**, in `romanize.ts`, BGN/PCGN-style:
  - а b в v г g д d з z и i й y к k л l м m н n о o п p р r с s т t у u ф f х kh ц ts ч ch ш sh щ shch ы y э e ю yu я ya ж zh.
  - **е** → `e` after a consonant, `ye` everywhere else: word start, after a vowel, after ь/ъ. That gives _yest_, _bushuyet_, _Dobroye utro_, _krayem morya_.
  - **ые** → `ye`, **ый** → `y`: _Poluzhivye_, _Gryobany bal_, _Prizrachny blyuz_. These two pairs are matched before the single letters.
  - **ё** → `yo` (_pyos_, _idyot_), except `o` after ж ч ш щ (_zholty_).
  - **ь, ъ** → `ʼ` (U+02BC), as in Schadina: _Dvadtsatʼ_, _Pyatʼ romansov_.
  - Latin text and punctuation pass through, so «Гамлет (Extended Version)» → _Gamlet (Extended Version)_. Capitalization follows the source letter, and a digraph capitalizes its first letter only (Ш → Sh).
- **Every other script is romanized by hand**, because no rule gets it right:
  - Arabic is written without its short vowels except in a fully vowelled text. Even then the article's assimilation, the elided _hamzat al-wasl_ and the pausal endings at line ends are choices a romanizer would get wrong.
  - Tatar's к/г and е/ы read differently by vowel harmony.
  - Lyrics take a `<!-- lyrics:<language>-latn -->` section, which `alignTransliteration` already checks stanza for stanza. Titles take a frontmatter `titleLatin`; artists and albums take a `latin` beside their names. A hand-written spelling also wins over the rule where both apply, for a name with an established Latin spelling.
- **The build fails** on any name or words in a script some locale needs romanized when neither a rule nor a hand-written spelling covers them.

## Progress

- **Done:**
  - step 1, `romanizeRussian` and its tests, in dfa1927;
  - steps 2–3 in 061138c: `spell`, `needsLatin`, `songTitle` and `defaultSpelling` with tests, and the frontmatter change;
  - step 4 in 53bc142: every bullet, artists and albums included. Minem babay also needed a `titleLatin`.
  - step 5: `songLyrics` gives a `transliteration` wherever `mostlyNeedsLatin` says most of the words' letters are unreadable under the locale (so farewell's Chinese does not turn its Russian Latin under `ru`) — the `-latn` section, else `romanizeStanzas` for Russian, else the build fails — and carries `keepsScript`. `entryText` moved into `lyric-notes.ts`.
  - steps 7 and 9 in 8a64e5f, as sketched below: `SpelledLink` (`player-state.ts`) is a billing part and a catalogue tile alike; `TrackButton` takes only `track` and spells its label itself; the artist and album pages' metadata already take `spelledText`. No music name shows on the home page, so the work section needed nothing.
  - step 6: `src/shared/lib/script-preference.ts` (`SCRIPT_PREFERENCE_SCRIPT`, `useScriptPreference()` → `{ script, chosen, choose }`, storage key `script`, `storage` event followed), the head script in `root-layout.tsx`, the hiding rule in `globals.scss`, and `src/pages/music/ui/spelling.tsx` (`<Spelling>`, which replaced `song-name.tsx` — its callers still import `SongName` and are step 7's).
- **Deviations from the steps below:**
  - `romanize.ts` and `spelling.ts` live in `src/shared/music-catalogue/`, exported from its barrel, not in `pages/music/lib`: `shared/content/feeds.ts` spells titles too, and `shared` cannot import `pages`. `title-gloss.ts`'s script table already moved there, so step 2's move is done; `title-gloss.ts` itself is still there for step 9 to delete.
  - `TitleGloss` is `{ translation }` with `translation` required, so an artist with nothing to translate (Иске Кормаш, Киндерштайн) has no entry.
  - Step 6's head script, storage key and client hook are in `src/shared/lib/script-preference.ts`, not `pages/music/lib`, since `src/app/ui/root-layout.tsx` needs the first two and the preference is site-wide.
  - The spelling model and the romanizer are also exported from `shared/music-catalogue/index.node-safe.ts`: the main barrel pulls the schema's `server-only`, which breaks tests and would break client components.
  - Step 7 as sketched when paused: `projectName`/`albumTitle` return a `Spelled` (by the Russian rule, `spell({ text, language: 'ru' }, locale)`); `Billing` parts carry a `Spelled` name instead of a `label`; `billingText` and string consumers take the reader's `Script` (a `spelledText(spelled, script = 'latin')` helper replacing `defaultSpelling`); `PlayerTrack.titles` is `Record<Locale, Spelled>` from `songTitle`. Step 9 folds in there: `title-gloss.ts` goes, and a gloss is just the optional `{ translation }` looked up from `PROJECT_GLOSSES`, the album record or the song's locale.
- **The tree type-checks**, and lint passes on `src/pages/music` and `src/shared` but for one error: `@eslint-react/dom-no-dangerously-set-innerhtml` on the head script in `root-layout.tsx`. A `<script>` child is no way out, since React escapes its `'`s. **Open question to Vova**: may it carry a point-of-use suppression, the invariant being that the string is a compile-time constant (`SCRIPT_PREFERENCE_SCRIPT`)?
- **Next:** step 8, the title switch, then 10 (`listenTitle` on the song page already gets the Latin string; `shared/content/feeds.ts` is what is left), 11 and 12. The sessions so far paused for their context budget, each at a committed step boundary.

## Steps

1. **Romanizer.** `src/pages/music/lib/romanize.ts`, Russian rules as above, with `romanize.test.ts`. The tests cover every rule, the 67 titles' current hand-written spellings (now expected to differ only where the е/ё/ь rules say so), and Latin pass-through.
2. **The spelling model.** `src/pages/music/lib/spelling.ts`:
   - a `Spelled` type `{ original: string; latin?: string }`;
   - `spell(text, language, locale, override?)`, which decides by script whether the locale needs a Latin spelling and takes the override, else the rule, else throws;
   - `needsLatin(text, locale)`, built from the script table `title-gloss.ts` already holds, which moves here.
3. **Frontmatter** (`shared/music-catalogue/frontmatter.ts`):
   - drop `titleTransliterated` and the gloss's `transliteration`, so a locale's gloss is `{ translation }`;
   - add `titleLatin` (a hand-written Latin title) and `keepsScript: boolean` (default `false`, the "show the script beside its romanization" flag).
   - The `songs.md` rule's paragraphs on titles and romanization are rewritten to match.
4. **Content migration**, one mechanical commit:
   - delete the 67 `transliteration:` lines from song frontmatter;
   - Mithqal: `title: 'مِثْقَال'`, `titleLatin: 'Mithqāl'`, `keepsScript: true`;
   - Agios o skopos: `title: 'Άγιος ο σκοπός'`, `titleLatin: 'Ágios o skopós'`;
   - In the End: an `ar-latn` section, _Wa-akhīran ṣamt_, from its own footnote;
   - Minem babay: a `tt-latn` section in Zamanälif, written by the agent and flagged for Vova to check;
   - artists (`projects.ts`) and albums (`albums.ts`) lose their gloss transliterations; every Cyrillic name among them is romanized by rule.
5. **Lyrics data.** `songLyrics` returns a `transliteration` for every song whose words need one under the locale: the hand-written section where there is one, else the rule applied line by line, into the same `Transliteration` shape. It also returns `keepsScript`.
6. **`<Spelling>` component and the preference** (`src/pages/music/ui/spelling.tsx`, `lib/use-script-preference.ts`):
   - the component renders one span, or both spans tagged as above;
   - the head script goes in `src/app/ui/root-layout.tsx`;
   - the stylesheet rule goes in `src/app/styles/globals.scss`, because every site's layout carries both.
7. **Every name goes through `<Spelling>`.** `SongName` takes a `Spelled`, and so do `player-state`'s `SongName`, the catalogue grid, the song list, artist/album/catalogue headers, the player bar, the video dialog's heading, and the home page's work section. `use-audio-player.ts` feeds the Media Session the spelling the preference picks.
8. **The title switch.** `src/pages/music/ui/script-switch.tsx` (client) wraps the song page's `<h1>` text in a button that has `aria-pressed` and the popover tip, and writes the preference. `TransliterationToggle` and its `data-transliteration` styles are deleted. `Lyrics` renders a line as Latin only, original only, or original with Latin under it, by mode and `keepsScript`.
9. **Gloss line**: `titleGloss`/`TitleGlossLine` reduce to the translation.
10. **Metadata and feeds**: `generateSongMetadata`, the artist and album pages' metadata, `listenTitle` and `shared/content/feeds.ts` take the default spelling, which is Latin where the locale gets one.
11. **Messages**: `music.titleScript.{toOriginal,toLatin}` with tap/click variants in `en.json` and `ru.json`. `music.lyrics.transliteration` goes.
12. **Check**: `./scripts/vet.sh`, then `/preview` of a Russian song under `en` (fresh, after a click, after a reload), of Mithqal under `ru` in both modes, of Minem babay under `ru` (Cyrillic, no switch), and of the music index under `en` in both modes.

## DRY notes

- **One spelling path for every name.** Songs, artists and albums all resolve through `spell()` and render through `<Spelling>`. Today each carries its own gloss transliteration and its own italic `SongName` call, which this replaces rather than adds beside.
- **Reused as they stand:**
  - `alignTransliteration` checks the hand-written sections;
  - the `Transliteration` shape carries the rule's output, so `Lyrics` has one rendering path whichever source the Latin came from;
  - the `ColorSchemeScript` pattern (both states in the HTML, an attribute on `<html>` set before paint) is the model for the head script.
- **Moved, not copied:** the script table in `title-gloss.ts` moves to `spelling.ts`, where `needsLatin` and the gloss both read it.
- **Not extracted:** a generic "transliteration engine" with a pluggable table per language. One rule-based language does not pay for a plugin interface; a second one would be the time to cut it.

## Not in this plan

- **Ruby for lines in a third script.** Today such a line carries its romanization in a footnote; farewell's Chinese has its pinyin there. `<ruby>` is the typographic form made for this: pinyin set over the characters it reads, in both modes, leaving the note only the meaning. It needs an inline mark in the words, e.g. `{下马饮君酒|Xià mǎ yǐn jūn jiǔ}`, that the verse reader parses, which is separate work. It is proposed as its own issue.

## Settled with the operator

- ё after ж ч ш щ is `o`; artists and albums go by rule with no overrides; a Latin spelling is set in italics everywhere it shows; the tip works as § "The tip" says; In the End gets an `ar-latn` section.
