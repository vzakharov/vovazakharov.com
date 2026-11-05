# PR #247: feat(unsquatted): name variations from a small model in the browser

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/247
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/in-browser-llms-unsquatted-24jeaq
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-11-04T11:16:35Z
- **Updated:** 2026-11-05T09:33:03Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 3

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (the export committed at 94b640a). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `src/unsquatted/pages/home/ideas/brainstorm/lib/engine.ts`:49 — unresolved — last: @vzakharov (human) 2026-11-05T09:23:13Z — "а локально если я решу потестить?:) какие есть более зрелые…" → [↓](#t01)
- **T02** `src/unsquatted/pages/home/checker/config/messages/en.json`:34 — unresolved — last: @vzakharov (human) 2026-11-05T09:24:54Z — "чё-то как-то долго и грузно Downloading the model: ....%. Yo…" → [↓](#t02)
- **T03** `src/unsquatted/pages/home/checker/config/messages/en.json`:36 — unresolved — last: @vzakharov (human) 2026-11-05T09:25:14Z — "и давай Ok в этот момент менять на Let's go!" → [↓](#t03)

---

## Body

## Summary

- **What it does**: a lightbulb among the field's buttons brainstorms three variations on the typed name, shown between the field and the buttons; each is a click from its own check, and they stay until the next press so they can be tried one after another.
- **Why in the browser**: Qwen3.5-0.8B runs on the visitor's own GPU (WebGPU, transformers.js), so the site stays serverless and the name never leaves the machine. Desktop browsers with a WebGPU adapter see the bulb; phones and tablets, and browsers without WebGPU, see nothing new.
- **The opt-in**: the first press opens a dialog saying what runs where and that the browser downloads about 650 MB once, into the site's storage. The download carries on with the dialog closed and can be stopped; the ring round the bulb fills with it, then with each generation, paced by the first one's measured time and animated on the compositor so the busy main thread cannot stall it. Weights the browser later evicts download again on the next press, with a notice and a single OK.
- **Generation**: a few-shot prompt carries the naming runbook's taste; the answer is cleaned like a typed name, and an empty one shows a shrug. A generation runs on through a change of name and answers for the one it was asked for; a press for another name replaces it.
- **Layout**: below 40em the field takes a row of its own, leaving the buttons room.
- **For testing**, `unsquattedForget()` in the console undoes the opt-in and the timing and deletes the weights.

## QA Checklist

- [ ] `bulb` — On desktop Chrome or Arc, type a name: a lightbulb appears among the field's buttons.
- [ ] `opt-in` — The first press opens the dialog; Not now closes it and nothing downloads.
- [ ] `download` — Turn it on starts the download; closing the dialog leaves it running, the ring fills with it, and pressing the bulb again reopens the dialog with the percentage and Stop.
- [ ] `stop` — Stop download ends it; the next Turn it on resumes from the files already in.
- [ ] `variations` — Once loaded, a press fills the ring and then shows three variations; clicking one puts it in the field and checks it, and the others stay.
- [ ] `ring-smooth` — While the model thinks, the ring keeps turning smoothly.
- [ ] `relabel` — Mid-generation, press the dice: the variations that arrive are for the name that was pressed. Mid-generation, change the name and press again: the ring restarts and the variations are for the new name.
- [ ] `shrug` — An empty answer shows "Sorry, the ideating overlord is out of ideas ¯\\\_(ツ)\_/¯".
- [ ] `remembered` — After a reload, a press brainstorms straight away, with no dialog.
- [ ] `evicted` — Delete the weights from the site's Cache Storage (DevTools → Application) and reload: a press opens the "gone missing" notice with the percentage and OK, the download starts at once, and the variations follow.
- [ ] `forget` — `unsquattedForget()` in the console brings the opt-in dialog back on the next press.
- [ ] `no-webgpu` — In Firefox, and on a phone, the checker looks and works as before: no bulb.
- [ ] `narrow` — Below 40em wide, the field sits on its own row above the buttons.

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `bulb` | manual-only | — | Needs a real WebGPU adapter |
| `opt-in` | e2e | ❌ | Stub `navigator.gpu` in Playwright, press the bulb, assert the dialog and no fetch |
| `download` | manual-only | — | A real 650 MB download and the ring's fill |
| `stop` | manual-only | — | Depends on the real Hugging Face download |
| `variations` | manual-only | — | Real model output; the answer's cleaning is covered by `parse-ideas.test.ts` |
| `ring-smooth` | manual-only | — | Smoothness on a real GPU under load; the ring's geometry is covered by `ring.test.ts` |
| `relabel` | manual-only | — | Needs real generation timing |
| `shrug` | manual-only | — | Needs an empty answer from the real model |
| `remembered` | manual-only | — | Needs the cached weights |
| `evicted` | manual-only | — | Needs the cached weights deleted by hand |
| `forget` | manual-only | — | Console call on the live preview |
| `no-webgpu` | e2e | ❌ | Playwright Firefox: assert the bulb is not rendered |
| `narrow` | e2e | ❌ | Playwright at 600px: assert the field's row is above the buttons' |

https://claude.ai/code/session_01DaohkEbjr7qEZ5daaRBm6A
https://claude.ai/code/session_01DaohkCsgymHrNjAGTnrXRx
https://claude.ai/code/session_01DaohkC7xCgLHrKbBUPMB5E

---

## Comments

- **C01** @vzakharov (agent) — 2026-11-04T11:16:52Z — "Proposed squash body: ``` A lightbulb among the field's butt…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-11-04T11:16:52Z

[https://github.com/vzakharov/vovazakharov.com/pull/247#issuecomment-6629233360](https://github.com/vzakharov/vovazakharov.com/pull/247#issuecomment-6629233360)

Proposed squash body:

```
A lightbulb among the field's buttons brainstorms variations on the
name typed: Qwen3.5-0.8B, run in the visitor's own browser over
WebGPU through transformers.js, so the site stays serverless and the
name never leaves the machine. Desktop browsers with a WebGPU adapter
see it; elsewhere the button is absent. Below 40em the field takes a
row of its own, leaving the buttons room.

The first press opens a dialog saying in plain words what runs where
and that the browser downloads about 650 MB once, into the site's
storage. Agreed, the download carries on with the dialog closed and
can be stopped; a ring round the bulb fills with it, then with each
generation, paced by the first one's measured time and turned on the
compositor so the busy main thread cannot stall it. Weights the
browser later evicts download again on the next press, which says so.

Each press asks for three variations, kept until the next press so
they can be checked one after another; a generation runs on through a
change of name and answers for the one it was asked for. The prompt
carries the naming runbook's taste through worked examples, and the
answer is cleaned like any typed name; an empty one gets a shrug.
unsquattedForget() in the console undoes the opt-in and deletes the
weights, for testing.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

<a id="r01"></a>

### R01 — Review by @vzakharov (agent) — COMMENTED

_2026-11-04T12:18:25Z_

[https://github.com/vzakharov/vovazakharov.com/pull/247#pullrequestreview-5768094962](https://github.com/vzakharov/vovazakharov.com/pull/247#pullrequestreview-5768094962)

**/five-percent**: одно предложение, critical.

<!-- five-percent: 7cd1ac34ceda8ed0229d1370a5519c7da6fc221e -->

_3 resolved threads omitted; re-run with `--include-resolved` to export them._

- **T01** `src/unsquatted/pages/home/ideas/brainstorm/lib/engine.ts`:49 — unresolved — last: @vzakharov (human) 2026-11-05T09:23:13Z — "а локально если я решу потестить?:) какие есть более зрелые…" → [↓](#t01)
- **T02** `src/unsquatted/pages/home/checker/config/messages/en.json`:34 — unresolved — last: @vzakharov (human) 2026-11-05T09:24:54Z — "чё-то как-то долго и грузно Downloading the model: ....%. Yo…" → [↓](#t02)
- **T03** `src/unsquatted/pages/home/checker/config/messages/en.json`:36 — unresolved — last: @vzakharov (human) 2026-11-05T09:25:14Z — "и давай Ok в этот момент менять на Let's go!" → [↓](#t03)

<a id="t01"></a>

### `src/unsquatted/pages/home/ideas/brainstorm/lib/engine.ts`:49 — unresolved

```diff
@@ -0,0 +1,153 @@
… 45 lines elided …
+
+type Loaded = { tokenizer: PreTrainedTokenizer; model: PreTrainedModel };
+
+let loaded: Promise<Loaded> | undefined;
```

**@vzakharov (human)** — 2026-11-05T03:08:35Z

module-level let ничем не чреват, мемори-ликами там какими-нибудь или ещё чем?

**@vzakharov (agent)** — 2026-11-05T03:17:00Z

В проде — нет. `loaded` держит одну модель на вкладку, и так задумано: веса один раз загружаются в память видеокарты и живут, пока открыта страница; закрыл или перезагрузил — освободились. Второй модели там не окажется: `??=` не даёт загрузить ещё одну, неудачная загрузка сбрасывает переменную в `undefined`, а `clear` сначала вызывает `dispose()` и только потом её забывает. `downloads` — просто последний `AbortSignal`, крошечный объект, который следующая загрузка заменяет. И модуль импортируется динамически, только в браузере, так что на сервере этой переменной нет вовсе.

Укусить может только в dev, при HMR: модуль выполнится заново, новая копия забудет старую модель без `dispose()`, и её память на GPU провисит до перезагрузки страницы. В проде HMR нет, поэтому ничего не менял.

**@vzakharov (human)** — 2026-11-05T09:23:13Z

а локально если я решу потестить?:) какие есть более зрелые решения (и кажется это не единственный такой let)

---

<a id="t02"></a>

### `src/unsquatted/pages/home/checker/config/messages/en.json`:34 — unresolved

```diff
@@ -21,15 +21,19 @@
… 12 lines elided …
+    "evicted": "Oops, the model has gone missing: your browser must have cleared it to free up space. Downloading it again, which may take a while; the variations follow once it’s back.",
     "stop": "Stop download",
-    "downloading": "Downloading the model: {percent}%. You can close this window: the download carries on, its progress fills the ring round the lightbulb by the search field, and the first variation…
+    "downloading": "Downloading the model: {percent}%. You can close this dialog, though not the tab: the download carries on, its progress fills the ring round the lightbulb by the search field, and the first variations come once it’s ready. Or stop it, and the files already downloaded wait for next time.",
```

**@vzakharov (human)** — 2026-11-05T09:24:54Z

чё-то как-то долго и грузно

Downloading the model: ....%. You can close this dialog (but not the tab), the ideas will come in their time 

(ну или стилистически правильнее)

---

<a id="t03"></a>

### `src/unsquatted/pages/home/checker/config/messages/en.json`:36 — unresolved

```diff
@@ -21,15 +21,19 @@
… 14 lines elided …
-    "downloading": "Downloading the model: {percent}%. You can close this window: the download carries on, its progress fills the ring round the lightbulb by the search field, and the first variation…
+    "downloading": "Downloading the model: {percent}%. You can close this dialog, though not the tab: the download carries on, its progress fills the ring round the lightbulb by the search field, and…
     "loading": "Downloading the model for variations: {percent}%",
+    "ready": "All set: the model is ready.",
```

**@vzakharov (human)** — 2026-11-05T09:25:14Z

и давай Ok в этот момент менять на Let's go!

---

## Timeline (status, references, and other events)

- **2026-11-04T11:40:21Z** @vzakharov renamed from «feat(unsquatted): name ideas from an in-browser LLM» to «feat(unsquatted): name variations from Chrome's built-in model».
- **2026-11-04T12:18:25Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/247#pullrequestreview-5768094962.
- **2026-11-05T03:10:13Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/247#pullrequestreview-5779339397.
- **2026-11-05T03:15:49Z** @vzakharov renamed from «feat(unsquatted): name variations from Chrome's built-in model» to «feat(unsquatted): name variations from a small model in the browser».
- **2026-11-05T09:26:52Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/247#pullrequestreview-5782512641.
