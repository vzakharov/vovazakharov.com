# The drowsy eye prototype, excerpted

The WebGL2 prototype behind https://claude.ai/artifact/9x6LAXhRYwo9c5yRFzxCXW
(version 8), excerpted for the builder: the code a port has to match. Swept with
`docs/plans/` at finalize.

## Phase order (GLSL, shared by scene and resolve)

`uFrame` is the frame counter; `uScatter` turns on the per-block random entry.
The scene pass draws low pixel `cell` at full pixel `cell*N + phaseOf(cell, N)`
(else `cell*N + uJitter` with the fixed per-frame offset from the order).

```glsl
  // Which pixel of an n×n block a frame draws: the same spread order as PHASES, each block
  // entering it at its own random step, so the blocks' ages scatter into noise rather than
  // line up into a woven pattern, while every pixel is still drawn once per n² frames.
  uniform int uFrame, uScatter;
  const int ORDER2[4] = int[4](0, 3, 1, 2);
  const int ORDER3[9] = int[9](0, 5, 7, 1, 6, 8, 2, 3, 4);
  const int ORDER4[16] = int[16](0, 10, 2, 8, 5, 15, 7, 13, 1, 11, 3, 9, 4, 14, 6, 12);
  ivec2 phaseOf(ivec2 block, int n){
    uint h = uint(block.x) * 0x8da6b343u ^ uint(block.y) * 0xd8163841u;
    h ^= h >> 15; h *= 0x2c1b3c6du; h ^= h >> 12;
    int k = (uFrame + int(h % uint(n*n))) % (n*n);
    int i = n == 2 ? ORDER2[k] : n == 3 ? ORDER3[k] : ORDER4[k];
    return ivec2(i % n, i / n);
  }`;

```

## Resolve (GLSL)

`uLow` is the low-res scene, its alpha the distance along the ray (`dec` decodes
it); `uHist` the previous history, alpha the per-pixel trust; `uP*` the previous
camera. `rayDir`, `uPos`, `uFwd/uRight/uUp`, `uTan`, `uRes` are the current
camera.

```glsl
  const RESOLVE = COMMON + `
  uniform sampler2D uLow, uHist;
  uniform ivec2 uJit; uniform int uN; uniform float uDrowsy, uHistOK, uFloatDepth;
  uniform vec3 uPPos, uPFwd, uPRight, uPUp;
  out vec4 o;
  float dec(float a){ return uFloatDepth > 0.5 ? a : (1.0/max(a,1e-4) - 1.0)/0.05; }
  vec2 prevUV(vec3 w, out bool ok){
    vec3 v = w - uPPos; float z = dot(v, uPFwd);
    ok = z > 0.0;
    float aspect = uRes.x/uRes.y;
    vec2 ndc = vec2(dot(v,uPRight)/(z*uTan*aspect), dot(v,uPUp)/(z*uTan));
    return ndc*0.5+0.5;
  }
  void main(){
    ivec2 p = ivec2(gl_FragCoord.xy);
    ivec2 lowSize = textureSize(uLow, 0);
    ivec2 block = p / uN;
    bool scatter = uScatter > 0;
    ivec2 lp = scatter ? min(block, lowSize-1) : clamp((p - uJit) / uN, ivec2(0), lowSize-1);
    vec4 near = texelFetch(uLow, lp, 0);
    bool fresh = scatter ? p - block*uN == phaseOf(block, uN) : p.x % uN == uJit.x && p.y % uN == uJit.y;
    // Scattered samples sit anywhere in their block, so the upsample reads them as if centred.
    vec2 lowUV = scatter ? ((vec2(p) - float(uN-1)*0.5) / float(uN) + 0.5) / vec2(lowSize)
                         : (vec2(p - uJit) / float(uN) + 0.5) / vec2(lowSize);
    vec3 mn = vec3(1e9), mx = vec3(-1e9);
    for(int j=-1;j<=1;j++) for(int i=-1;i<=1;i++){
      vec3 c = texelFetch(uLow, clamp(lp+ivec2(i,j), ivec2(0), lowSize-1), 0).rgb;
      mn = min(mn,c); mx = max(mx,c);
    }
    vec2 cur = (vec2(p)+0.5)/uRes;
    vec3 w = uPos + rayDir(vec2(p)+0.5) * dec(near.a);
    bool front; vec2 prv = prevUV(w, front);
    vec2 motion = front ? cur - prv : vec2(0.0);
    motion *= min(1.0, 0.25 / max(length(motion), 1e-6));
    // Where the history has nothing (the strip a turn brings in), the current quarter
    // stands in, smeared along the motion like the rest of the frame.
    vec3 fb = vec3(0.0);
    for(int k=0;k<4;k++){ float s = (float(k)/3.0 - 0.5) * (0.35 + uDrowsy * 1.6); fb += texture(uLow, lowUV + motion*s).rgb; }
    fb *= 0.25;
    // Trust in the history: what the pixel's alpha carries (zero until it has had a fresh
    // sample of its own since it came into view), faded out towards the old frame's edge so
    // the strip has no seam. The fade runs only from the edge the motion crossed, and is as
    // wide as three frames of that motion, so a still view keeps its borders sharp.
    bool inside = all(greaterThanEqual(prv, vec2(0.0))) && all(lessThanEqual(prv, vec2(1.0)));
    vec2 crossed = vec2(motion.x > 0.0 ? prv.x : 1.0 - prv.x, motion.y > 0.0 ? prv.y : 1.0 - prv.y);
    vec2 width = max(abs(motion) * 3.0, vec2(1e-4));
    vec2 fade = smoothstep(vec2(0.0), width, crossed);
    float trust = (front && inside && uHistOK > 0.5) ? fade.x * fade.y : 0.0;
    vec3 h = fb;
    if(trust > 0.0){
      vec2 at = prv + motion * 0.55 * uDrowsy;            // lag: the old picture trails the turn
      vec3 acc = vec3(0.0); float conf = 0.0;
      for(int k=0;k<4;k++){ float s = (float(k)/3.0 - 0.5) * uDrowsy * 1.6; vec4 t = texture(uHist, at + motion*s); acc += t.rgb; conf += t.a; }
      vec3 hist = acc * 0.25;
      // History that the fresh neighbourhood disowns (moving water) melts into the smeared
      // current view instead of dithering; history that agrees keeps its sharpness.
      float off = length(hist - clamp(hist, mn, mx));
      hist = mix(hist, fb, smoothstep(0.0, 0.08, off) * uDrowsy);
      hist = mix(clamp(hist, mn, mx), hist, uDrowsy);     // 0 = TAA clamp, 1 = free smear
      trust *= conf * 0.25;
      h = mix(fb, hist, trust);
    }
    vec3 c = fresh ? mix(near.rgb, h, 0.55*uDrowsy*trust + 0.5*(1.0-trust)) : h;
    o = vec4(c, fresh ? 1.0 : trust);
  }`;

```

## Vignette (in the final blit)

```glsl
float r = length(uv-0.5)*1.25;
c *= 1.0 - uVig*smoothstep(0.35, 1.0, r);   // uVig = 0.35 * drowsiness in the prototype
```

## Slowdown

Every pass drawn `floor(k)` times, then once more scissored to the fraction. In
WebGL the repeats needed blending at constant alpha 1, because a tiled GPU
(Apple) skips overdraw it can prove hidden; in WebGPU, separate render passes
with `loadOp: clear` serve the same end.
