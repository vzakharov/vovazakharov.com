/**
 * The stack line each project shows, keyed by the CV's experience key. Below
 * `pages/` because the home cards and the CV entry render the same line and are
 * different slices; in code rather than in the message catalogs for the reason
 * `EXPERIENCE_KEYS` is — a stack doesn't vary by locale, so `en` and `ru` would
 * only be free to disagree about one.
 *
 * That one string serves both locales is what keeps every item a proper noun or
 * an untranslated term: connective prose belongs in the entry's bullets.
 */
export const TECH_STACKS = {
  playgram: 'Next.js 16, Railway + Supabase, feature-sliced design',
  englishForKids: 'Next.js, OpenAI API, custom game engine',
  orcool:
    'Next.js/NestJS, Cloudflare Workers, Firebase, custom LLM orchestration framework',
  randddb: 'Django + PostgreSQL, Vue + TypeScript',
} as const;
