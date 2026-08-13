import Link from 'next/link';
import { ReactNode } from 'react';
import { Card } from '@/components/Card';
import { ThemeToggle } from '@/components/ThemeToggle';

/** Figures on this page were recomputed against the repository at this commit. */
const VERIFIED_AT = '12 August 2026';
const VERIFIED_SHA = '27fb41f1';

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="space-y-6">
      <h2 className="text-3xl font-bold">{title}</h2>
      {children}
    </section>
  );
}

function Snippet({ caption, code }: { caption: string; code: string }) {
  return (
    <figure className="space-y-2">
      <div className="border border-foreground/20 overflow-x-auto">
        <pre className="text-xs sm:text-sm font-mono p-4 leading-relaxed">
          {code}
        </pre>
      </div>
      <figcaption className="text-sm font-mono opacity-60">
        {caption}
      </figcaption>
    </figure>
  );
}

const TIMELINE = [
  {
    date: '6 March 2026',
    label: 'First commit.',
    note: 'An empty repository, against a live product with paying workspaces.',
  },
  {
    date: '21 May 2026',
    label: 'Release 4.0.0 — first production deployment.',
    note: 'Day 76.',
  },
  {
    date: '11 July 2026',
    label: 'Release 4.3.0 — Bubble retired, all workspaces cut over.',
    note: 'Day 127. Bubble frozen as an archive.',
  },
  {
    date: '12 August 2026',
    label: '1,513 commits on main, 1,229 pull requests, 1,225 issues.',
    note: 'Suspended for funding, not finished failing.',
  },
];

function Timeline() {
  return (
    <ol className="border-l border-foreground/30 space-y-6 pl-5 sm:pl-6">
      {TIMELINE.map(({ date, label, note }) => (
        <li key={date} className="relative">
          <span
            aria-hidden
            className="absolute -left-[1.4rem] sm:-left-[1.65rem] top-2 w-2 h-2 border border-foreground/60 bg-background"
          />
          <p className="text-sm font-mono opacity-60">{date}</p>
          <p className="font-bold">{label}</p>
          <p className="opacity-70">{note}</p>
        </li>
      ))}
    </ol>
  );
}

const RLS_COMMENT = `/**
 * Require every pgTable() call to be chained with .enableRLS().
 *
 * The app queries the database via Drizzle as the postgres superuser
 * (bypasses RLS), so no policies are needed. But enabling RLS with zero
 * policies locks down the Supabase Data API (PostgREST) — both anon and
 * authenticated roles get zero access to public tables.
 *
 * Auth is unaffected (operates on the auth schema, not public).
 */`;

const ROLLBACK_SQL = `-- Rollback for CUT-12: revert chats.createdBy FK and remove migration records
-- Apply in one shot against the target DB.
-- Safe to run even if some members were soft-deleted (deleted_at IS NOT NULL) —
-- their user_id still exists in auth.users, so the restored FK stays valid.

-- Step 1: undo 0032 — restore chats.created_by → auth.users(id)
ALTER TABLE "chats" DROP CONSTRAINT "chats_created_by_members_id_fk";

UPDATE chats c
SET created_by = m.user_id
FROM members m
WHERE m.id = c.created_by;

-- Step 2: remove migration records so Drizzle doesn't think 0031/0032 are applied
DELETE FROM drizzle.__drizzle_migrations
WHERE name IN ('0031_add-members-soft-delete', '0032_chats-created-by-member-fk');`;

export default function CaseStudy() {
  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20">
      <div className="max-w-3xl mx-auto space-y-16">
        <div className="flex justify-between items-start">
          <Link href="/" className="text-sm underline hover:opacity-70">
            ← vovazakharov.com
          </Link>
          <ThemeToggle />
        </div>

        <header className="space-y-5">
          <p className="text-sm font-mono opacity-60">case study</p>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
            Rebuilding Playgram
          </h1>
          <p className="text-xl opacity-80 leading-relaxed">
            Five months, a no-code platform retired, and the machine that made
            it possible.
          </p>
          <p className="text-sm font-mono opacity-60 leading-relaxed">
            Figures verified {VERIFIED_AT} against the repository at{' '}
            {VERIFIED_SHA}. The project is suspended, not dead, so they drift.
          </p>
        </header>

        <Section id="what" title="/what we built, and why">
          <div className="space-y-5 text-lg leading-relaxed">
            <p>
              Playgram is a multi-model AI chat platform for teams. Workspaces
              with project-level roles and invitations, chat across many LLM
              providers behind a single proxy, file handling, vector search and
              persistent memory, deep-research runs, an editable canvas with PDF
              export, voice input, usage-based billing.
            </p>
            <p>
              None of that is the interesting part. The interesting part is that
              it already existed.
            </p>
            <p>
              Playgram was a working product on Bubble.io with paying
              workspaces. Bubble had taken it further than most people would
              guess — but its constraints had become the ceiling, and the
              ceiling was low enough to be the roadmap. So the whole thing was
              rebuilt as a TypeScript application on Next.js, starting from an
              empty repository.
            </p>
            <p>
              That framing matters, because a rebuild is not a greenfield build.
              The replacement had to reach feature parity with a live
              application that kept shipping while the replacement was being
              written. The release names record this better than any
              retrospective could: the 4.0.x line is labelled by which Bubble
              version it had caught up to — “Bubble parity catch-up to 3.5.15”,
              “3.5.18 parity”. The target moved the entire time.
            </p>
            <p>
              Two claims worth reading on, both checkable against the git
              history. The first: the cutover <strong>completed</strong>.
              Releases 4.1.0 through 4.3.0 moved workspaces over in batches,
              ending at “Bubble retirement — all workspaces cut over”.
              Migrations that complete are considerably rarer than migrations
              that are announced. The second: one person did most of it, at team
              velocity, by building the machine described below.
            </p>
          </div>
        </Section>

        <Section id="how" title="/how we built it">
          <h3 className="text-2xl font-bold">The shape of five months</h3>
          <Timeline />
          <p className="text-lg leading-relaxed">
            The cadence behind that: a median of 64 commits a week across 24
            weeks, peaking at 107 in the second week — before there was any
            product to break.
          </p>

          <h3 className="text-2xl font-bold pt-4">What the schema remembers</h3>
          <div className="space-y-5 text-lg leading-relaxed">
            <p>
              114 migrations are the cleanest available proxy for how a domain
              model was actually understood over time, and a Bubble-to-Postgres
              remodel makes that unusually legible. Two arcs carry it.
            </p>
            <p>
              <strong>Identity moved from the user to the member.</strong> A
              cluster of migrations relocates display name, avatar, personal
              instructions and context from the account to the membership:{' '}
              <span className="font-mono text-base">0025</span>–
              <span className="font-mono text-base">0026</span> backfill and
              then drop{' '}
              <span className="font-mono text-base">
                user_configs.display_name
              </span>
              , <span className="font-mono text-base">0033</span> moves the user
              context list onto members,{' '}
              <span className="font-mono text-base">0028</span> and later{' '}
              <span className="font-mono text-base">0074</span> move the avatar.
              It reads as churn and it isn’t — it’s a product insight arriving
              in instalments. In a multi-workspace product, what you are called
              and how you want the assistant to behave belong to a membership,
              not to an account. You are a different colleague in a different
              workspace.
            </p>
            <p>
              <strong>
                For about six weeks the schema knew it had two populations
              </strong>{' '}
              —{' '}
              <span className="font-mono text-base">
                is_migrated_from_legacy
              </span>
              , a “requires password reset after migration” flag, a creator
              column made nullable for legacy rows — and then it deliberately
              stopped knowing. Migration{' '}
              <span className="font-mono text-base">0112</span> is the moment:
              it clears the unattributed legacy usage logs and restores the{' '}
              <span className="font-mono text-base">NOT NULL</span> constraint
              the import had forced off. Its comment notes that the constraint
              was dropped for exactly one reason — the Bubble import had rows
              with no workspace and had to be able to land them — and that with
              those rows now attributed or destroyed, “that reason is spent”.
              That is the point where the product stops being a migration.
            </p>
          </div>

          <h3 className="text-2xl font-bold pt-4">
            The choices that were load-bearing
          </h3>
          <div className="space-y-5 text-lg leading-relaxed">
            <p>
              Not a stack list. Four decisions with something in them for
              somebody who wasn’t there.
            </p>
            <p>
              <strong>
                Row-level security on every table, with zero policies.
              </strong>{' '}
              It is the second migration in the repository, before any feature.
              It reads like somebody misunderstood RLS, and it is the opposite
              of that.
            </p>
          </div>
          <Snippet
            caption="eslint/rules/enforce-rls.ts — the rule that keeps it from decaying"
            code={RLS_COMMENT}
          />
          <div className="space-y-5 text-lg leading-relaxed">
            <p>
              The app connects as the Postgres superuser through Drizzle, so it
              bypasses RLS entirely; policies were never the mechanism. Enabling
              RLS with <em>no</em> policies is what shuts down Supabase’s
              auto-generated PostgREST Data API — with RLS on and nothing
              granted, the anonymous and authenticated roles get zero access to
              public tables. It is a kill switch, not an authorization model,
              and a lint rule keeps it that way: every{' '}
              <span className="font-mono text-base">pgTable()</span> must be
              chained with{' '}
              <span className="font-mono text-base">.enableRLS()</span>. There
              are no <span className="font-mono text-base">CREATE POLICY</span>{' '}
              statements anywhere in the repository, which is the point rather
              than an omission.
            </p>
            <p>
              <strong>
                Historical-attribution columns take no foreign key.
              </strong>{' '}
              A column recording which project a usage event belonged to is a
              fact about the past, not a live reference. A foreign key would
              assert that the referent still exists — forcing a choice between{' '}
              <span className="font-mono text-base">CASCADE</span>, which
              destroys billing history, and{' '}
              <span className="font-mono text-base">SET NULL</span>, which
              erases the attribution, the moment a project is hard-deleted.
              Neither is acceptable, so the column is a denormalized fact with
              no constraint, and readers bucket the dangling id as its own row
              so breakdowns still sum to the total.
            </p>
            <p>
              <strong>
                One platform limitation, visible in two unrelated features.
              </strong>{' '}
              Railway caps a request at five minutes. Deep-research runs stream
              for up to 300 seconds, which is an acknowledged open constraint
              with a reconnect strategy deferred rather than solved. It is also
              the reason voice dictation streams from the browser directly to
              Deepgram over a short-lived minted JWT instead of proxying through
              a server WebSocket — a server socket would sit inside the same
              cap. One infrastructure constraint shaping two features that share
              nothing else is a better architecture story than any table of
              choices.
            </p>
            <p>
              <strong>
                A barrel system that encodes access level rather than
                visibility.
              </strong>{' '}
              Five suffixes, including{' '}
              <span className="font-mono text-base">index.node-safe.ts</span>{' '}
              for an axis orthogonal to client/server: scripts run under tsx
              with no bundler, so a barrel becomes unimportable the moment its
              import graph reaches a stylesheet. The suffix is what keeps that
              discoverable instead of a runtime surprise.
            </p>
          </div>

          <h3 className="text-2xl font-bold pt-4">The machine</h3>
          <div className="space-y-5 text-lg leading-relaxed">
            <p>
              This is the part nobody else can write, and the most broadly
              useful. The thesis is one sentence:{' '}
              <strong>
                the guardrails are machine-checked, not written down as prose
                for the agent to remember.
              </strong>
            </p>
            <p>
              One command runs a type-generation step and then fourteen checks
              in parallel: typecheck, format, lint, architectural structure, CSS
              lint, an import-graph poison check that walks the module graph
              from every client file looking for server-only code, dependency
              checks, AST metrics, dead-code detection, type-overlap, a
              migration-chain check, a license check, a security diff, and the
              tests. Twenty-eight project-local ESLint rules encode conventions
              a general-purpose linter has no opinion about — twenty-six of them
              with their own rule-tester tests. Tests are bucketed by which
              credentials they need so the credential-free bucket runs on every
              iteration, and gating a test on the presence of an environment
              variable is <em>prohibited</em>, because a skip would convert the
              one signal that catches a misfiled test into a green tick.
            </p>
            <p>
              The argument is strongest made from the instruction file’s own
              history. It went through 116 revisions, and several of its rules
              are corrections of earlier rules rather than new ones:
            </p>
            <ul className="list-disc list-outside space-y-2 ml-6">
              <li>
                <strong>Errors must propagate</strong> — tightened after “log it
                and continue” became an escape hatch. The rule now says a
                logged-and-continued error is a silent fail with paperwork.
              </li>
              <li>
                <strong>Parse at boundaries with a runtime schema</strong> —
                then bounded, after agents over-corrected into parsing arguments
                that were already typed. A rule that fires everywhere gets
                applied everywhere.
              </li>
              <li>
                <strong>No background shell commands</strong> — its one
                exception removed after a background watch loop made sessions
                read as busy, so operators stopped coming back to them.
              </li>
            </ul>
            <p>
              An instruction file treated as a debugged artifact rather than a
              style guide.
            </p>
            <p>
              <strong>The plan/implement split</strong>, and the unglamorous
              reason for it. In browser-based sessions an idle session re-emits
              its pending approval prompt, stacking duplicates and silently
              dropping answers to superseded ones. So plans became files on a
              branch and questions became numbered prose. Everything else — the
              filename lifecycle, the go-ahead gate, the handoff block — is
              scaffolding around that one constraint.
            </p>
            <p>
              The sharpest lesson in that sequence is a failure mode specific to
              working with agents. Ending a planning turn with “want me to
              implement it?” primed the agent to read the operator’s next
              message as assent — so a plan <em>correction</em> got code written
              instead. Planning turns now end with a copyable command naming a
              new session, because a question invites a misread and a command
              doesn’t.
            </p>
            <p>
              <strong>Tombstones.</strong> Retired work isn’t deleted; it is
              left as a small file recording the archive commit and the recipe
              to read it. It became a standing rule for a reason specific to
              this way of working: when the agent’s context is whatever the
              repository says, “why is this gone?” is a question the repository
              has to be able to answer by itself.
            </p>
            <p>
              <strong>
                A directory whose name is the instruction, and the number that
                makes it land.
              </strong>{' '}
              Working artifacts — squash proposals, preview screenshots, log
              dumps — live in a directory called{' '}
              <span className="font-mono text-base">remove-before-merging</span>
              , swept before merge. Across more than a thousand merged pull
              requests, something reached the trunk from it exactly four times:
              three of them a harmless scratch file, and once a 984,924-byte
              production log dump containing customer email addresses. It sat
              there for a day. The step that does the sweeping now cites its own
              breach. A convention that holds almost always and fails once,
              expensively, is more instructive than either “it works” or “it
              doesn’t”.
            </p>
          </div>
        </Section>

        <Section id="trouble" title="/the interesting trouble">
          <p className="text-lg leading-relaxed">
            A case study with no reversals in it is marketing. For each of
            these: what was chosen, what it cost, what replaced it, and what the
            tell was.
          </p>

          <h3 className="text-2xl font-bold pt-2">Three reversals</h3>
          <div className="space-y-5 text-lg leading-relaxed">
            <p>
              <strong>
                Cloud Run: live for two days, five months to finish reversing.
              </strong>{' '}
              Railway was documented as the minimal approach on 6 March. On 10
              March Cloud Run was chosen over it, on the strength of $25,000 in
              GCP credits. On 12 March it went on hold: GCP’s IAM and org-policy
              complexity had “consumed hours for a task (public staging URL)
              that takes seconds on any other platform”, and the credits “remain
              unconfirmed”. On 5 August it was deleted.
            </p>
            <p>
              The shape <em>is</em> the story. The decision was live for two
              days and took five months to finish reversing, because for five
              months the repository described Cloud Run as parked rather than
              gone and kept the tooling to resume it. Unwinding it meant
              unwinding rationale that had justified unrelated present-day
              choices by Cloud Run’s properties: a database driver’s fit for a
              persistent server, the package manager’s Dockerfile integration, a
              future worker as a second service, one database’s edge advantage,
              the reverse-proxy examples in two unrelated modules. The lesson is
              in the deletion commit rather than in the reversal:{' '}
              <strong>
                a parked decision keeps costing you, because other decisions
                start citing it.
              </strong>
            </p>
            <p>
              <strong>Deleting per-PR CI.</strong> Actions spend ran about $190
              a month against a 2,000-minute free allowance, with the per-PR
              test lane accounting for 69% of it — re-running on every push a
              suite an agent can run locally for nothing. Deleting it took spend
              to about $4 a month.
            </p>
            <p>
              What makes that a decision rather than a cost cut is what it
              refused. Keeping only the old lane’s location would have meant a
              nine-minute whole-repo run on every iteration — “a check people
              skip”. So the replacement reproduced the old lane’s change-picking
              against the merge base, and in doing so discovered that the old
              lane had been silently under-selecting: editing the React Testing
              Library setup file selected 170 of 526 test files, because the
              test runner’s change detection cannot see files no test imports.
              Setting those triggers explicitly made the replacement{' '}
              <em>better</em> than the thing it replaced, not merely cheaper.
            </p>
            <p>
              The cost is written down in the decision doc’s own blunt terms: a
              broken payment webhook or member-role check can reach the trunk
              and sit until the nightly — contained by the trunk deploying only
              to a dev environment, and by a release gate that runs everything.
              A pull request now carries no CI verdict at all, so verification
              became a written attestation with a release-qualification
              backstop.
            </p>
            <p>
              <strong>A bespoke process system, built and deleted.</strong> A
              DAG-based project-management approach — tasks in a graph,
              per-agent-persona team files, an orphan coordination branch, sync
              scripts, two skills — ran for two months and was then abandoned
              for plain GitHub issues. One artifact survived because it earned
              it: a skill that finds an existing issue for a unit of work or
              files a new one. A tag marks where the rest can still be read. The
              honest reading is uncomfortable and worth stating: an agent-driven
              codebase makes it cheap to build elaborate process machinery,
              which is exactly why it needs deleting when it doesn’t pay for
              itself.
            </p>
          </div>

          <h3 className="text-2xl font-bold pt-4">
            The cutover’s three good problems
          </h3>
          <div className="space-y-5 text-lg leading-relaxed">
            <p>
              <strong>Passwords couldn’t come across.</strong> Bubble’s hashes
              were proprietary. So every user was pre-created in Supabase Auth
              through the admin API with no password supplied, plus a dedicated
              “requires reset” column — necessary because the auth service
              auto-generates a random hash during user creation, which makes the
              stored password field useless as a marker for “never set one”.
              Reset happens lazily, on first failed login, with no cutover-day
              mass email. The accepted cost is written down rather than
              discovered later: the login form leaks the existence of
              fully-activated accounts, and rate limiting is the stated
              mitigation. A migration constraint, a non-obvious solution and an
              owned tradeoff in one story.
            </p>
            <p>
              <strong>The old vectors had to stay readable.</strong> Chat and
              chunk data already written by Bubble lived in the production
              vector cluster, and non-production environments needed to read it
              during the migration window without copying vectors between
              clusters. The routing rule is the <em>shape</em> of the tenant
              name: a UUID goes to the new cluster, anything else — a Bubble id
              — goes to production, with graceful fallback.
            </p>
            <p>
              <strong>One schema change shipped with its own undo.</strong> The
              only SQL file in the repository outside the migration journal is a
              hand-written rollback: twenty-two commented lines that restore a
              foreign key, backfill it in the other direction, delete two rows
              from the migration ledger so the tool stops believing they were
              applied, and explain why it is safe against soft-deleted members.
            </p>
          </div>
          <Snippet
            caption="drizzle/rollback-cut-12.sql — abridged; concrete evidence the cutover was planned as reversible"
            code={ROLLBACK_SQL}
          />

          <h3 className="text-2xl font-bold pt-4">
            Four bugs with mechanisms worth learning from
          </h3>
          <div className="space-y-5 text-lg leading-relaxed">
            <p>
              <strong>
                Usage logs persisted zero tokens on every single insert.
              </strong>{' '}
              A hand-written params type declared{' '}
              <span className="font-mono text-base">
                tokenCounts: {'{'} input, output {'}'}
              </span>{' '}
              while the columns were{' '}
              <span className="font-mono text-base">inputTokens</span> /{' '}
              <span className="font-mono text-base">outputTokens</span>. The ORM
              silently dropped the fields that didn’t match. Nothing failed; the
              numbers were just zero. It was found by accident during an
              unrelated refactor, when the type was finally derived from the
              table’s own inferred insert type. The rule it produced — anything
              whose shape tracks another declaration must be derived from it,
              never restated — is now machine-enforced by a type-overlap
              detector at threshold one: any member that two named types both
              declare has to have exactly one home.
            </p>
            <p>
              <strong>“Draw a dog” produced empty assistant messages.</strong>{' '}
              The AI SDK put the image-generation tool’s output in{' '}
              <span className="font-mono text-base">staticToolResults</span>,
              not in <span className="font-mono text-base">result.files</span>,
              and the streaming pipeline only checked the latter. Generated
              images were silently dropped. This is the incident that produced
              the never-swallow-errors rule, later tightened into the “silent
              fail with paperwork” phrasing.
            </p>
            <p>
              <strong>
                One dropped payment event froze a renewal permanently.
              </strong>{' '}
              A single webhook was the only routine writer of the
              current-period-end column after activation, so one missed event
              stuck the renewal anchor forever. Fixed by adding a second,
              deliberately narrow writer that updates the period columns and
              nothing else — activation and revocation stay with the events that
              own them.
            </p>
            <p>
              <strong>A payment customer for every abandoned checkout.</strong>{' '}
              Creating the customer while building the checkout URL left a
              customer-bearing row for every visitor who started a checkout and
              never paid — four in production, one more every eleven days or so.
              Creation moved to the moment of payment, with an accepted cost
              stated up front: a payer who edits their email address on the
              payment provider’s own page defeats reuse-by-email.
            </p>
            <p>
              And one rewrite rather than a bug. The chat list had several
              independent representations of “what chats exist”, reconciled by
              hand, which bred a long tail of “updated here, stale there” merge
              bugs. It was replaced wholesale by a query library with a
              normalized cache plus one small store for genuinely client-side
              workflow state, staged behind a ledger carrying forward every
              behaviour the prior patches had bought. The framing is the point:
              it eliminated the reported glitches{' '}
              <strong>as classes rather than as patches</strong>.
            </p>
          </div>

          <h3 className="text-2xl font-bold pt-4">
            What the record can’t tell you
          </h3>
          <div className="space-y-5 text-lg leading-relaxed">
            <p>
              Across five months the same work got recorded three different
              ways: the agent as a co-author trailer, the agent as the commit{' '}
              <em>author</em> outright, and no trailer at all. None of those
              three distinguishes “a human typed this” from “an agent typed this
              under direction”. The trailer records which tool ran and whether
              its convention survived the commit — nothing more.
            </p>
            <p>
              The trailer strings do make a rough log of which model was working
              when: Sonnet in early March, then Opus, then Opus with a
              million-token context window, then successive Opus versions, then
              a generic “Claude” once the trailer stopped naming the model at
              all.
            </p>
            <p>
              So the useful conclusion is a negative one.{' '}
              <strong>
                In an agent-driven codebase the commit record can no longer
                answer “who wrote this”
              </strong>{' '}
              — and the question worth asking shifts to who specified it, who
              reviewed it, and who owns it when it breaks. That is not a quirk
              of one repository’s discipline. It is a problem the industry is
              about to have.
            </p>
            <p>
              One artifact makes it concrete better than any statistic: a review
              comment on a pull request addressed to a human and an agent in the
              same breath, telling the agent not to proceed on certain questions
              until it had an answer from the person. That is what code review
              looks like now.
            </p>
          </div>
        </Section>

        <Section id="credits" title="/who wrote it">
          <Card className="space-y-5 text-lg leading-relaxed">
            <p>
              I authored 1,394 of the 1,513 commits on the trunk and 1,098 of
              the 1,229 pull requests — about 92% and 89% — and roughly 91% of
              the lines added, excluding generated files. I was the sole
              reviewer on every pull request in the repository, and merged 115
              of the 116 that the other three engineers landed.
            </p>
            <p>
              Three other engineers worked on this, and they joined earlier than
              “at the end” — from early May, so for three of the five months.
              Their work was not cosmetic: database migrations, the model
              catalog, usage analytics, member groups, the billing and
              subscription surface, onboarding, auth, chat UI. Between them they
              account for about 13% of net lines added. They are named in the
              version history; I would rather ask each of them before putting
              their names on a page of mine.
            </p>
            <p>
              <strong>The reviewing cuts both ways.</strong> Being the only
              reviewer on 1,229 pull requests is a real load-bearing
              contribution and a single point of failure, and the second is as
              true as the first. It was substantive rather than a rubber stamp —
              54 of the other engineers’ 131 pull requests carry a formal
              review, and those 54 hold 169 review events, including threads
              that alternate a dozen times. But there was nobody reviewing me.
            </p>
            <p>
              <strong>Everyone was agent-assisted.</strong> Not just me. It
              would be a flattering distortion to present myself as the
              agent-driven one and my colleagues as conventional engineers, and
              it would also be false. I am not going to attach a percentage to
              it, because the only available measurement — how often a co-author
              trailer survived into a commit — measures tooling discipline, not
              whether a human typed the code. What is genuinely mine is not the
              typing. It is the harness: the skills, the instruction file, the
              lint rules, the gate. Everyone was agent-assisted; one person
              built the machine that made that safe.
            </p>
            <p>
              And 156 of my own pull requests — 14% — were closed without ever
              being merged. Abandoned attempts left visible in the record are
              evidence the process was real rather than curated.
            </p>
          </Card>
          <p className="text-sm opacity-70 leading-relaxed">
            Playgram’s founder cleared the naming of the project, its
            architecture and the individual snippets quoted here. The repository
            itself is private and stays that way.
          </p>
        </Section>

        <footer className="text-center opacity-60 text-sm pt-8 border-t border-foreground/20">
          <p>
            <Link href="/" className="underline hover:opacity-100">
              back to vovazakharov.com
            </Link>
            {' · '}
            <Link href="/cv" className="underline hover:opacity-100">
              cv
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
