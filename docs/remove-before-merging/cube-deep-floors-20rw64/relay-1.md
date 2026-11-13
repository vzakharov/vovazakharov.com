# Relay 1 — cube: reaching the deep floors, portals and spoiler-free trophies

A discussion-only session (CLAUDE.md entry ladder rung 2: no change to the codebase was asked for). Nothing in `src/` was edited; the only artifact is a published explainer page.

## 1. Standing constraints

- On theme ranking: «"Нужно" -- не значит "делай сейчас", значит "запомни такую мысль".» — the re-ranking of floor themes from normal to hallucinatory is a thought to keep, not a task.
- «у нас многое и так на нём не тянет. аргумент, но пока забудем.» — phone performance is set aside as an argument for now.
- «ой, слушай, ну совсем уже эзотерических аргументов не приплетай)» — don't argue from repo-process trivia (e.g. CLAUDE.md's "four sites to wire" for a toolchain) when weighing a design.

## 2. The conversation

**Operator (1):**

> по кубику: думаю, что б нам придумать интересного для решения следующей проблемы: сейчас реалистично играющий человек за несколько вечеров может добежать до 9, максимум 10го этажа. все остальные остаются доступны только при "чите", ну или если кто-то "взломает" ASIC-ом и расшарит (тогда доступны скажем до 30 с небольшим -- меньше половины).
>
> Нужны идеи, как можно всё-таки не терять зря столько творчества.
>
> Что пока придумал я как варианты:
> 1- На этаже появляются картины других видов: открываешь дверь (в местах "стыков" двух видов тем между видами появляются стены с дверьми внутри, разными для разных видов тем), за ней уже что-то другое. При этом чем ниже этаж, тем больше вероятность наткнуться на "галюциногенное". Должен ещё быть механизм "подобное к подобному", чтобы у нас стыки не пестрили как статика на телевизоре.
>
> 2- Появляются порталы между этажами: случайным образом, с шансами тем больше, чем ниже этаж, ты можешь "проваливаться" в другие этажи (нижние или верхние), в том числе самые нижние (но разумеется в самые нижние с меньшей вероятностью). Невозможности прохождения игры это, кажется, не мешает: пройти 60-й этаж, даже случайно попав на него, если правильно помню, так же сложно, как пройти все предыдущие вместе взятые. Как обыграть порталы -- механизмы могут быть разные, например у нас есть объекты-двери, возможно, открываешь дверь, а там за ней, как ни в чём не бывало, совершенно другой этаж (в игре появляется допаминная механика "открывай все двери и ищи порталы в другие миры"). А возможно не сразу, а там, например, лифт, и он тебя "перевозит" до случайного этажа.
>
> по сути игра превращается из "проходи уровни один за другим" в более нелинейное и с одной стороны более интересное, с другой более хаотичное путешествие.

(Condensed: in case 2 the URL must remember the arrival the way it remembers a hatch; a portal's provable location plus target coordinates would suffice. Downsides he saw: (а) floor change no longer tied to shrinking — mitigated by portals starting around floor 7+; (б) with many portals and one hatch, the hatch becomes a vanishingly rare way down — could be framed as "more honourable", the URL tells which route was taken. P.S. themes should be re-ranked from roughly normal to unconditionally hallucinatory — see § 1.)

**Agent:** Read `hole.ts`/`address.ts`. Key point: what is lost is _themes_, not floors — `themeOf(n)` glues theme to floor number. Proposed (A) theme inheritance down the room quadtree (`under()`): each room inherits parent's "dose" with mutations, giving fractal patches, deeper = weirder, no proof changes; per-room `air` is the main cost; re-ranking becomes a prerequisite. (B) "crooked holes" as commitments like holes, per-floor density, a portal stack in the URL collapsing on a real hatch, never targeting the last floor; shrink → Alice framing. (C) dreams via beds, plus posters as entries. Recommended A + C as base, B from floor 7.

**Operator (2):**

> > Порталы, которые можно вычислить из сида, ломают её: скрипт пробежит этажи 1–10 (около миллиона хешей) и выпишет себе билет на 60-й.
>
> ну ок, но 60-й то все равно никто не пройдёт, даже квантовый компьютер?
>
> по этой же причине не оч понимаю вот это:
>
> > кривой люк никогда не ведёт на последний этаж, иначе финал становится лотереей
>
> > Но как только игрок находит настоящий люк на этаже, куда попал
>
> чаще всего -- никогда (только если он не попадёт с нижнего этажа на верхний. но наверное так делать не стоит, по крайней мере если у нас порталы двусторонние)
>
> > Провалиться с 9-го на 40-й значит уменьшиться в 2³¹ раз,
>
> а визуализировать мы это как будем?)
>
> > Сон не продвигает настоящую позицию, поэтому доказывать нечего.
>
> Идея B мне кажется другой (интересной) формой идеи Б: кровать -- тот же портал, и, как я понимаю, одна и та же кровать ведёт в одно и то же случайное место (если только мы как-то не включим таймстемп в уравнение, но это уже другая тема)
>
> > Ноль криптографии. Сон не продвигает настоящую позицию, поэтому доказывать нечего
>
> что в принципе является тем же что запомнить замОк кровати, не?
>
> ну а "проснуться" -- это по сути воспользоваться обратным порталом.
>
> В случае со снами можно сделать, конечно, какой-то обратный отсчёт, после которого ты всегда просыпаешься, но это вопрос опять же формы а не сути, кажется.
>
> > Ещё одна точка входа — entities/poster
>
> вообще я не против делать много точек входа, да. Можно, например, детский рисунок, который переводит всегда на этаж 19 (он уже не будет 19), и этот рисунок найти очень сложно.

**Agent:** Conceded computable portals are fine (they only devalue depth-as-trophy). Last floor: arrival there = win, so make the win "proof of the last hole", not "standing on it". URL as a **stack** (portal pushes, return pops). Long fall visualised via existing fractional `airAt(depth)` in `cube-scene.ts` — sweep depth 9→40, themes flash past. Dream = portal with guaranteed return; the real design question is return. Signature entries per theme family (drawing → "19").

**Operator (3):**

> > Пройти нельзя ни 60-й, ни 66-й, но у 66-го и нет люка:
>
> я думаю перейти на идею 60 этажей вместо 61; но по сути все равно, я имел в виду, что последний этаж не пройдёшь. И нет, 66 этаж не был "и есть победа", победа была 67-й (ты находишь на 66м люк в 67м и игра вылетает по ошибке -- это и была "победа")
>
> > вой случай «упал с нижнего на верхний и нашёл там люк» тоже законен: люк найден по-настоящему, и стек схлопывается в один hatch
>
> я скорее говорил про ситуацию: попал с 10го на 30й, а потом с 30го на второй, тут же нашёл люк, и вся твоя история дохождения до 10го пропала. Правда тут возникает вопрос, если ты попал на 2й с 30го, значит на 2м есть люк до 30го, что не хотелось бы)
>
> > Обобщение: у каждого семейства тем есть подписной вход с фиксированным адресом — рисунок ведёт к рисунку, телевизор с помехами к static, флуоресцентный постер в лабораторию
>
> при этом далеко не каждый рисунок, телевизор или постер. А может и каждвый, но, как ты и сказал, будут они очень редкими.

**Agent:** Win = hole proof of the last floor, so portals may target anything. Split URL into **trophy** (deepest honest hatch, only grows) and **position** (latest hatch + portal stack). Portals **one-way in the world**, return via the player's own "Ariadne's thread" (stack pop) — so no 2→30 door exists for others. Drawings: rare among common ones, with a close-up tell.

**Operator (4):** «а вот ещё вопрос в сторону но рождённый этим обсуждением: как показать трофей, не открыв положение люка? кажется что-то что-то про assymetric encryption?»

**Agent:** Signature: `sk = H("cube-trophy", seed, n, x, y)`, `pk` in `world.json`, trophy = Ed25519 signature over "name · date", verified client-side; hybrid keeps cheap SHA detection.

**Operator (5):** «> Открытый ключ pk лежит в world.json рядом с нынешним хешем люка: автор вычисляет его в момент, когда сажает люк. — какой автор, в каком смысле "сажает"?»

**Agent:** "Plant" is `src/cube/scripts/plant.ts`: draws a seed and landing rooms, writes only hashes, forgets rooms. So `pk` can't be added to the current world without re-planting, or ZK.

**Operator (6):** «наверное я запутался в математике. я не оч понимаю зачем нам менять что-то в мире, чтобы человек мог доказать любому "я знаю хеш этого люка", не говоря адрес этого люка?»

**Agent:** Everyone knows the hash; the finder knows the preimage (room). A hash can only be checked by revealing the input (lock analogy); a signature lock must be hung by whoever had the key.

**Operator (7):** «блин. а насколько вычислительно сложно пересчитать наш мир так, чтобы первые 6 этажей не изменились? я к ним прикипел уже :)»

**Agent:** Keep seed + first K commitments; recover their rooms by brute force, compute `pk`, forget again; re-plant deeper. Benchmarked (naive async `hole.at`, ~21k hashes/s, one core): floors 1–6 < 0.1 s total, 7: 0.7 s, 8: 0.02 s (414 tries), 9: 10 s (211,624 tries). Worst case 4ⁿ: floor 10 ≈ 1 min, 12 ≈ 15 min, 14 ≈ hours; ~100× faster with sync SHA + all cores.

**Operator (8):** (screenshot of the scheme) «хотя подожди, где этот sk лежит, и кто делает "подпись им над строкой вроде ..", если у нас только браузер?»

**Agent:** `sk` is never stored; the player's browser derives it from the hatch in its URL, signs, discards; viewer's browser verifies against `pk`. Caveat: trophy proves "had a URL past this hole". Correction: import Ed25519 private key as PKCS#8, not JWK.

**Operator (9):** «а пересаживание мира изменит положение объектов в этом мире относительно тех которые расположились уже сейчас?»

**Agent:** Checked: maze/traits/decor come from the seed only (`maze(seed)`, `traits(seed)`); only hole-dependent things move (hole, lever, `features/decor/model/clear.ts` clearing, landing board, sale signs). `plant.ts` needs a "keep seed + first K commitments" mode.

**Operator (10):** «блин, ну а что тогда мешает браузеру в любой момент подписать "я знаю люк 50го этаджа"? сорри, криптография -- мой бич»

**Agent:** It has no `sk₅₀`; verification is against the specific `pk₅₀`; getting `sk₅₀` = 4⁵⁰ search. Bank-signature-sample analogy.

**Operator (11):** «> 8 414 (повезло) — гы, 8й этаж оказался супер-простым?»

**Agent:** Only for the scan order (hole at floor-8 room (0, 78), near the scan's starting corner); the player lands at (116, 2) from floor 7's hole — nearly across the 128×128 floor.

**Operator (12):** «кажется, начинаю понимать. а в случае с порталами значит у нас должен быть pk[каждый портал]?»

**Agent:** Only for secret (planted) portals; computable ones verifiable openly.

**Operator (13):** «> в этой комнате есть портал на 30-й» — эм, а для люка разве нельзя?»

**Agent:** Both are checkable openly; the difference is what showing the room costs (hole room = the floor below).

**Operator (14):** «ну нет, все равно -- "вот я нашёл портал в 60й на (практически достижимом) 10м этаже" это такой себе секретик»

**Agent:** Then computable portals can't keep it (script scans floor 10 in seconds) → plant them with `pk`.

**Operator (15):** «> Прятать адрес такого портала за подписью бессмысленно: прятать нечего. — ну по такой логике и люк на 10м этаже прятать бессмысленно»

**Agent:** Conceded: any object's secrecy on floor n costs the same floor scan; the real difference is who can publish `pk` (planted: any depth; computable: only scannable floors).

**Operator (16):** «тут речь не про то что "могут взломать", а про то что я могу доказать свои ачивменты, автоматически не расшарив "ссылку на их повторение"»

**Agent:** Rule: spoiler-free proof only for what has a `pk` published in advance.

**Operator (17):** «ну то есть твой вывод -- мы не можем обеспечить доказуемость-с-не-расшариваемостью порталов, если их так много, как мы задумали?»

**Agent:** Count isn't the problem, density on deep floors is; dense portals aren't achievements anyway → dense computable = transport, rare planted = trophies; ZK the only full yes.

**Operator (18):** «так, ну а если мы их перечисляем не клетками, а свойствами комнаты -- теми самыми от которых в первую очередь зависит, появятся ли они? (чушь наверное говорю)»

**Agent:** Not nonsense — needs a _hidden_ property: a door's roll prefix of k bits equals a planted secret `s` per class; `H(s)` and `pk(s)` in `world.json`; density 2⁻ᵏ on any floor; forging costs what finding costs; visible traits as hints.

**Operator (19):** «> Полное «да» для любых порталов даёт только ZK-доказательство … — ты второй раз упоминаешь такое доказательство, упоминая, что оно "много стоит", но что конкретно это значит? кому стоит, когда, почему?»

**Agent:** Costs: circuit mirroring `hole.at` byte-for-byte, toolchain, trusted setup; player per trophy tens of MB / seconds / hundreds of MB RAM; verifier ~nothing.

**Operator (20):** «хм, я думал будет примерно так: "ты заходишь в комнату, там есть дверь, ты бросаешь кубик, и с вероятностью такой-то (маленькой) это оказывается портал". Ты плюс-минус о том же?»

**Agent:** Yes; difference: open threshold vs sealed winning face `s` (lottery-envelope analogy).

**Operator (21):** «>Новый тулчейн … — ой, слушай, ну совсем уже эзотерических аргументов не приплетай)»

**Agent:** Struck it; remaining ZK costs listed.

**Operator (22):** «> 1. Кубик должен быть детерминированным. — у нас же все кубики детерминированы?»

**Agent:** Yes — the only real randomness in `src/cube` is `crypto.getRandomValues` in `plant.ts`.

**Operator (23):** «> схема должна байт в байт повторять хеширование мира, и при каждой правке хеша её надо переделывать… — разве у нас это не лежит в основе -- мир захеширован единожды?»

**Agent:** Conceded: the hash is already frozen; only player cost and trusted setup remain.

**Operator (24):**

> > цена для игрока на каждый трофей: десятки мегабайт, секунды процессора, сотни мегабайт памяти
>
> это как? что именно в этот момент происходит? и не вылетит ли оно если это 60й этаж (или от этого не зависит)?
>
> > на телефоне может не потянуть;
>
> у нас многое и так на нём не тянет. аргумент, но пока забудем.
>
> > доверенная настройка: либо её проводишь ты и теоретически можешь подделывать
>
> что это значит?
>
> нарисуй мне артефакт чтобы объяснить что это за штука такая ZK-доказательство. Но "для (относительно) тупых" (тех у кого проблемы с криптографией)

**Agent:** Published the explainer artifact «Люк без спойлера» (https://claude.ai/artifact/MfnJ7GcDEfg8VEzm334WtJ): Waldo cardboard over a floor plan, Ali Baba cave game, 4-step prover pipeline, trusted setup, comparison table. Proving cost doesn't depend on floor; setup explained.

**Operator (25):** «Я правильно понимаю что рассуждения про скрытое свойство с этой ZK не связаны?»

**Agent:** Yes — two alternative routes to the same goal (sealed-`s` classes = signatures + planting; ZK = open threshold, no planting).

**Operator (artifact comments, all answered in their threads):**

- «Не понял, что за слово, и как оно связано с лево/право; и форму пещеры тоже не очень понимаю.» → added a cave diagram and rewrote the round explanation.
- «А длина цепочки порталов влияет?» → linear if the whole chain is hidden; fixed-size circuits need a max; recursion avoids it; if portals are public, only the first hole is hidden → constant.
- «Не понял, есть какая-то настройка, которая подойдет к любому лабиринту» → universal setup (Powers of Tau); corrected the artifact (Ethereum's ceremony likely too small for SHA-256; Perpetual Powers of Tau has dozens of participants).
- «ну вообще-то, с тем же успехом можно сказать, что изначальный "ответ", который использовался для посаживания люков, в блокнотике записал» → conceded; the author is already trusted; artifact paragraph rewritten.

**Operator (26):** «Я не против подписи, но я до сих пор не понимаю как мы сделаем чтобы она работала для всех порталов, и потребует ли это каких-то ещё ограничений на эти самые порталы (или ещё на что-то)»

**Agent:** One signature per _class_, not per portal; listed constraints (trophy distinguishes only classes; fixed probability per class → per-floor-band classes; forging cost 2ᵏ regardless of depth; secret one-shot per class; classes planted ahead, adding is free).

**Operator (27):** «> Если кто-то опубликует s, подписывать этот класс сможет любой… — Это плохо. Открыли люк — значит просто «разболтали всем дорогу», это личное дело каждого. А тут — «разболтали ‘дорогу’ ко всем порталам этого класса»»

**Agent:** Sharing `s` doesn't reveal other doors' locations, but sharing one door's URL leaks `s` → kills the class trophy. Per-door isolation only via (1) planting portals one by one (rare only) or (2) ZK with a per-door tag (nullifier). Recommended: dense = transport without trophies; rare signature portals planted individually.

**Operator (28):** «итого, мы можем сделать ZK-доказуемые трофеи конкретных порталов (или чего угодно) без каких-либо классов»

**Agent:** Yes — ZK over the game rule with a per-door tag; works for holes on today's commitments too (no re-planting); limit: the rule must be in the circuit; player pays per trophy.

**Operator (29):** «(это вопрос)»

**Agent:** Confirmed: yes, we can; the rule must be in the circuit, and the player pays per trophy.

(The session was then parked by its keepalive; this summary was first written then, and is rewritten now.)

**Operator (30):** «Давай занесем на доску все что тут пообсуждали как идеи»

**Agent:** Routed through `/task` → no plan (one new board section, visible whole in the diff) → `/go` § "Planless entry". Added two zones to the cube board (`src/cube-board/app/config/cube/deep.yaml`, `trophies.yaml`), committed and pushed; then paused for the context budget (plan written as `docs/plans/cube-deep-floors.paused.md`) and relayed. (verbatim in Last agent turn)

## 3. Intent

Vova wants the creative content of floors beyond ~10 (themes 11–66) to be reachable by real players without cheating, while keeping the cube's core (descent by holes, hash commitments, the URL as provable position). Secondary thread born from it: spoiler-free, provable trophies — prove an achievement without automatically sharing the recipe to repeat it. Ruled out / set aside: phone performance as an argument; arguments from repo process.

## 4. Decisions and terms

- **Themes vs floors**: what is lost is themes, not floors; decoupling theme from floor number (`themeOf(n)` in `src/cube/entities/theme/catalogue/config/floors.ts`) is the cheapest lever. Theme inheritance down the quadtree (idea A) — not rejected, not yet discussed further.
- **Theme re-ranking** (normal → hallucinatory): a kept thought, not a task (§ 1).
- **Floors**: Vova considers 60 floors instead of the current 66; the win is falling through the last floor's hole (the game "crashes"), not standing on the last floor. So portals may target any floor, the last included.
- **Computable portals are acceptable** (they cost depth-as-trophy only, not the game's integrity).
- **Portal stack**: the URL position = latest hatch + stack of portal hops; a return pops.
- **Trophy vs position**: separate URL fields; trophy = deepest honest hatch, only grows.
- **One-way portals + "Ariadne's thread"**: no physical back door on the target floor; return only via the player's own stack.
- **Dreams/beds = portals** with guaranteed return (form, not substance — Vova's point, accepted).
- **Signature entries**: rare fixed-destination entries per theme family (a child's drawing → the drawing floor), rare among common objects, with a close-up tell.
- **Long fall visualisation**: sweep fractional depth through `airAt(depth)` (`src/cube/pages/cube/ui/cube-scene.ts`).
- **"Plant"** = `src/cube/scripts/plant.ts` (+ `entities/world/model/plant.ts`): seed + per-floor landing rooms, only hashes written, rooms forgotten.
- **Re-planting while keeping floors**: keep the seed and first K commitments → those floors unchanged; brute-force their rooms to derive `pk`; re-plant deeper. Layout comes from the seed alone.
- **Signature trophy**: `sk = H("cube-trophy", seed, n, x, y)`, `pk` in `world.json`, Ed25519 via Web Crypto (PKCS#8 import), "name · date" message; proves "had a URL past this hole".
- **Class / sealed `s`**: a door's roll prefix of k bits = planted secret `s` → portal of that class; one `pk` per class. Rejected-ish by Vova (Operator 27): one shared door leaks the whole class's trophy.
- **ZK trophy with a per-door tag (nullifier)**: proves the rule over a hidden door/room; public: name, date, floor, destination, tag. Works on current hole commitments, no re-planting. Costs: circuit written once; player pays tens of MB / seconds / hundreds of MB per trophy; trusted setup moot since the author is trusted anyway (Vova's point).
- **Open choice** (not decided): signatures (cheap for players, need re-planting, dense portals lack per-door trophies) vs ZK (expensive per trophy, nothing planted, every portal individually provable).

## 5. Errors and dead ends

- Claimed computable portals "break the economy" — Vova: floor 60 is unpassable anyway; conceded.
- Claimed portals to the last floor make the ending a lottery — wrong premise (the win is the last hole's proof).
- Called dreams "zero crypto" — they are portals; conceded.
- Said hiding a computable portal's room is pointless — Vova: by that logic so is hiding hole 10; conceded; the real difference is who can publish `pk`.
- Cited CLAUDE.md's toolchain wiring as a ZK cost — Vova: esoteric; struck.
- Said ZK circuits must be redone on hash changes — the hash is frozen anyway; conceded.
- Said trusted setup by the author removes "even the author can't cheat" — the author already could keep answers; conceded and the artifact fixed.
- Class scheme's shared secret — Vova: unacceptable, one shared door leaks a whole class.

## 6. State

- Branch `claude/cube-deep-floors-20rw64` (renamed from `claude/modest-hamilton-20rw64`); no PR yet. Commits: 99b5cf40 (this summary, first version), 5ddbed42 (the two board zones), df45ef0d (the paused plan), then this summary's rewrite.
- Plan: `docs/plans/cube-deep-floors.paused.md` — done and left recorded there.
- No CI, no PR subscription, no scheduled check-ins. The published cube-board artifact was not touched or republished.
- Estimate: this session keeps 3 h senior game-designer — "weighing descent mechanics against the hole-commitment proof and the 4^n room economy needs a designer who reads the address math"; the remainder handed on: 0.5 h senior game-designer — "the board's copy needs a designer's read for whether each card states the idea the discussion settled on".

### Watches

https://claude.ai/artifact/MfnJ7GcDEfg8VEzm334WtJ

## 7. Pointers

- `src/cube/entities/world/model/hole.ts` — world schema, `holeQuarter`, `under()`.
- `src/cube/entities/world/model/address.ts` — URL fragment: floor + hatch in clear, checksum, masked place.
- `src/cube/entities/world/model/seals.ts`, `src/dice/shared/roll/seal.ts` — commitments = SHA-256 of `<seed>/<path>`.
- `src/cube/scripts/plant.ts`, `src/cube/entities/world/model/plant.ts` — planting.
- `src/cube/entities/world/config/world.json` — seed + 65 hole commitments (66 floors).
- `src/cube/entities/theme/catalogue/config/floors.ts` — `themeOf(n)`; theme families under `src/cube/entities/theme/{workplace,dwelling,leisure,laboratory,edge}`.
- `src/cube/pages/cube/ui/cube-scene.ts` — `airAt(depth)` fractional air blend.
- `src/cube/features/decor/model/clear.ts`, `src/cube/entities/world/model/{lever,landing,sale}.ts` — hole-dependent placement.
- Brute-force benchmark (not committed): loop `hole.at({ n, x, y })` over every room of floor n+1 (2ⁿ × 2ⁿ) and compare with `world.holes[n - 1]`.
- Artifact «Люк без спойлера»: https://claude.ai/artifact/MfnJ7GcDEfg8VEzm334WtJ (also https://claude.ai/code/artifact/a760f352-5497-4d17-8745-fb3eb6b5df0b); four comment threads answered, none resolved.
- Transcript: https://claude.ai/code/session_01DaohkBWZDxtTYRbxBLsYSC

## 8. Next step

Resume the paused plan `docs/plans/cube-deep-floors.paused.md` through `/go` from its Step 1 (the `*.paused.md` case): the go-ahead was the operator's «Давай занесем на доску все что тут пообсуждали как идеи», routed by `/task` to planless work. Left: `/go` Step 3 (`/polish`), Step 4 (`/pr`, which creates the PR), then `/five-percent`. Whether to republish the board artifact is the operator's call.

Still open in the discussion, not a task: signature trophies (with re-planting) vs ZK trophies, and whether theme inheritance, portals or the theme re-ranking should become work.

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Понял, ответ тот же: **да, можем**. Трофей ZK доказывает «знаю дверь (или комнату), для которой выполняется правило игры» напрямую, без классов и без всякой посадки, причём поштучно: у каждой двери свой номерок, и разболтать можно только свою.

Оговорка одна: правило должно быть описано в схеме. Для люков и порталов это один-два хеша, так что дёшево. Платит за это игрок, мегабайтами и секундами на каждый трофей.
```
