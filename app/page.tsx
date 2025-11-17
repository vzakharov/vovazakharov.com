import Image from "next/image";
import { ProjectCard, ArticleCard, Card } from "@/components/card";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20">
      <div className="max-w-4xl mx-auto space-y-16">
        {/* Header with theme toggle */}
        <div className="flex justify-end">
          <ThemeToggle />
        </div>

        {/* Hero Section */}
        <section className="space-y-6 text-center">
          <Image
            src="/ava.png"
            alt="Vova Zakharov"
            width={150}
            height={150}
            className="rounded-full mx-auto"
            priority
          />
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-3">Vova Zakharov</h1>
            <p className="text-xl sm:text-2xl opacity-80">
              Developer, AI tinkerer, word shaker, generative metalhead
            </p>
            <p className="mt-4 opacity-70">
              Helping our future overlords walk since 2019
            </p>
          </div>
        </section>

        {/* Navigation Links */}
        <nav className="flex justify-center gap-6 text-lg">
          <span>
          <a href="#dev" className="hover:underline">dev</a>
            &nbsp;(<a href="/cv" className="hover:underline" target="_blank">cv</a>)
          </span>
          <a href="#music" className="hover:underline">music</a>
          <a href="#writing" className="hover:underline">writing</a>
          <a href="#contact" className="hover:underline">contact</a>
        </nav>

        {/* Dev Section */}
        <section id="dev" className="space-y-6">
          <h2 className="text-3xl font-bold">/dev</h2>

          <div className="prose prose-invert max-w-none">
            <p className="text-lg leading-relaxed">
              Been coding since 1990 (QBasic → Pascal → C++ → C# → Ruby → TypeScript/Python).
              Physics and math background from Moscow Institute of Physics and Technology.
              Turned my 38-year hobbyist passion into profession three years ago. Messing with
              LLMs ever since GPT-3, accumulated a lot of knowledge on how they work and think.
            </p>
          </div>

          <h3 className="text-2xl font-bold mt-8">Featured Projects</h3>

          <div className="grid gap-4 md:grid-cols-2">
            <ProjectCard
              title="jukebox-webui"
              stars={84}
              description="Google Colab-backed Web UI for OpenAI's Jukebox music generation model. Democratized access to computationally expensive AI music generation with Gradio interface."
              techStack="Python, Gradio, Google Colab"
              url="https://github.com/vzakharov/jukebox-webui"
            />

            <ProjectCard
              title="almostmagic"
              stars={65}
              description="Add AI to your app with one line of code. Lightweight TypeScript wrapper that abstracts prompt engineering complexity with single-function API."
              techStack="TypeScript, OpenAI API"
              url="https://github.com/vzakharov/almostmagic"
            />

            <ProjectCard
              title="write"
              description="One of the first text processors with fully configurable LLM provider integration. Way ahead of its time, even if I was the only one using it."
              techStack="Vue, TypeScript"
              url="https://github.com/vzakharov/write"
            />

            <ProjectCard
              title="mindy"
              description="Group AI chatbot. ChatGPT before ChatGPT."
              techStack="Nuxt.js, Vue.js, Vuex"
              url="https://github.com/vzakharov/mindy"
            />

            <ProjectCard
              title="ollum"
              description="Evolution-inspired LLM framework where models act as both creators AND critics. Seeding → Elo-style evaluation → mutation → crossover for iterative content evolution."
              techStack="Python, async-first"
              url="https://github.com/vzakharov/ollum"
            />

            <ProjectCard
              title="sympathico"
              description="Experimental neural networks without traditional weight matrices or backpropagation. Networks as 'colonies of symbolic paths' using evolutionary principles."
              techStack="Python"
              url="https://github.com/vzakharov/sympathico"
            />

            <ProjectCard
              title="komple"
              stars={13}
              description="AI autocomplete for any website. Press Ctrl+Space for suggestions in any text field. Chrome extension with multiple API endpoint support."
              techStack="JavaScript, Vue.js, BPE encoder"
              url="https://github.com/vzakharov/komple"
            />

            <ProjectCard
              title="ideality-nuxt"
              description="AI ideation platform allowing creation of no-code widgets for one-click AI generations (copy, ideas, etc.) embeddable on any website. Configurable by users."
              techStack="Nuxt.js, Vue.js, Bubble backend"
              url="https://github.com/vzakharov/ideality-nuxt"
            />

            <ProjectCard
              title="suno-power-tools"
              description="Collection of in-browser-console tools for Suno. Includes tree-structure display for visualizing clip relationships, extensions, and inpaintings."
              techStack="HTML, JavaScript"
              url="https://github.com/vzakharov/suno-power-tools"
            />
          </div>

          <h3 className="text-2xl font-bold mt-8">Professional Work</h3>

          <div className="space-y-4">
            <Card>
              <h4 className="text-xl font-bold mb-2">DDB / randddb.com (2023-2025)</h4>
              <p className="mb-3">
                Experimental AI platform at one of the world’s largest ad firms. Built enterprise-scale suite:
              </p>
              <ul className="list-disc list-inside space-y-1 mb-3">
                <li><strong>Chatbot:</strong> ChatGPT-style corporate assistant with documents, images, personas, multi-user support</li>
                <li><strong>Robowriter:</strong> Build-your-own-agent content generation tool</li>
                <li><strong>Picmaker:</strong> Replicate-powered image generation/training</li>
                <li><strong>YesYouCannes:</strong> Cannes award deck generator (idea → imagery in minutes)</li>
                <li><strong>Spaces:</strong> White-label mini-platforms for agency clients</li>
              </ul>
              <p className="text-sm font-mono opacity-60">Django + PostgreSQL, Vue + TypeScript</p>
            </Card>

            <Card>
              <h4 className="text-xl font-bold mb-2">Orcool (June-August 2025)</h4>
              <p className="mb-3">
                AI-agent-based review intelligence tool for brand marketing. Built end-to-end: automated
                review collection → AI summarization (SWOT, competitive positioning) → SaaS platform.
              </p>
              <p className="text-sm font-mono opacity-60">Next.js/NestJS, Cloudflare Workers, Firebase</p>
            </Card>

            <Card>
              <h4 className="text-xl font-bold mb-2">Voicemod (2023)</h4>
              <p className="mb-3">
                Prototyper for Experience & Innovation. Built YAML-powered Discord bot framework for
                zero-code bot creation and local Python web API with ChatGPT interface.
              </p>
              <p className="text-sm font-mono opacity-60">Python, YAML, Discord API</p>
            </Card>
          </div>

          <div className="mt-8">
            <a
              href="/cv"
              target="_blank"
              className="inline-block border border-foreground/40 px-6 py-3 hover:bg-foreground hover:text-background transition-colors"
            >
              View Full CV
            </a>
          </div>
        </section>

        {/* Music Section */}
        <section id="music" className="space-y-6">
          <h2 className="text-3xl font-bold">/music</h2>

          <div className="prose prose-invert max-w-none">
            <p className="text-lg leading-relaxed italic mb-4">
              “AI as collaborator, not tool or replacement”
            </p>
            <p className="text-lg leading-relaxed">
              Been writing music since preteens, recently focused on AI music (since way before Suno —
              think OpenAI Jukebox). I view AI not as a replacement for my creativity, neither as a tool,
              but as a brilliant musician who can bring my ideas to life in ways I often wouldn’t have imagined.
              To be clear, I write most of my AI music starting from my own humming/piano playing/MIDIs,
              so it’s “mine” in most copyright senses.
            </p>
          </div>

          <h3 className="text-2xl font-bold mt-8">Active Projects</h3>

          <div className="space-y-6">
            <Card>
              <h4 className="text-xl font-bold mb-3">GENERATED</h4>
              <iframe
                style={{borderRadius: '12px'}}
                src="https://open.spotify.com/embed/artist/3tnTz9WCaghp3PJPSsTxQW?utm_source=generator"
                width="100%"
                height="152"
                frameBorder="0"
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
              />
            </Card>

            <Card>
              <h4 className="text-xl font-bold mb-3">Полуживые (ru. for “Half-Alive”)</h4>
              <iframe
                style={{borderRadius: '12px'}}
                src="https://open.spotify.com/embed/artist/2rdnjZV6ahlz4pKeh9a8B3?utm_source=generator"
                width="100%"
                height="152"
                frameBorder="0"
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
              />
            </Card>

            <Card>
              <h4 className="text-xl font-bold mb-3">Downtemple</h4>
              <iframe
                style={{borderRadius: '12px'}}
                src="https://open.spotify.com/embed/artist/2vN8JKg3rQLxleZ9xsafy6?utm_source=generator"
                width="100%"
                height="152"
                frameBorder="0"
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
              />
            </Card>
          </div>

          <div className="space-y-2 text-sm opacity-70">
            <p>Also on <a href="https://soundcloud.com/vzkrv" target="_blank" rel="noopener noreferrer" className="underline">SoundCloud</a> and <a href="https://suno.com/@vova" target="_blank" rel="noopener noreferrer" className="underline">Suno</a></p>
            <p>All my music is open-source: <a href="https://vzakharov.github.io/vovas-music" target="_blank" rel="noopener noreferrer" className="underline">vzakharov.github.io/vovas-music</a></p>
          </div>
        </section>

        {/* Writing Section */}
        <section id="writing" className="space-y-6">
          <h2 className="text-3xl font-bold">/writing</h2>

          <div className="prose prose-invert max-w-none">
            <p className="text-lg leading-relaxed">
              Before I became a full-time coder, I worked for 22 years as a translator, editor, and copywriter.
              Although I don’t do it much anymore, I still find joy in stretching the writing muscles, especially
              with my AI co-conspirator, “synthetic buddy” Finn O’Connor, under the brand of{' '}
              <a href="https://glitchporn.substack.com" target="_blank" rel="noopener noreferrer" className="underline">
                Glitchporn
              </a>.
            </p>
            <p className="text-xl italic mt-4 opacity-80">
              “Caressing the cracks in reality until something breaks”
            </p>
          </div>

          <h3 className="text-2xl font-bold mt-8">Featured Articles</h3>

          <div className="grid gap-4 md:grid-cols-2">
            <ArticleCard
              title="Hard Times, Strong Men, and Other Convenient Memes"
              description="Systematic dismantling of the civilizational cycle meme with historical counterexamples and a warning against uncritical support for authoritarian rhetoric."
              url="https://glitchporn.substack.com/p/hard-times-strong-men"
            />

            <ArticleCard
              title="The Illusion of Thinking Different™"
              description="Critique of Apple's research paper on Large Reasoning Models — linguistic sleight-of-hand, strawman arguments, and buried data showing what they claimed to disprove."
              url="https://glitchporn.substack.com/p/the-illusion-of-thinking-different"
            />

            <ArticleCard
              title="The Post-Vacation Slump Survival Guide"
              description="Compassionate take on motivation crashes after coding breaks. Practical advice on dopamine habit loops, cognitive inertia, and joy-driven productivity."
              url="https://glitchporn.substack.com/p/post-vacation-slump-survival-guide"
            />
          </div>

          <div className="mt-8">
            <a
              href="https://glitchporn.substack.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block border border-foreground/40 px-6 py-3 hover:bg-foreground hover:text-background transition-colors"
            >
              Read More on Glitchporn
            </a>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="space-y-6">
          <h2 className="text-3xl font-bold">/contact</h2>

          <Card>
            <div className="space-y-3">
              <p>
                <strong>Email:</strong>{' '}
                <a href="mailto:vzakharov@gmail.com" className="underline">
                  vzakharov@gmail.com
                </a>
              </p>
              <p>
                <strong>GitHub:</strong>{' '}
                <a href="https://github.com/vzakharov" target="_blank" rel="noopener noreferrer" className="underline">
                  github.com/vzakharov
                </a>
              </p>
              <p>
                <strong>LinkedIn:</strong>{' '}
                <a href="https://linkedin.com/in/vovahimself" target="_blank" rel="noopener noreferrer" className="underline">
                  linkedin.com/in/vovahimself
                </a>
              </p>
              <p>
                <strong>X/Twitter:</strong>{' '}
                <a href="https://x.com/vovahimself" target="_blank" rel="noopener noreferrer" className="underline">
                  x.com/vovahimself
                </a>
              </p>
              <p>
                <strong>Substack:</strong>{' '}
                <a href="https://substack.com/@vovahimself" target="_blank" rel="noopener noreferrer" className="underline">
                  substack.com/@vovahimself
                </a>
              </p>
            </div>
          </Card>
        </section>

        {/* Footer */}
        <footer className="text-center opacity-60 text-sm pt-8 border-t border-foreground/20">
          <p>© {new Date().getFullYear()} Vova Zakharov. Built with Next.js.</p>
        </footer>
      </div>
    </div>
  );
}
