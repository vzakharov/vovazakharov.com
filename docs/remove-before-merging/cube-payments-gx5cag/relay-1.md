# Relay 1 — real payments for the cube

## Standing constraints

None given.

## The conversation

1. **Operator:** «давай попробуем подключить мне страйп (ну или что-то) для
   куба. у меня есть армянский ип, что мне нужно дальше»

   **Agent:** Routed as rung 2 (a question, no change). Answered that Stripe
   does not onboard Armenian merchants; recommended a merchant of record (Lemon
   Squeezy first, Polar and Paddle as alternatives), listed what the operator
   needs (account on the IE, USD account with SWIFT, terms/refund/privacy pages,
   an accountant on the IE's tax regime), named the code gap (a backend that
   records ownership, since purchases must change the world for everyone), and
   put three numbered questions to the operator: which provider, a price ceiling
   for floors priced up to $9,999,999, and whether a Cloudflare-style backend is
   acceptable. Offered the muthur sync once. (verbatim in Last agent turn)

## Intent

Take real money for rooms bought in the cube (`/cube` on vovazakharov.com),
selling as an Armenian sole proprietor (ИП). The operator is open on provider
("страйп (ну или что-то)").

## Decisions

- **Merchant of record over a direct acquirer** — Stripe does not support
  Armenia; a MoR also remits VAT worldwide. Lemon Squeezy is the recommendation
  because Armenia is on its official bank-payout list; Paddle's eligibility for
  Armenian sellers comes only from a third-party legal guide. Not yet confirmed
  by the operator.
- **Checkout needs no server, ownership does** — the MoR's checkout runs as a
  client-side overlay on the static export, but `src/cube/CLAUDE.md` makes a
  purchase change the world for every player, so a webhook receiver plus a store
  of holdings (e.g. a Cloudflare Worker with a database) is required. Pending the
  operator's yes.

## Errors and dead ends

None.

## State

- Branch `claude/cube-payments-gx5cag` (renamed from the auto-branch
  `claude/sweet-dirac-gx5cag`, which was never pushed). No PR. Nothing in the
  repository changed apart from this summary.
- No CI, no subscription, no scheduled check-in. No artifact watches.
- Estimate (whole session, nothing handed on): 1.5 h senior analyst — choosing a
  payment provider for a non-Stripe country needs current knowledge of
  acquirers, merchants of record and tax exposure; 0.5 h senior architect — a
  static-export site with no server constrains which checkout flows can work.
- The muthur sync offer was made; do not make it again.

## Pointers

- `src/cube/CLAUDE.md` — the rule that interactions come at a price and change
  the world for everyone.
- `src/cube/pages/cube/ui/cube-canvas.tsx` — `holdingsRef` and `buy()`: today's
  demo purchase, held for the page's life alone.
- `src/cube/entities/world/model/sale.ts` — `priceOf` (floor 2 at $10M, floors
  ≥9 at $4.99); `src/cube/pages/cube/lib/figures.ts` — `formatPrice`.
- Sources quoted: Lemon Squeezy supported countries
  (https://docs.lemonsqueezy.com/help/getting-started/supported-countries),
  Polar (https://polar.sh/docs/merchant-of-record/supported-countries), Paddle
  (https://www.paddle.com/help/start/account-verification/which-countries-are-supported-by-paddle),
  the Armenian guide
  (https://armenian-lawyer.com/ru/business-immigration/payment-gateways-fintech-armenia/).
- Transcript: https://claude.ai/code/session_01DaohkCEniH9ALnR1ofRPXo

## Next step

Wait for the operator's answers to the three questions (provider, price ceiling,
backend). Once they say «делаем» or equivalent, route it through `/task` — the
work spans a backend, the cube's purchase flow and new legal pages, so it likely
wants a plan.

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Вова, Stripe напрямую не выйдет: Армении нет в его списке стран, где можно открыть аккаунт продавца. Для армянского ИП обычно берут посредника, который сам официально продаёт товар покупателю (merchant of record, MoR), а тебе выплачивает выручку. Лучший кандидат — **Lemon Squeezy**: Армения есть в его официальном списке стран для выплат на банковский счёт. Кстати, принадлежит он самому Stripe, так что Stripe в каком-то смысле всё-таки будет. Запасные варианты — Polar (Армения в списке, выплаты через Stripe Connect) и Paddle (по словам армянских юристов, армянских продавцов берёт, но решает по каждой заявке отдельно; в документации Paddle я этого не нашёл). Посредник ещё и платит за тебя НДС во всех странах покупателей, а это отдельный круг ада, который тебя обойдёт.

### Что нужно с твоей стороны

1. **Аккаунт на Lemon Squeezy, оформленный на ИП.** Понадобятся паспорт, документы о регистрации ИП и валютный счёт в армянском банке с SWIFT.
2. **Сайт, который пройдёт их проверку.** Сайт смотрит живой человек. Ему нужно видеть, что именно продаётся, правила возврата, условия и политику конфиденциальности. Сейчас у куба ничего из этого нет, страницы напишем сами.
3. **Консультация с армянским бухгалтером.** Выплаты от посредника для твоего ИП — это экспорт услуг, а на каком налоговом режиме ты сидишь, я не знаю.

### Чего не хватает в коде

Сам платёж — это мелочь: на статическом сайте окно оплаты открывается скриптом посредника, свой сервер для этого не нужен. Сложность в другом. По правилам куба покупка меняет мир **для всех** (`src/cube/CLAUDE.md`, «Interactions come at a price»). А сейчас купленные комнаты живут только до закрытия вкладки: в `src/cube/pages/cube/ui/cube-canvas.tsx:86` прямо написано, что это демо и денег оно не берёт. Чтобы покупка стала настоящей, нужен маленький бэкенд, а у сайта, напомню, сервера нет совсем. Например, Cloudflare Worker с базой. Он принимает от Lemon Squeezy сообщение «оплачено, комната такая-то» и хранит, кому какая комната принадлежит, а куб при загрузке спрашивает у него этот список.

### Что решить тебе

1. **Посредник:** Lemon Squeezy, Polar или Paddle? Я бы взял Lemon Squeezy.
2. **Потолок цен.** Этаж 2 сейчас стоит $9,999,999. Ни один платёжный сервис такую сумму одной картой не проведёт: даже у Stripe потолок одного платежа меньше миллиона. Дорогие этажи оставляем шуткой без кнопки «Buy», вводим потолок цены или вместо оплаты пишем «свяжитесь с нами»?
3. **Бэкенд.** Готов ли ты завести Cloudflare (или что-то подобное) под учёт владельцев? Без него деньги спишутся, а комната после перезагрузки снова будет продаваться. Получится торговля воздухом без его доставки.

Пока это был просто ответ, в репозитории я ничего не менял. Скажешь «делаем» — составлю план.

Ещё одно: в muthur, откуда репозиторий берёт агентскую инфраструктуру (хуки, правила, скиллы), с последней синхронизации появилось 2 новых коммита. Если хочешь, запущу их перенос в отдельной сессии.

Источники:
- [Payment Gateways & Fintech in Armenia (2026 Guide)](https://armenian-lawyer.com/ru/business-immigration/payment-gateways-fintech-armenia/)
- [Lemon Squeezy — Supported Countries](https://docs.lemonsqueezy.com/help/getting-started/supported-countries)
- [Polar — Supported countries](https://polar.sh/docs/merchant-of-record/supported-countries)
- [Paddle — Which countries are supported](https://www.paddle.com/help/start/account-verification/which-countries-are-supported-by-paddle)
- [Stripe Tax — Armenia](https://docs.stripe.com/tax/supported-countries/asia-pacific/armenia)
```
