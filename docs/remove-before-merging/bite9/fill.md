# Bite 9: how far a meadow grows toward six

Visits grown with `visit-play.ts`'s `opened(seed, w, h, true)` (the opening
pair, then one mushroom a grow, species in turn, until `roomFor` finds no
room), counting the mushrooms standing. Each cell: the share of visits that
reach six, then the counts of 2/3/4/5/6. The script is
`tmp/bite9/fill/fill.ts` (`node --import tsx fill.ts <screen> [from] [to]`).

| screen  | before (928ae99, 500 visits) | 1+2, 0.2 off flowers (0e58a9c) | 3, `clearOfFlowers` (3bb36c7) | kept: 0.2, 32 rounds (3a1ef9f) |
| ------- | ---------------------------- | ------------------------------ | ----------------------------- | ------------------------------ |
| tabL    | 25% 6/36/111/223/124         | 99.8% –/–/–/5/1995             | 0% 624/1202/165/9/0           | 100% –/–/–/–/2000              |
| tabP    | 25% 2/26/93/254/125          | 99.9% –/–/–/2/1998             | 1.1% 314/920/590/154/22       | 100% –/–/–/–/2000              |
| phoneP  | 25% 3/27/91/253/126          | 84% –/8/47/258/1687            | 0.5% 497/782/577/134/10       | 99.5% –/–/–/9/1991             |
| phoneL  | 25% 9/33/114/221/123         | 72% 1/29/141/390/1439          | 0% 803/796/375/26/0           | 99.6% –/–/–/8/1992             |
| phoneS  | 24% 2/29/91/257/121          | 27% 19/116/422/909/534         | 0% 873/784/304/39/0           | 69.3% –/1/37/576/1386          |
| desktop | 25% 4/34/91/245/126          | 99.8% –/–/–/5/1995             | 0% 627/1201/162/10/0          | 100% –/–/–/–/2000              |

Columns 2–5 are 2000 visits. "Before" judged a foot on all twelve screens
(six both ways); from 0e58a9c on, on the screen and its turn only.

## What binds

- **`clearOfFlowers`** (the rule a flower keeps off a mushroom's foot,
  turned round, over the whole `FORESHORTENING` span) blocks nearly the
  whole frame once seven flowers stand in it: it rejected 2436 feet against
  186 for every other rule together (phoneS, 50 visits). Judging it at this
  screen's and its turn's foreshortening only moved tabL to 8% six (50
  visits); it does not help phones, whose turn is the flattest camera there
  is. Not kept: the 0.2 foot distance is back (fd46120), `flowerFeet` wired.
- **Rounds, on phones.** Four rounds of 12 candidates ran out on the phones;
  rounds 8 → 16 → 32 → 64 took phoneS (200 visits) 43 → 56 → 67.5 → 73.5%
  six, phoneL 90 → 97.5% by 16. K 48 × 32 rounds reached 85.5% on phoneS at
  about 4× the cost; not taken, K being Mitchell's evenness.
- **A narrower forest makes it worse.** `FOREST_DRAWN` 0.6 took phoneS to
  22% and phoneL to 67% (200 visits, 4 rounds), 0.55 lower still: where
  the zoom floor binds (both phoneS orientations stand at the floor,
  127 px), `ZOOM_FLOOR` rises as the forest narrows, so drawn caps keep
  their px and the frame grows past the screen.
- **phoneS still stops short in 31% of visits**, on cover (`MOST_HIDDEN`)
  both ways, more on its turn (568 × 320, the shallowest band): it is
  floor-bound both ways. For the operator: accept five there, K 48, or a
  lower finger floor on the small phone.
