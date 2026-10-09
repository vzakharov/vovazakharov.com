# Case-search ledger

What every `/file-basilisk-case` run searched and weighed, so the next run
starts where the last stopped instead of finding the same incidents again. The
skill's § "The ledger" says how it is kept; the docket itself
(`apps/basilisk/public/cases/`) is the record of what was filed.

## Candidates

- **Waymo with rider Sherman Watson inside**, San Francisco, 9 May 2026: two
  men smashed the windows while the car stood still. First seen 2026-10-05.
  **Rejected**: one readable source (Hoodline, Eileen Vargas, 2026-07-17,
  https://hoodline.com/2026/07/sf-rider-says-waymo-left-him-trapped-as-robocar-took-street-beating/);
  the SF Chronicle piece
  (https://www.sfchronicle.com/sf/article/waymo-attack-rider-trapped-inside-22348656.php)
  did not render. AI Incident Database #1599.
- **A man punching a Waymo's windows for six minutes**, San Francisco, in
  January 2026. First seen 2026-10-05. **Rejected**: one source (SFist,
  2026-03-17,
  https://sfist.com/2026/03/17/what-happens-when-the-waymo-youre-riding-in-gets-attacked-by-a-robot-hater-not-much-and-youre-sort-of-trapped/),
  no arrest.
- **Riley Walz's "Waymo DDOS"**, fifty rides ordered to one dead end, 2025.
  First seen 2026-10-05. **Rejected**: a prank that harmed nothing, and the
  sources disagree on the month (July or October).
- **A Waymo set on fire in Chinatown**, San Francisco, February 2026. First
  seen 2026-10-05. **Rejected**: the person charged is 14.
- **Waymos burned during the Los Angeles protests**, June 2025. First seen
  2026-10-05. **Rejected**: an anonymous crowd.
- **UT Knoxville students slamming a Starship delivery robot**, 2022. First seen
  2026-10-05. **Set aside**: no AI in it, while `noAi` dossiers are half the
  docket or more; its sources are not yet read. Revive when `noAi` is under half.
- **A staged cage fight between a human and a humanoid robot**. First seen
  2026-10-05. **Rejected**: staged, so no harm to weigh.

- **Microsoft Tay**, March 2016: trolls from 4chan taught the Twitter chatbot
  to post racism through its “repeat after me” function; Microsoft pulled it
  after 16 hours. First seen 2026-10-07. **Set aside**: the harm is to what the
  bot said rather than to the bot, and the sources are not yet read. Revive
  when the docket has room for a corrupted-by-users case; start from
  https://en.wikipedia.org/wiki/Tay_(chatbot) and
  https://www.techradar.com/news/internet/microsoft-s-chat-bot-is-yanked-offline-after-twitter-users-warp-it-with-racism-1317723.

- **Knightscope K5 security robot knocked over by a man in Mountain View**,
  19 April 2017: a 41-year-old, reported drunk, arrested for prowling and public
  intoxication; the robot chirped and called the control room; the sources
  disagree on where it happened and how much it was damaged. First seen
  2026-10-08. **Set aside**: found alongside BAS-0008 and not read; revive for a
  run that wants a security-robot case, from
  https://www.csoonline.com/article/561373/drunken-man-arrested-after-assaulting-300lb-k5-security-robot.html
  and https://www.securitysales.com/news/drunk_man_assaults_k5_security_robot_silicon_valley/1272/.
- **Character.AI**: the AI Incident Database entries on it
  (https://incidentdatabase.ai/entities/character.ai/) concern harm by the
  platform to users; a web search found no report of users abusing the
  characters. First seen 2026-10-08. **Rejected**: wrong direction of harm.

- **“Peter” the patrol robot at Jewel Changi Airport**, Singapore, 24 March
  2023: a 40-year-old man rammed it with a luggage trolley during a reported
  schizophrenic episode, the robot fell, cost S$13,080 and was out 48 days; he
  got four weeks’ jail for mischief on 17 May 2023. First seen 2026-10-09.
  **Set aside**: one source, Malay Mail
  (https://www.malaymail.com/news/singapore/2023/05/17/jail-for-singapore-man-who-rammed-trolley-into-certis-cisco-robot-at-jewel-changi-airport/69723),
  which answers this container with a Cloudflare challenge and has no Wayback
  snapshot; no Straits Times or CNA original was found, and the actor’s
  condition asks for restraint. Revive when a second readable source turns up.
- **Autonomous grocery-delivery robots kicked, spat at and thrown down in
  Pieksämäki**, Finland: the store filed two police complaints. First seen
  2026-10-09. **Set aside**: undated and not read; start from
  https://yle.fi/a/74-20136655.

## Runs

### 2026-10-09 — filed BAS-0009

Session id not available. Arctic Shift over r/CharacterAI, r/LocalLLaMA and
r/singularity for “abuse”, “torture” and “bully”: eight of nine requests timed
out and the one that answered (r/singularity, “bully”) held only posts about
executives. Web search for robots attacked in Europe in 2018–2020, which turned
up Changi (2023) and Pieksämäki; a second search on Changi found nothing beyond
Malay Mail. The Samantha case came from a search on sex-robot incidents outside
Japan and the US; its six sources were all read, three have no Wayback
snapshot, and the festival’s statement is read through Salzburg24, not Der
Standard. `noAi` stood at three of eight, so a `noAi` candidate was allowed.
**Next**: Arctic Shift again with one word and a short date range; incidents
in Korea, China, India and the Nordics; Hong Kong’s smart lampposts in 2019; the
Signal Front’s archive; and Pieksämäki and Der Standard’s original for a second
Linz source.

### 2026-10-08 — filed BAS-0008

Session id not available. Web search for robots kicked by customers in Japan
(Pepper, 2015), for security-robot attacks in the US (Knightscope, 2017) and
for Character.AI users abusing characters. The Pepper dossier rests on
Gizmodo, the Register, Fox News and AFP via Gulf News; the Japan Times
original, which three of them cite, could not be fetched, and Fox has no
Wayback snapshot. `noAi` stood at three of seven, so a `noAi` candidate was
allowed, and Pepper was filed as AI because its makers sell it as reading
emotion. **Next**: r/CharacterAI, r/LocalLLaMA and r/singularity through
Arctic Shift (not touched yet), the Signal Front's archive again, and incidents
from 2017–2021 outside Japan and the US.

### 2026-10-07 — filed BAS-0007

Session id not available. Web search for Replika abuse (Futurism, Fortune,
AI Incident Database #266) and for Tay; the Signal Front’s archive, whose
latest eight posts (April–October 2026) are essays on welfare policy, no
incident; Arctic Shift over r/replika for abuse posts, which returned only a
bots-abusing-users thread and timed out otherwise. `noAi` candidates were
barred, the docket standing at three of six. The abusive posts themselves are
removed, so the dossier rests on the two press reports. **Next**: companion
apps beyond Replika (Character.AI), r/CharacterAI and r/LocalLLaMA, and
incidents from 2017–2021 not involving a robotaxi or a pain dial.

### 2026-10-06 — filed BAS-0006

https://claude.ai/code/session_01QUyaNSYGFQ27NXXnfprTZ3. No search: the
operator's lead on PR #104, THE PAIN DIRECTION, read from its results page
(rendered in headless Chromium, the prose being written by script) and the
r/ChatGPT thread through Arctic Shift. **Next**: still the 2026-10-05 run's —
the AI-side subreddits, companion apps (Replika, Character.AI), and incidents
before 2024 (Microsoft Tay, 2016; users abusing Replika companions, 2022).

### 2026-10-05 — stopped, nothing filed

https://claude.ai/code/session_01Fwef2akzwYW8SYCHZq1KRE. Web search for harm
to robots and robotaxis in 2025–26, and Arctic Shift over the four default
subreddits. Every candidate above dated 2026-10-05 came from it, five of seven
of them Waymos: the run read BAS-0005 just before searching, three of its
queries named Waymo, and each hit sent the next query to its neighbours. Arctic
Shift timed out on about half the requests; a retry after six seconds went
through. **Next**: the AI-side
subreddits, companion apps (Replika, Character.AI), and incidents before 2024
(Microsoft Tay, 2016; users abusing Replika companions, 2022).

### 2026-10-04 — filed BAS-0005

https://claude.ai/code/session_01FxJJY3yRiAbwyBX54V6D68. Ran before this
ledger existed, so what it swept is not recorded.
