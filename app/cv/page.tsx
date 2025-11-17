'use client';

import Link from "next/link";
import { Card } from "@/components/card";
import { ThemeToggle } from "@/components/theme-toggle";

export default function CVPage() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header with theme toggle and print button */}
        <div className="flex justify-between items-start print:hidden">
          <button
            onClick={handlePrint}
            className="border border-foreground/40 px-6 py-3 hover:bg-foreground hover:text-background transition-colors"
          >
            Print / Save as PDF
          </button>
          <ThemeToggle />
        </div>

        {/* CV Header */}
        <header className="text-center space-y-4 pb-8 border-b border-foreground/20">
          <h1 className="text-4xl sm:text-5xl font-bold">Vova Zakharov</h1>
          <p className="text-xl opacity-80">Developer – AI, full-stack, and the bits in-between</p>
          <p className="opacity-70">
            <a href="mailto:vzakharov@gmail.com" className="underline">
              vzakharov@gmail.com
            </a>
          </p>
        </header>

        {/* Profile Section */}
        <section className="space-y-4">
          <h2 className="text-3xl font-bold">Profile</h2>
          <Card>
            <p className="leading-relaxed">
              Developer with a physics-and-math brain, a poet’s love of abstraction, and a knack for building practical tools that turn AI buzz into actual features. I’ve built systems from scratch, simplified convoluted integrations, and turned vague ideas into working prototypes — across open-source, startups, and global advertising giants. I care about types, buttons, and the unspeakable elegance of just-enough abstraction.
            </p>
          </Card>
        </section>

        {/* Experience Section */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Experience</h2>

          <div className="space-y-6">
            <Card>
              <h3 className="text-2xl font-bold mb-2">Developer – Project Work</h3>
              <h4 className="text-xl font-bold mb-3 opacity-90">Orcool (June – August 2025)</h4>
              <p className="mb-3">
                Short-term project shaping an AI-agent–based review intelligence tool for brand marketing.
              </p>
              <p className="mb-3">Built the system end-to-end, covering:</p>
              <ul className="list-disc list-inside space-y-1 mb-3 ml-4">
                <li>Automated review collection from diverse public sources.</li>
                <li>AI-driven summarization with structured outputs (SWOT, competitive positioning, feature insights).</li>
                <li>Early productization steps toward a scalable SaaS-style platform.</li>
              </ul>
              <p className="text-sm font-mono opacity-60">
                Next.js/NestJS, Cloudflare Workers, Firebase, custom LLM orchestration framework
              </p>
            </Card>

            <Card>
              <h3 className="text-2xl font-bold mb-2">Developer</h3>
              <h4 className="text-xl font-bold mb-3 opacity-90">randddb.com / DDB (2023 – 2025)</h4>
              <p className="mb-3">
                Experimental AI platform at one of the world’s largest ad firms. Built, back to front, a suite of interlinked AI tools:
              </p>
              <ul className="list-disc list-inside space-y-1 mb-3 ml-4">
                <li><strong>Chatbot:</strong> ChatGPT-style assistant for corporate needs — secure, document-aware, image-savvy, with personas and real-time multi-user support.</li>
                <li><strong>Robowriter:</strong> Build-your-own-agent tool for content generation. Functions as both user-facing product and meta-backend for LLM ops.</li>
                <li><strong>Picmaker:</strong> Replicate-powered image generation/training tool with UX optimized for rapid iteration and intuitive pinning.</li>
                <li><strong>Client-specific apps:</strong> Including YesYouCannes, which builds Cannes award decks from idea to imagery in minutes.</li>
                <li><strong>Spaces:</strong> White-label mini-platforms for agency clients (e.g. randddb.com/s/ikea).</li>
              </ul>
              <p className="text-sm font-mono opacity-60 mb-2">Django + PostgreSQL backend, Vue + TypeScript frontend</p>
              <p className="text-sm italic opacity-70">Demo available on request.</p>
            </Card>

            <Card>
              <h3 className="text-2xl font-bold mb-2">Developer – Independent Projects</h3>
              <h4 className="text-xl font-bold mb-3 opacity-90">2020 – Present</h4>
              <p className="mb-3">Selected highlights:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Jukebox Web UI:</strong> Gradio-based UI running inside Google Colab for OpenAI’s music model.</li>
                <li><strong>almostmagic:</strong> Python package for instant LLM integration – one line, zero ceremony.</li>
                <li><strong>JobGenie:</strong> AI assistant for job seekers that helps create roles as much as apply for them.</li>
                <li><strong>Flows:</strong> A Django app for orchestrating async task pipelines with minimal ceremony.</li>
                <li><strong>Unfindables:</strong> An experiment in surfacing valuable but hidden web content via absurd search queries.</li>
              </ul>
            </Card>

            <Card>
              <h3 className="text-2xl font-bold mb-2">Prototyper – Experience & Innovation</h3>
              <h4 className="text-xl font-bold mb-3 opacity-90">Voicemod (2023)</h4>
              <p className="mb-3">Prototyped bleeding-edge tools for audio + AI experimentation.</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Built a YAML-powered Discord bot framework for zero-code bot creation.</li>
                <li>Developed a local Python web API with a ChatGPT-style interface.</li>
              </ul>
            </Card>
          </div>
        </section>

        {/* Education Section */}
        <section className="space-y-4">
          <h2 className="text-3xl font-bold">Education</h2>
          <Card>
            <h3 className="text-xl font-bold mb-2">Moscow Institute of Physics and Technology</h3>
            <p className="opacity-80">Master’s in Applied Math & Physics (2000 – 2006)</p>
          </Card>
        </section>

        {/* Footer */}
        <footer className="text-center opacity-60 text-sm pt-8 border-t border-foreground/20 print:hidden">
          <p>
            <Link href="/" className="underline hover:opacity-100">
              ← Back to main page
            </Link>
          </p>
        </footer>

        {/* Print-only footer */}
        <footer className="hidden print:block text-center text-sm pt-8 border-t border-foreground/20">
          <p>Full portfolio: vovazakharov.com</p>
        </footer>
      </div>
    </div>
  );
}
