import {
  audioPath,
  type BlindPiece,
  type Variant,
  variants,
} from "#src/blind-test/shared/blind-set/index.ts";
import { button, el } from "#src/blind-test/shared/ui/index.ts";
import { clock, variantKeys, variantLabel } from "../lib/labels.ts";
import { BlindPlayer } from "../model/blind-player.ts";
import {
  connectVerdicts,
  localVerdicts,
  type VerdictListeners,
  type Verdicts,
  type VerdictStore,
} from "../model/verdict-store.ts";
import { COPY } from "./copy.ts";
import { loadBlindSet } from "./load-blind-set.ts";

const TICK_MS = 200;
const SKIP_S = 1;

/** The blind test for the set the page carries, drawn into `root`. */
export function mountBlindTest(root: HTMLElement): void {
  const set = loadBlindSet(root);
  const player = new BlindPlayer((url) => {
    report(`${COPY.loadFailed} ${url}`);
  });
  let pieceIndex = 0;
  // The variant carries over to the next song where it has one.
  let chosen: Variant = "mix";
  let verdicts: Verdicts = new Map();

  const title = el("h1", "title", set.title);
  const songsLabel = el("h2", "label", COPY.songs);
  const songs = el("ol", "songs");
  const deck = el("div", "deck");
  const songTitle = el("p", "song-title");
  const switcher = el("div", "switcher");
  switcher.setAttribute("role", "group");
  const transport = el("div", "transport");
  const toggle = button("play", COPY.play);
  const position = el("input", "position");
  position.id = "position";
  position.type = "range";
  position.min = "0";
  position.step = "0.1";
  position.value = "0";
  position.setAttribute("aria-label", "Позиция");
  const time = el("span", "time", "0:00 / 0:00");
  transport.append(toggle, position, time);
  const keysHint = el("p", "hint", COPY.keys);
  const errorLine = el("p", "error");
  errorLine.setAttribute("role", "alert");
  errorLine.hidden = true;
  const status = el("p", "status", COPY.connecting);
  deck.append(songTitle, switcher, transport, keysHint, errorLine);

  const layout = el("div", "layout");
  const aside = el("nav", "aside");
  aside.append(songsLabel, songs);
  const main = el("section", "main");
  main.append(deck, status);
  layout.append(aside, main);
  root.replaceChildren(title, layout);

  function report(message: unknown) {
    errorLine.textContent = `${COPY.failed}: ${String(message)}`;
    errorLine.hidden = false;
  }

  const piece = (): BlindPiece => {
    const current = set.pieces[pieceIndex];
    if (current === undefined)
      throw new Error(`no piece ${String(pieceIndex)}`);
    return current;
  };

  const label = (variant: Variant) => variantLabel(variant, COPY.mix);

  function renderSongs() {
    songs.replaceChildren(
      ...set.pieces.map((each, index) => {
        const item = el("li", "");
        const select = button("song", "");
        select.setAttribute("aria-current", String(index === pieceIndex));
        const picked = verdicts.get(each.id);
        select.append(
          el("span", "song-name", each.title),
          el(
            "span",
            "song-verdict",
            picked === undefined ? COPY.noVerdict : label(picked),
          ),
        );
        select.addEventListener("click", () => {
          selectPiece(index);
        });
        item.append(select);
        return item;
      }),
    );
  }

  function renderDeck() {
    const picked = verdicts.get(piece().id);
    switcher.replaceChildren(
      ...variants(piece()).map((variant) => {
        const select = button("variant", label(variant));
        select.setAttribute("aria-pressed", String(variant === chosen));
        if (variant === picked) select.setAttribute("data-picked", "true");
        select.addEventListener("click", () => {
          choose(variant);
        });
        return select;
      }),
    );
  }

  function selectPiece(index: number) {
    pieceIndex = index;
    const current = piece();
    const list = variants(current);
    if (!list.includes(chosen)) chosen = "mix";
    const wasPlaying = player.playing;
    player.load(
      new Map(list.map((variant) => [variant, audioPath(current, variant)])),
    );
    player.select(chosen);
    if (wasPlaying) player.play().catch(report);
    songTitle.textContent = current.title;
    errorLine.hidden = true;
    renderSongs();
    renderDeck();
  }

  /** Switches to the variant; on the one already playing, picks it or clears the pick. */
  function choose(variant: Variant) {
    if (variant === chosen) {
      togglePick();
      return;
    }
    player.select(variant);
    chosen = variant;
    renderDeck();
  }

  const listeners: VerdictListeners = {
    verdicts(next) {
      verdicts = next;
      renderSongs();
      renderDeck();
    },
    saveState(state) {
      status.textContent = state === "saving" ? COPY.saving : COPY.saved;
    },
    error: report,
  };
  let store: VerdictStore = localVerdicts(listeners);

  function togglePick() {
    const id = piece().id;
    store.pick(id, verdicts.get(id) === chosen ? null : chosen);
  }

  function togglePlay() {
    if (player.playing) player.pause();
    else player.play().catch(report);
  }

  function seek(seconds: number) {
    player.seek(Math.max(0, seconds));
  }

  toggle.addEventListener("click", togglePlay);
  position.addEventListener("input", () => {
    seek(Number(position.value));
  });

  globalThis.addEventListener("keydown", (event) => {
    if (event.target instanceof HTMLInputElement) return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const picked = variantKeys(variants(piece())).get(event.key.toLowerCase());
    if (picked !== undefined) choose(picked);
    else if (event.key === " ") togglePlay();
    else if (event.key === "ArrowLeft") seek(player.time - SKIP_S);
    else if (event.key === "ArrowRight") seek(player.time + SKIP_S);
    else return;
    event.preventDefault();
  });

  setInterval(() => {
    const duration = player.duration;
    toggle.textContent = player.playing ? COPY.pause : COPY.play;
    position.max = String(duration || 1);
    if (document.activeElement !== position) {
      position.value = String(player.time);
    }
    time.textContent = `${clock(player.time)} / ${clock(duration)}`;
  }, TICK_MS);

  selectPiece(0);

  connectVerdicts(listeners)
    .then((connected) => {
      if (connected !== null) store = connected;
      status.textContent = connected === null ? COPY.offline : COPY.saved;
    })
    .catch(report);
}
