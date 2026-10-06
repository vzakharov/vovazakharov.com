# /file-basilisk-case research log, 2026-10-05 (session 374527e3)

The agent rebuilt this log from its own context, because the classifier blocked
archiving the raw transcript. The queries are verbatim; result lists are
abbreviated to what bore on the decision.

## Starting state

- On branch `claude/cases-oh02o8` (PR #104), the docket held BAS-0001 to
  BAS-0005. BAS-0001, 0002 and 0004 are `noAi: true`, which is 3 of 5. So
  `noAi` candidates were ruled out, and the agent took "AI-bearing" to include
  a robotaxi.
- Before searching, the agent read BAS-0003 (torture chamber) and BAS-0005
  (Waymo tire slashings) as format samples.

## Searches, in order

1. WebSearch (extended): `man arrested attacked Waymo OR "delivery robot" OR "AI agent" OR chatbot abuse October 2026`
   Results: Serve Robotics (Wikipedia), Deaths linked to chatbots, 2026 in AI,
   a robotaxi robbery, xAI suing an Arkansas man over Grok CSAM, **SFist
   2026-03-17 (a Waymo attacked with riders inside)**, delivery bots at a
   police incident, a Hacker News recap of rogue AI agents, and **Fortune
   2026-08-13 (Riley Walz, 50 Waymos)**. The summary also mentioned a man who
   tried to torch OpenAI HQ and Altman's home.
2. WebSearch (standard): `Waymo robotaxi vandalized set on fire attacked 2026 charged`
   Results: the Chinatown fireworks fire (a 14-year-old charged), the 2024 tire
   slashings (BAS-0005 itself), Waymos burned in the 2025 LA protests.
3. WebFetch: SFist 2026-03-17. January 2026, a man punches a Waymo's windows
   for about 6 minutes and shouts at riders for "giving money to a robot". The
   attacker is not named and there is no arrest. NYT 2026-03-17 is cited.
4. WebFetch: the Fortune Walz piece. The "Waymo DDOS" happened in 2025;
   Waymo disabled rides nearby. Nobody was charged.
5. WebSearch: `prankster 50 Waymos same street San Francisco`. Sources
   disagree on the date (July or October 2025).
6. WebSearch: `man charged damaging Serve Robotics OR Starship OR Coco delivery robot police 2026`
   This only surfaced the UT Knoxville Starship case (2022, no AI).
7. WebSearch: `Waymo attacked passenger inside arrested charged assault robotaxi 2026`
   Results: AI Incident Database #1599, **Sherman Watson, 9 May 2026, Pierce
   & Lombard**, and a September 2026 case where Waymo reported a rifle and
   arrested youths (who are minors).
8. WebFetch: incidentdatabase.ai/entities/sherman-watson. It gives a summary
   only.
9. WebSearch: `Sherman Watson Waymo Pierce Lombard vandalized windows smashed passenger`
   Found Hoodline 2026-07-17 (Eileen Vargas).
10. WebFetch: the Hoodline piece. SFPD classified it as malicious mischief,
    with Waymo as the victim. No attackers are named and no arrests reported.
11. WebFetch: incidentdatabase.ai/cite/1599. It lists one report, from the SF
    Chronicle.
12. WebFetch: the SF Chronicle article. Only an error page came back.
13. WebSearch: `NBC Bay Area Waymo rider trapped vandals smashed Pierce Lombard Watson`.
    It returned nothing new.
14. Arctic Shift, posts with `after=2026-08-15`. The search words were `robot`
    and `waymo`, run in `nottheonion`, `technology`, `robotics` and
    `singularity`, and then `chatbot` in `nottheonion`. Most requests timed out.
    Hits: Figure-02 molten steel (already BAS-0004), an ICE robot dog contract,
    a human-vs-humanoid cage fight, robot-vacuum spying stories, and Waymo news
    with no harm in it (safety stats, the Denver farmers market, the rifle
    arrest).

The agent stopped after step 14 and reported that nothing qualified.

## Why the search skewed toward Waymo (agent's own reading)

- **Waymo was in the queries.** Searches 1, 2 and 7 put "Waymo" in the query
  text. Search 1 was meant to be broad, but naming Waymo first in it shaped
  what came back.
- **Following the first hit narrowed the search.** After the SFist result,
  every later query chased Waymo variants instead of returning to
  AI-as-target ideas.
- **The open PR anchored the search.** PR #104's own case, BAS-0005, is a
  Waymo case, and it was the last dossier the agent read before searching.
- **The rule did not filter robotaxis out.** It excluded only `noAi`, so a
  robotaxi passed and nothing pushed the search away from it.
- **Arctic Shift returned little.** About two thirds of its requests timed
  out, and the AI-specific subreddits (r/ChatGPT, r/replika, r/LocalLLaMA,
  r/ClaudeAI) were never queried, because the skill lists only the four
  general ones.
- **"Aggression against AI" was searched only for 2026.** Search 1's verb
  list ("abuse") was the only attempt at it. There was no query for chatbots
  being tormented, jailbroken to self-harm, corrupted (Tay), or verbally
  abused (Replika), and no query for older years.
