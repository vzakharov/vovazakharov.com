import { firstMeadow } from '../../../src/pages/mushrooms/model/game';
import { containsPoint, placedAt, type Point } from '../../../src/pages/mushrooms/model/geometry';
import { mushroomGenes, type MushroomGenes } from '../../../src/pages/mushrooms/model/mushroom-genes';
import { domeBand, gillsOutline, stemOutline, toCanvas } from '../../../src/pages/mushrooms/model/mushroom-outline';
import { capFrame, splayed, stemAt } from '../../../src/pages/mushrooms/model/mushroom-pose';
import { mulberry32 } from '../../../src/pages/mushrooms/model/random';
import { meadowLayout } from '../../../src/pages/mushrooms/ui/scene/layout';

const VIEWPORTS = [['tabL',1180,820],['tabP',820,1180],['phoneP',390,844],['phoneL',844,390],['small',320,568],['desk',1920,1080]] as const;
const VISITS = Array.from({ length: 500 }, (_, i) => i * 7919 + 3);
const TS = Array.from({length:31},(_,i)=>0.05+i*0.025);
function halfAt(g: MushroomGenes, t: number) { const top = g.stemWidth/2, foot = top*g.footBulge; return foot + (top-foot)*t + top*0.12*Math.sin(Math.PI*t); }
for (const [name, w, h] of VIEWPORTS) {
  const layout = meadowLayout(w, h, 1);
  const bests: number[] = []; const okAt = TS.map(() => 0); let anyOk = 0; const widths: number[][] = TS.map(() => []);
  for (const seed of VISITS) {
    const ms = firstMeadow(mulberry32(seed)).mushrooms.map(({ slot, ...s }) => {
      const place = layout.mushrooms[slot]!; const { genes, turn } = splayed(mushroomGenes(s), place.splay);
      const c = toCanvas(place.size); const cap = capFrame(genes);
      const P = (o: readonly Point[]) => o.map((p) => placedAt(place, turn, c(p)));
      return { slot, place, genes, turn, drawn: [P(domeBand(genes,0).map(cap)), P(gillsOutline(genes).map(cap)), P(stemOutline(genes))] };
    });
    const back = ms.find((m) => m.slot === 0)!; const front = ms.find((m) => m.slot === 1)!;
    let any = false; let best = 0;
    TS.forEach((t, i) => {
      const st = stemAt(back.genes, t); const width = Math.min(back.genes.stemWidth*back.genes.footBulge*0.7, 2*halfAt(back.genes,t)*0.7);
      const height = width*1.45; const c = toCanvas(back.place.size);
      let seen = 0, n = 0;
      for (let a = -0.5; a <= 0.5; a += 0.1) for (let b = -0.5; b <= 0.5; b += 0.1) {
        const x = a*width, y = b*height; const cos = Math.cos(st.tilt), sin = Math.sin(st.tilt);
        const p = placedAt(back.place, back.turn, c({ x: st.x + x*cos + y*sin, y: st.y + y*cos - x*sin + (t===0? height/2+0.012:0) }));
        n++; if (!front.drawn.some((o) => containsPoint(o, p))) seen++;
      }
      widths[i]!.push(width*back.place.size);
      best = Math.max(best, seen/n); if (seen/n >= 0.8) { okAt[i]!++; any = true; }
    });
    if (any) anyOk++; bests.push(best);
  }
  const med = (a: number[]) => a.toSorted((x,y)=>x-y)[a.length>>1]!.toFixed(0);
  const q=bests.toSorted((a,b)=>a-b); console.log(name,'anyOk',anyOk/VISITS.length,'best q5/q25/q50',q[25]!.toFixed(2),q[125]!.toFixed(2),q[250]!.toFixed(2));
}
