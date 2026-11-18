# Relay 2 — real payments for the cube: providers, кубики, a backend design

## Standing constraints

- On payment providers whose KYC may ask for proof of residential address:
  «нет и туда где что-то такое могут попросить не идём» — no provider that may
  ask for a utility bill, lease or similar, at any stage.
- «не отнимай у меня право подумать пожалуйста 🙂» — design decisions the
  operator says he will think about are not pushed or decided for him.
- The muthur sync offer was made; do not make it again.

## The conversation

1. **Operator:** `/relay take claude/cube-payments-gx5cag — ответ про приём
оплаты для куба дан, ждём решений по трём вопросам`

   **Agent:** Attached, archived the predecessor session, restated the three
   open questions (provider, price ceiling, backend).

2. **Operator:** «1- это всё посредники для страйпа? а есть прямые провайдеры
   2- я подумал, у нас будут типа внутренние деньги ("кубики"), покупать будем
   за них, соответственно нужно где докупать их
   3- подумаем»

   **Agent:** Not all are Stripe (Lemon Squeezy is Stripe-owned, Polar pays out
   via Stripe, Paddle is independent); direct option = Armenian bank internet
   acquiring (Ameriabank etc., ~2.7% foreign cards) but then VAT/chargebacks are
   his. Кубики solve the $10M floor; Paddle bans "virtual currency or stored
   value"; кубики must be non-transferable, non-cashable; no paid loot boxes; a
   wallet makes a server and accounts unavoidable. Asked: can кубики be earned
   free; tied to a site account?

3. **Operator:** «1- посмотри по интернету что кто из обработчиков лучше, в
   частности может конкретно для Армении инфу найдёшь. Важный нюанс: у меня там
   ИП но не резидентство, так что нужно чтобы в KYC не было проверок конкретного
   места жительства (utility bills и всё вот это). А, и ещё подключи
   vzakharov/life, там подробная инфа о том как кто я там зареган
   2- так во всех играх почти мобильных такое есть, нет? это ж не store credit, а
   просто "фантики". про "не меняются, не передаются" понял. Про сундуки
   сложнее: у нас же вся игра построена на случайностях, т.е. "зашёл в такую-то
   клетку, там нужный хеш, поэтому лежит сундук" вполне может быть механика
   (вряд ли конечно что-то именно такое пошлое как сундук). опять же, кажется,
   почти все мобильные игры это делают?
   3- не отнимай у меня право подумать пожалуйста 🙂 есть варианты "хранить" их
   криптографически например»

   **Agent:** Attached `vzakharov/life`, read
   `finance/armenian-accounts/armenia-entity.md`; launched a research subagent.
   Answered 2: in-game currency is legal, Paddle's ban is its own policy; found
   randomness (hash-placed treasure) is fine, bought randomness (pay for an
   unknown outcome) is a loot box. Answered 3: apologised; crypto proves
   purchase but not "not yet spent" nor tells other players — a shared log is
   needed. Flagged the accountant's line: 1% turnover tax only for IT income,
   10% otherwise — ask R2A whether кубики sales count as IT.

4. **Operator:** «про 3 у меня на самом деле была такая мысль: промежуточная
   база, но все изменения типа "комната принадлежит" или "на этой стене (за
   денежку) нанесено граффити" ultimately (например nightly job-ом) уезжают
   прямо в репу, то есть у нас "всё что ты делаешь в игре, меняет игру" в прямом
   смысле»

   **Agent:** Fits the static site well (git history = chronicle of the world).
   Four considerations: the DB stays but only holds the day's delta and settles
   same-day conflicts; git forgets nothing → nightly run is the graffiti
   moderation window, keep pseudonyms not emails; a refund after the commit
   needs a reverting commit; the nightly commit needs a publishing type (e.g.
   `world(vova):`) in the deploy gate.

   (Subagent research then arrived; agent verified Lemon Squeezy's shutdown and
   Polar's loot-box clause and reported: Lemon Squeezy closed sign-ups
   2026-11-16, stops payments 2027-03-31; Polar is the only one meeting all
   constraints on paper; Xsolla best fit for virtual currency but KYC
   unpublished; Gumroad fallback; Paddle, 2Checkout, Tebex, Payoneer, Dodo,
   FastSpring out. Asked whether he has a Montenegrin lease/utility bill; offered
   to draft support emails.)

5. **Operator:** «> Если за кубики открывается клетка с неизвестным содержимым,
   Polar увидит в этом mystery box
   ну вроде у нас заранее: комнату, которую "покупаешь", ты видишь. графити,
   которые наносишь, тоже. но хотя вот что если такая механика: ты аплоадишь
   картинку для графити, но VLM-ка её перерисовывает более похоже на графити.
   как именно она перерисует -- ты не знаешь.

   > Один вопрос к тебе
   > нет и туда где что-то такое могут попросить не идём
   > Чтобы снять остальные неясности, надо написать в поддержку двум сервисам
   > ну давай, создай драфт»
   > — and, mid-turn: «в гмейле»

   **Agent:** Created two Gmail drafts (Polar, Xsolla) in vzakharov@gmail.com.
   VLM-redrawn graffiti is not a loot box: a definite service with stylistic
   variance and no outcome worth more than another; risk appears only with
   rarity tiers.

6. **Operator:** «в гмейле» (repeat after a container restart)

   **Agent:** Drafts already exist; the keepalive watcher was denied by the auto
   classifier after the restart, gave a fenced message to authorise it.

7. **Operator:** «запусти keepalive watcher: /home/user/life/.claude/keepalive/hooks/keepalive.py watch …»

   **Agent:** Started it.

8. **Operator:** «ок, спасибо. ну а мы давай подумаем за бэкенд»

   **Agent:** Proposed: identity = key pair (passkey at the time), owners in the
   repo are public keys; Cloudflare Worker + one Durable Object per world to
   order actions (no races), webhook verification needs a secret so a server is
   unavoidable; nightly GitHub Action snapshots into the repo; client = baked
   snapshot + today's delta, degrades to read-only. Noted Xsolla might hold
   balances. Asked: passkey only or email fallback; Cloudflare OK; snapshot
   cadence.

9. **Operator:** «durable object это типа база-без-базы?»

   **Agent:** No — a database inside one object: one instance per id with its
   own SQLite, requests served strictly one at a time; one clerk, one window.
   Free tier since 2025 "if I'm not mistaken, will check".

10. **Operator:** «> состояние мира у куба крошечное
    с учётом бесконечности куба смелое заявление. но показывает какого ты
    мнения о перспективах популярности игры :D»

    **Agent:** Joked back: the infinite cube weighs zero bytes; state grows only
    with purchases (≥$4.99 per ~100 bytes); shard by floor later, so a room's
    address should carry its floor from the start.

11. **Operator:** «нужно ещё продумать тестовую среду, где я смогу покупать
    комнаты и рисовать графити без риска разориться или разозлить других,
    заняв все злачные места»

    **Agent:** Payment sandbox + a test-only "mint" endpoint absent from the
    production code; `wrangler deploy --env test` = separate Worker/DO/secrets;
    preview slots (preview.vovazakharov.com) built against the test world, prod
    against prod, chosen at build time; a "test world" banner; test snapshot
    never lands in `main`; `wrangler dev` for automated tests, pure logic in the
    `vet` suite.

12. **Operator:** «> Её не должно существовать в коде боевого сервера вообще, а
    не просто быть выключенной флагом
    это как»

    **Agent:** Two entry files (`worker.ts` without `mintRoute`,
    `worker.test-env.ts` with it); the bundler only includes what is imported,
    so prod 404s on `/mint`; a test asserts the prod bundle lacks it.

13. **Operator:** «ну ок, давай попробуем, сначала на комнатах
    что хочу: никаких логинов-входов по емейлам и тп. тебе просто выдаётся
    айдишник и секрет (чтобы доказать, что по этому айдишнику -- ты), причём
    они нигде не хранятся; все последующие покупки записываются на этот
    айдишник.
    может что-то упустил»
    — and, mid-turn while the agent had started `/task`: «ну пока ещё не таск
    наверное, но близко к этому»

    **Agent:** Dropped the `/task` routing (nothing written). Listed what he
    might have missed: id = public key, secret = private key generated in the
    browser (server stores nothing secret); where the player keeps the secret
    (browser storage / 12-word phrase / passkey); lost secret = lost rooms;
    second device; free rooms in prod would be scripted away → first phase in
    the test world only; signed requests need a sequence number (replay).

14. **Operator:** «1- звучит норм
    2- все три варианта, показать, сохранить в браузер ("на этой машине тебя
    запомнил"), предложить сохранить в кошелёк (или как это называется)
    3- фича
    4- ссылка+qr code (нажал на новом устройстве или отсканировал телефоном,
    "залогинился"), соответственно добавить в 2
    5- ну в тестовом окружении пока имею в виду
    6- не понял но ок :)»

    **Agent:** A passkey cannot export its key, so it conflicts with phrase/link;
    use the browser's password manager instead (id as login, secret as
    password). Link puts the secret after `#`, the page stores it and strips it
    from the address bar; warn that a photographed QR gives away the rooms.
    Explained replay protection as numbered cheques. Summarised the first phase.

15. **Operator:** «про QR -- не, тогда не надо

    > Ночной снимок тестового мира идёт в его собственный файл
    > в смысле в свою собственную ветку?»

    **Agent:** QR dropped, link kept unless he says otherwise. Agreed a branch
    is better than a file in `main`: `cube-world-test` (orphan, only the world
    file), same code commits prod to `main`; the test snapshot only exercises
    the nightly mechanism.

16. **Operator:** «а мы не можем ни в том ни в другом случае ничего не
    коммитить в main, а просто при билде "смотреть" в другие ветки? типа
    ветка-база»

    **Agent:** Yes — like the existing `cost-ledger` branch: `cube-world` and
    `cube-world-test` hold the world; build fetches the snapshot and bakes it in;
    the nightly job must trigger a vova deploy itself (a second entry into
    `deploy.yml`). Mentioned a runtime-fetch-from-CDN variant and recommended
    the build.

17. **Operator:** «> Есть и вариант без пересборки
    ну тогда какой смысл был "не делать базу", вся ж фишка в том чтоб оставить
    сайт насколько возможно статическим»

    **Agent:** Agreed: runtime fetch would make the CDN the database; build it
    is — world baked into HTML, Worker serves only what happened since the last
    build. (verbatim in Last agent turn)

## Intent

Make the cube (`/cube` on vovazakharov.com) take real money, selling as an
Armenian sole proprietor, while keeping the site as static as possible. Players
buy an in-game currency (кубики) and spend it on rooms and graffiti; every paid
change ends up in the repository so the game literally changes. First phase:
real room ownership in a **test** world only, no payments yet.

Ruled out: any provider whose KYC may ask for proof of address; email/password
logins; QR codes for moving the secret; a runtime-fetched world (CDN as
database); world commits in `main`.

## Decisions

- **Provider: undecided, pending replies.** Polar (support@polar.sh) and Xsolla
  (business@xsolla.com) were asked by email; Lemon Squeezy is dead for new
  sellers; Paddle bans virtual currency and asked a Russian-passport seller for
  proof of address; Gumroad's Stripe address step makes it a no under the
  standing constraint.
- **Кубики** — internal currency, bought in packs, non-transferable,
  non-redeemable. Everything bought is visible before purchase; randomness is
  only in free exploration. VLM-redrawn graffiti is acceptable (no rarity
  tiers).
- **Identity** — the browser generates a key pair: id = public key, secret =
  private key. The server stores nothing secret. Lost secret = lost rooms, a
  feature («фича»).
- **Keeping the secret** — all of: shown once (phrase), remembered in this
  browser («на этой машине тебя запомнил»), offered to the browser's password
  manager (id as login, secret as password — not a passkey, which cannot export
  its key), and a link for another device with the secret after `#`, stripped
  from the address bar on arrival. No QR.
- **Replay protection** — every signed request carries a sequence number; the
  server accepts only the next one.
- **Backend** — Cloudflare Worker + one Durable Object per world (serial
  execution, no races); `--env test` is a separate Worker/DO/secrets; the mint
  route lives only in the test entry file (`worker.test-env.ts`), with a test
  asserting the prod bundle lacks it. Operator has not yet confirmed
  Cloudflare.
- **World storage** — data branches, never `main`: `cube-world` (prod) and
  `cube-world-test`, like `cost-ledger`. A nightly job snapshots the DO into
  the branch and triggers a vova deploy (new entry in `deploy.yml`); every
  build fetches the branch snapshot and bakes it into the page; the Worker
  serves only actions since the snapshot. Worker down → static world of last
  night, read-only.
- **Test environment** — preview slots build against `cube-world-test` and the
  test Worker, with a visible "test world" banner; prod builds against prod.
- **Sharding later** — a room's address should carry its floor so a DO per
  floor is possible without migration.

Terms: «кубики» — the in-game currency; «ветка-база» — a data branch holding
the world snapshot.

## Errors and dead ends

- The predecessor recommended Lemon Squeezy; it closed sign-ups on 2026-11-16.
- Passkey was proposed for identity, then dropped: it cannot be shown as a
  phrase or sent as a link.
- QR for device transfer was proposed and rejected by the operator once the
  "photographed QR gives away the rooms" risk was stated.
- The agent started `/task` on message 13; the operator said it was not a task
  yet, and nothing was written.

## State

- Branch `claude/cube-payments-gx5cag`, no PR, no plan file. Nothing in the
  repository changed apart from the relay summaries.
- `vzakharov/life` was attached to the session (cloned at `/home/user/life`);
  only `finance/armenian-accounts/armenia-entity.md` and its `README.md` were
  read. Nothing written there.
- Gmail drafts, unsent, in vzakharov@gmail.com: to support@polar.sh (draft id
  r6070571361052961278) and business@xsolla.com (r3841761191740272037). The
  operator sends them himself.
- No CI, no subscription, no scheduled check-in. Keepalive stopped by this park.
- Estimate (this session, nothing handed on): 2 h senior analyst — matching
  about ten merchants of record against Armenian payouts, address-free KYC for a
  Russian passport and in-game currency rules; 1.5 h senior architect — identity,
  an ordered ledger and a branch-based world snapshot designed together.

### Watches

None.

## Pointers

- `src/cube/CLAUDE.md` — "Interactions come at a price": purchases change the
  world for everyone.
- `src/cube/pages/cube/ui/cube-canvas.tsx` — `holdingsRef` and `buy()`, today's
  per-tab demo purchase.
- `src/cube/entities/world/model/sale.ts` — `Holdings`, `priceOf`, `lotSign`
  (which rooms sell); `roomKey` in `src/cube/entities/world/model/room.ts`.
- `.github/workflows/deploy.yml` — the `gate` job and `publishing` set; the
  nightly world deploy needs a second entry here.
- `/home/user/life/finance/armenian-accounts/armenia-entity.md` (repo
  `vzakharov/life`) — the IE's tax regime: 1% turnover tax for IT income only,
  «Если это другой вид услуги — тогда 10%».
- Sources: Lemon Squeezy shutdown
  https://www.lemonsqueezy.com/blog/saying-goodbye-to-lemon-squeezy; Polar
  https://polar.sh/docs/merchant-of-record/acceptable-use,
  https://polar.sh/docs/merchant-of-record/account-reviews,
  https://polar.sh/docs/fees; Paddle
  https://paddle.com/help/start/intro-to-paddle/what-am-i-not-allowed-to-sell-on-paddle;
  Stripe restricted businesses https://stripe.com/legal/restricted-businesses;
  Habr report on Paddle/FastSpring KYC https://habr.com/en/articles/1011226.
- Transcript: https://claude.ai/code/session_01DaohkDJmcPPNQUpnEEuC6h
- Earlier summary: `relay-1.md` beside this file.

## Next step

Wait for the operator. Pending, both his: replies from Polar and Xsolla to the
drafts, and the go-ahead on the first phase — on message 13 he said «ну пока ещё
не таск наверное, но близко к этому». Once he says «делаем» or equivalent, route
it through `/task`: the work (Worker + DO with test/prod environments, browser
key identity with its four ways of keeping the secret, client merge of
snapshot + delta, data branches, nightly job and a second deploy entry) is a
plan that the operator reviews — and he must create a Cloudflare account and
give a token, which no agent can do.

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Вот именно, поэтому я его и не советую. Если страница каждый раз скачивает мир из ветки, получается база, просто её роль играет CDN. Мир перестаёт быть частью сайта.

Значит, берём сборку: мир вшивается в HTML, как всё остальное, а Worker отдаёт только то, что случилось после последней сборки. Упадёт Worker — у тебя всё равно статический сайт с миром на прошлую ночь.
```
