import type { Messages } from '@/shared/i18n';

type StackGroupKey = keyof Messages['cv']['techStack']['groups'];

/**
 * The CV's stack, one line per group, in the order the sheet shows them. In
 * code rather than in the catalogues for the reason `TECH_STACKS` gives: every
 * item is a proper noun no locale translates, so two copies could only
 * disagree. The groups' titles do translate, and the key type ties each group
 * here to its title there.
 */
export const TECH_STACK: Record<StackGroupKey, string> = {
  languages: 'TypeScript, Python, SQL',
  frontend:
    'Next.js (App Router), React, Mantine, TanStack Query, Zustand, Tiptap; Vue / Nuxt',
  backend:
    'Next.js server actions / BFF, NestJS, Django, FastAPI; PostgreSQL (Supabase), Drizzle ORM, Weaviate',
  ai: 'Vercel AI SDK, OpenAI / Anthropic / Gemini APIs, LiteLLM, Deepgram, Replicate; Gradio, Google Colab',
  infrastructure:
    'Railway, Docker, Cloudflare Workers, GitHub Actions, GitHub Pages, Bunny CDN, Stripe, PostHog',
  quality:
    'Vitest, Playwright, MSW, ESLint, Steiger (FSD), knip, Prettier, Stylelint',
  agentic: 'Claude Code, muthur',
};
