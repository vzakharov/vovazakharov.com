import Link from 'next/link';
import { ReactNode } from 'react';
import { Card } from '@/components/Card';
import { ThemeToggle } from '@/components/ThemeToggle';

// Every figure quoted below is as-of this commit; update the stamp with them.
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

/** Inline code inside prose — sized to sit on the serif baseline without jumping. */
function Code({ children }: { children: ReactNode }) {
  return <span className="font-mono text-base">{children}</span>;
}

function Prose({ children }: { children: ReactNode }) {
  return <div className="space-y-5 text-lg leading-relaxed">{children}</div>;
}

/** `lead` drops the top padding for a subhead that directly follows its section heading. */
function SubHead({ children, lead }: { children: ReactNode; lead?: boolean }) {
  return (
    <h3 className={`text-2xl font-bold${lead ? '' : ' pt-4'}`}>{children}</h3>
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
          <Prose>
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
          </Prose>
        </Section>

        <Section id="how" title="/how we built it">
          <SubHead lead>The shape of five months</SubHead>
          <Timeline />
          <p className="text-lg leading-relaxed">
            The cadence behind that: a median of 64 commits a week across 24
            weeks, peaking at 107 in the second week — before there was any
            product to break.
          </p>

          <SubHead>What the schema remembers</SubHead>
          <Prose>
            <p>
              114 migrations are the cleanest available proxy for how a domain
              model was actually understood over time, and a Bubble-to-Postgres
              remodel makes that unusually legible. Two arcs carry it.
            </p>
            <p>
              <strong>Identity moved from the user to the member.</strong> A
              cluster of migrations relocates display name, avatar, personal
              instructions and context from the account to the membership:{' '}
              <Code>0025</Code>–<Code>0026</Code> backfill and then drop{' '}
              <Code>user_configs.display_name</Code>, <Code>0033</Code> moves
              the user context list onto members, <Code>0028</Code> and later{' '}
              <Code>0074</Code> move the avatar. It reads as churn and it isn’t
              — it’s a product insight arriving in instalments. In a
              multi-workspace product, what you are called and how you want the
              assistant to behave belong to a membership, not to an account. You
              are a different colleague in a different workspace.
            </p>
            <p>
              <strong>
                For about six weeks the schema knew it had two populations
              </strong>{' '}
              — <Code>is_migrated_from_legacy</Code>, a “requires password reset
              after migration” flag, a creator column made nullable for legacy
              rows — and then it deliberately stopped knowing. Migration{' '}
              <Code>0112</Code> is the moment: it clears the unattributed legacy
              usage logs and restores the <Code>NOT NULL</Code> the import had
              forced off. The constraint was dropped for exactly one reason —
              Bubble rows with no workspace had to be able to land — and with
              those rows attributed or destroyed, its comment says, “that reason
              is spent”. That is where the product stops being a migration.
            </p>
          </Prose>

          <SubHead>The choices that were load-bearing</SubHead>
          <Prose>
            <p>
              Not a stack list. Three decisions with something in them for
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
          </Prose>
          <Snippet
            caption="eslint/rules/enforce-rls.ts — the rule that keeps it from decaying"
            code={RLS_COMMENT}
          />
          <Prose>
            <p>
              The app connects as the Postgres superuser through Drizzle, so it
              bypasses RLS entirely; policies were never the mechanism. Enabling
              RLS with <em>no</em> policies is what shuts down Supabase’s
              auto-generated PostgREST Data API — with RLS on and nothing
              granted, the anonymous and authenticated roles get zero access to
              public tables. A kill switch, not an authorization model. There
              are no <Code>CREATE POLICY</Code> statements anywhere in the
              repository, which is the point rather than an omission.
            </p>
            <p>
              <strong>
                Historical-attribution columns take no foreign key.
              </strong>{' '}
              A column recording which project a usage event belonged to is a
              fact about the past, not a live reference. A foreign key would
              assert that the referent still exists — forcing a choice between{' '}
              <Code>CASCADE</Code>, which destroys billing history, and{' '}
              <Code>SET NULL</Code>, which erases the attribution, the moment a
              project is hard-deleted. Neither is acceptable, so the column is a
              denormalized fact with no constraint, and readers bucket the
              dangling id as its own row so breakdowns still sum to the total.
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
              cap. Two features that share nothing else, both shaped by one line
              in someone else’s pricing page.
            </p>
          </Prose>

          <SubHead>The machine</SubHead>
          <Prose>
            <p>
              One sentence:{' '}
              <strong>
                the guardrails are machine-checked, not written down as prose
                for the agent to remember.
              </strong>
            </p>
            <p>
              One command runs fourteen checks in parallel — among them an
              import-graph poison check that walks outward from every client
              file hunting server-only code, a dead-code sweep, a type-overlap
              detector, a migration-chain check, a license check and a security
              diff. Twenty-eight project-local ESLint rules encode conventions a
              general-purpose linter has no opinion about, twenty-six with their
              own rule-tester tests. Tests are bucketed by which credentials
              they need so the credential-free bucket runs every iteration — and
              gating a test on an environment variable is <em>prohibited</em>,
              because a skip would convert the one signal that catches a
              misfiled test into a green tick.
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
              One failure mode there is specific to working with agents. Ending
              a planning turn with “want me to implement it?” primed the agent
              to read the operator’s next message as assent — so a plan{' '}
              <em>correction</em> got code written instead. Planning turns now
              end with a copyable command naming a new session: a question
              invites a misread, a command doesn’t.
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
              <Code>remove-before-merging</Code>, swept before merge. Across
              more than a thousand merged pull requests, something reached the
              trunk from it exactly four times: three of them a harmless scratch
              file, and once a 984,924-byte production log dump containing
              customer email addresses. It sat there for a day. The step that
              does the sweeping now cites its own breach. A convention that
              holds almost always and fails once, expensively, is more
              instructive than either “it works” or “it doesn’t”.
            </p>
          </Prose>
        </Section>

        <Section id="trouble" title="/the interesting trouble">
          <p className="text-lg leading-relaxed">
            A case study with no reversals in it is marketing.
          </p>

          <h3 className="text-2xl font-bold pt-2">Three reversals</h3>
          <Prose>
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
              The shape <em>is</em> the story. Two days live, five months to
              finish reversing — because for five months the repository
              described Cloud Run as parked rather than gone, and kept the
              tooling to resume it. Unwinding it meant unwinding rationale that
              had justified unrelated present-day choices by Cloud Run’s
              properties: a database driver’s fit for a persistent server, the
              package manager’s Dockerfile integration, a future worker as a
              second service, one database’s edge advantage, reverse-proxy
              examples in two unrelated modules. The lesson is in the deletion
              commit rather than the reversal:{' '}
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
              refused. Simply moving the old lane would have meant a nine-minute
              whole-repo run every iteration — “a check people skip”. So the
              replacement reproduced its change-picking against the merge base,
              and in doing so found the old lane had been silently
              under-selecting: editing the React Testing Library setup file
              picked 170 of 526 test files, because the runner’s change
              detection cannot see files no test imports. Setting those triggers
              explicitly made the replacement <em>better</em> than what it
              replaced, not merely cheaper.
            </p>
            <p>
              The cost is written down in the decision doc’s own blunt terms: a
              broken payment webhook or member-role check can reach the trunk
              and sit until the nightly — contained by the trunk deploying only
              to a dev environment, and by a release gate that runs everything.
              A pull request now carries no CI verdict at all, so verification
              became a written attestation with a release gate behind it.
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
          </Prose>

          <SubHead>The cutover’s three good problems</SubHead>
          <Prose>
            <p>
              <strong>Passwords couldn’t come across.</strong> Bubble’s hashes
              were proprietary. So every user was pre-created in Supabase Auth
              through the admin API with no password supplied, plus a dedicated
              “requires reset” column — necessary because the auth service
              auto-generates a random hash during user creation, which makes the
              stored password field useless as a marker for “never set one”.
              Reset happens lazily, on first failed login, with no cutover-day
              mass email. The cost is written down rather than discovered later:
              the login form leaks the existence of fully-activated accounts,
              and rate limiting is the stated mitigation.
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
          </Prose>
          <Snippet
            caption="drizzle/rollback-cut-12.sql — abridged; concrete evidence the cutover was planned as reversible"
            code={ROLLBACK_SQL}
          />

          <SubHead>Four bugs with mechanisms worth learning from</SubHead>
          <Prose>
            <p>
              <strong>
                Usage logs persisted zero tokens on every single insert.
              </strong>{' '}
              A hand-written params type declared{' '}
              <Code>
                tokenCounts: {'{'} input, output {'}'}
              </Code>{' '}
              while the columns were <Code>inputTokens</Code> /{' '}
              <Code>outputTokens</Code>. The ORM silently dropped the fields
              that didn’t match. Nothing failed; the numbers were just zero, and
              it surfaced by accident during an unrelated refactor that derived
              the type from the table’s own inferred insert type. The rule it
              produced — anything whose shape tracks another declaration must be
              derived from it, never restated — is now enforced by a
              type-overlap detector at threshold one: any member two named types
              both declare has to have exactly one home.
            </p>
            <p>
              <strong>“Draw a dog” produced empty assistant messages.</strong>{' '}
              The AI SDK put the image-generation tool’s output in{' '}
              <Code>staticToolResults</Code>, not in <Code>result.files</Code>,
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
          </Prose>

          <SubHead>What the record can’t tell you</SubHead>
          <Prose>
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
          </Prose>
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
              <strong>Everyone was agent-assisted.</strong> Not just me — and
              presenting myself as the agent-driven one and my colleagues as
              conventional engineers would be a flattering distortion. I am not
              going to attach a percentage to it, because the only available
              measurement — how often a co-author trailer survived into a commit
              — measures tooling discipline, not whether a human typed the code.
              What is genuinely mine is not the typing. It is the harness: the
              skills, the instruction file, the lint rules, the gate. Everyone
              was agent-assisted; one person built the machine that made that
              safe.
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
