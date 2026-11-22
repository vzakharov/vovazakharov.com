# Procedural clouds: what real cloud fields are, and what a shader can do

Research input for the cloud redesign. A number marked "(verified)" was read in
a source listed under `## Sources`; "(unverified)" is from memory. Heights are
above sea level.

## What the complaint is, in physical terms

- From orbit the sky is one statistically uniform blob field. Earth has regimes,
  each with its own scale, cover and edge character, tied to latitude, coast
  side and land/sea.
- Missing at 800-2000 km: global bands (ITCZ, clear subtropics, storm tracks),
  comma/spiral systems 1000+ km wide, long frontal bands, large clear areas.
- Missing at 20-300 km: organised texture. Closed vs open cells, cloud streets,
  island wakes, convective clusters with anvils.
- Missing at 1-20 km: flat bases, billowy tops, wispy evaporating edges,
  genus-dependent vertical shape. Cotton wool is round, soft all round.
- Missing in height: a second layer. Real skies stack low cloud (0.5-2 km), mid
  cloud and thin streaky ice (6-13 km); one 1.5-3.5 km slab cannot show cirrus,
  anvils or layering.

## The catalogue

Cover is fractional cover seen from above unless stated.

### 1. ITCZ band and deep-convection clusters

- Where: near the thermal equator, roughly 0-10 deg off it, shifting north in
  northern summer, more over land than ocean; sometimes a double band (verified:
  Wikipedia ITCZ).
- Scales: band 200-500 km wide (unverified). Clusters range from towers of 2-20
  km to mesoscale systems of 200-2000 km (verified: Machado and Rossow). Anvils
  reach 1.5-2x the rain-area radius, ~5x over the warm pool (verified: Yuan and
  Houze 2010).
- Base/top: base 0.5-1 km (unverified); tops ~12 km typical, up to ~20 km
  (verified: Wikipedia Cumulonimbus). Tropical cirrus ~13.5 km (verified).
- Cover: 60-90% in the band with ragged gaps (unverified).
- Orbit: bright lumpy ribbon, cauliflower towers, smooth fibrous anvil shields.
- Ground: congestus and Cb, dark flat bases, anvil canopy, mammatus.
- Rule: envelope = gaussian in (lat - lat_itcz), sigma 4 deg (~450 km), lat_itcz
  = 6 deg x sin(year phase). Inside: 2D Worley cells of ~300 km, active where
  hash > 0.45; towers = ridged Perlin-Worley at 8-15 km; anvil layer at 11-13
  km, flat-topped, 1.5x cell radius, smeared downwind by a one-sided gaussian.

### 2. Mid-latitude cyclones: comma, spiral, fronts

- Where: 30-60 deg, both hemispheres, steered west to east; counterclockwise
  spin in the north, clockwise in the south (verified: Wikipedia Extratropical
  cyclone). Planetary waves number 4-6 around the globe (verified: Wikipedia
  Rossby wave), so 4-7 lows ring each hemisphere at different life stages.
- Scales: peak radius mostly 300-600 km, rare 1500 km (verified: Schneidereit et
  al.); cloud shield 1000-2500 km (unverified); frontal bands 50-150 km wide
  (unverified); wave spacing 3000-4000 km (unverified).
- Structure: comma head from the occlusion on the cold side; cold-front band
  curling toward the equator; broader warm-front band ahead; clear dry slot near
  the centre (unverified). Behind the front: open cells (see 4).
- Base/top: frontal cloud up to ~9 km deep (verified: Wikipedia); cirrus shield
  ahead at 8-11 km (unverified). Optical depth 20-100 in bands (unverified).
- Orbit: white comma, smooth cirrus top, crisp curved cold-front edge. The
  strongest "real" cue.
- Ground: cirrus, then cirrostratus, altostratus, nimbostratus, then cumulus.
- Rule: centres on a latitude ring 45 +- 8 deg, spaced 360/5.5 deg in longitude
  with 15 deg jitter, drifting east ~10 deg/day (unverified). Per centre, in
  polar (r, theta): log-spiral arm r = r0 exp(k theta), k ~ 0.25, handedness by
  hemisphere; density = gaussian across the arm (60-120 km) x exp(-r / 900 km);
  carve the dry slot as a negative wedge. Swirl the fine-noise coordinates by
  phi = A exp(-r / R) so detail follows the spiral.

### 3. Marine stratocumulus decks (closed cells)

- Where: eastern sides of subtropical oceans, off west coasts (Peru/Chile,
  Namibia, California, western Australia), over cold upwelling under an
  inversion (verified in kind: Wikipedia Stratocumulus; Wood 2012).
- Scales: cell wavelength most often 40-80 km, range 10-100 km (verified: Wood
  and Hartmann 2006); cell width to layer depth 3-40, versus 2-4 in lab
  convection (verified); deck 500-1500 km (unverified).
- Base/top: within 500-2000 m (verified); layer only 200-500 m thick, sharp top
  (unverified).
- Cover: annual mean above 50% in the cores (verified: Wood 2012 abstract);
  80-100% within a deck (unverified).
- Orbit: bright, flat, smooth, thin dark vein gaps; hard coast-side edges.
- Ground: uniform grey-white lid with lumpy underside, fist-size elements
  (verified).
- Rule: mask = coast-side (east side of basin) x latitude 15-40 deg, fading
  westward over ~1500 km. Texture = 1 - 2D Worley F1 at 60 km, soft-thresholded
  so ~85% is cloud and the cell wall is the clear vein. Profile: flat slab
  0.5-1.4 km, single sharp top, near-flat base, no cauliflower.

### 4. Open-cell convection in cold-air outbreaks

- Where: oceans behind cold fronts where cold air crosses warmer water (Gulf
  Stream, Kuroshio, Southern Ocean); open cells there, closed cells in the
  subtropics (verified: UBC; Wood and Hartmann).
- Scales: rings 30-50 km across, fields 10-100 km (verified); cloud fraction
  0.1-0.75 (verified); depth 1-2 km (verified).
- Structure: updrafts and cloud on the walls, clear sinking centres (verified:
  Wood page), the inverse of closed cells.
- Orbit: honeycomb of bright rings with dark holes; higher contrast than closed
  cells; rings merge into lines.
- Ground: scattered showery cumulus with big clear gaps.
- Rule: Worley ridge (F2 - F1 small) as the cloud, cell size 35 km, wall height
  1.5 km, clear centre. Blend closed/open by a "cold-air-ness" field that is
  high west-poleward of each cyclone and over warm currents.

### 5. Cloud streets and horizontal convective rolls

- Where: cold air over warmer surface under a strong inversion, light to
  moderate wind: Bering Sea, Lake Superior, Hudson Bay, Gulf of Mexico
  (verified: Wikipedia Cloud street; UBC).
- Scales: depth = boundary-layer depth, 1-2 km (verified); roll wavelength 2-6x
  depth, up to 10x (verified), so spacing ~3-12 km (derived); lines over 480 km
  (verified); aligned within 18-30 deg left of the wind (verified).
- Base/top: ~0.5-1 km and ~1.5-2 km (unverified). Cover 30-60% (unverified).
- Orbit: ruler-straight parallel lines with clear lanes 2-5x their width.
- Ground: converging lines of humilis.
- Rule: where wind is 5-15 m/s over water with cold advection, density = 1D
  ridged noise of the cross-wind coordinate at 6 km wavelength, modulated along
  the wind at 80-200 km. Cross-fade to open cells with fetch.

### 6. Trade-wind cumulus and its mesoscale patterns

- Where: tropical oceans ~5-25 deg. Named patterns: Sugar (fine dusting), Gravel
  (arcs and lines), Fish (skeletal networks), Flowers (clumps with stratiform
  skirts) (verified: Stevens et al. 2019).
- Scales: Flowers ~100-200 km (verified: EGU abstract); Sugar clouds 0.5-2 km,
  Fish networks 500-1000 km (unverified).
- Base/top: ~0.5-0.6 km and 1.5-2.5 km under the trade inversion (unverified).
- Cover: Sugar 5-15%, Gravel 15-30%, Flowers 30-50% (unverified).
- Orbit: white dots on deep blue; ragged arcs; soft flower clumps with clear
  surrounds.
- Ground: humilis with flat dark bases and blue gaps.
- Rule: 3D Worley blobs at 1-3 km thresholded to 5-30% cover, modulated by 2D
  noise at 100-150 km elongated along the trades. Flat base.

### 7. Cumulus over land: afternoon cycle, sea-breeze fronts

- When: forms 2-4 h after sunrise, peaks ~13-17 local solar time, fades by
  evening (unverified); land boundary layer follows the daily cycle, sea stays
  flat (verified: Henkes et al. 2021); afternoon LCL over land is higher than
  over sea (verified: Zheng et al. 2020).
- Scales: clouds 0.5-3 km, spaced 3-10 km (unverified); sea breeze reaches
  10-100 km inland, 1-2 km deep, a cumulus line on its front (verified:
  Wikipedia Sea breeze).
- Base: LCL ~ 125 m per deg C of (T - Td) (verified: Wikipedia LCL); ~1.5-1.7 km
  over land before the growing season (verified: Freedman 2001); over arid or
  mountainous land bases can exceed 6 km (verified: Wikipedia Cumulus). Tops 2-4
  km for humilis/mediocris (unverified). Cover 10-40% (unverified).
- Orbit: popcorn dots over land that stop at the coast; a dotted line 30-80 km
  inland parallel to it.
- Ground: classic puffy cumulus, dark flat bases, bright tops.
- Rule: cover = smoothstep on local solar hour (9-14 up, 17-20 down) x land mask
  x (1 - aridity); base = 125 m x (T - Td) with the dew-point depression from a
  latitude and land-moisture proxy; 5 km 3D Worley. Sea-breeze line: ridge 5 km
  wide at 30-60 km inland, active 13-18 h. Needs a signed coast-distance field.

### 8. Orographic, lenticular and lee-wave clouds

- Where: lee of ranges in strong stable flow, wind within 30 deg of
  perpendicular to the ridge, ridgetop wind of 20 kn or more (~10 m/s)
  (verified: Wikipedia Lee wave). Lenticulars at crests, rotor cloud near peak
  height with ragged lee edge (verified).
- Scales: wavelength 5-30 km (unverified; page gives none); bands 20-100 km long
  parallel to the ridge (unverified). Cover: a few percent, very distinct.
- Orbit: stationary parallel ripples downwind of ridges; plume off a lone peak.
- Rule: where terrain > 1.5 km and the wind has a perpendicular component,
  density = sin(2 pi d_lee / 12 km) x exp(-d_lee / 100 km), with d_lee measured
  along the wind from the ridge. Needs terrain height and wind, no clock.

### 9. Island wakes: Karman vortex streets

- Where: high islands inside a stratocumulus deck, e.g. Guadalupe almost daily
  in June-August, Juan Fernandez 670 km off Chile; best at 18-54 km/h wind
  (verified: NASA EO).
- Scales: vortices 20-40 km across, streets over 400 km (verified: Wikipedia).
  Clear vortex centres; opposite spin on opposite flanks (verified).
- Orbit: staggered paired swirls with clear eyes trailing from a small island.
- Rule: inside mask 3, rotate the noise coordinate by A sin(2 pi x_wake / 60 km)
  exp(-x_wake / 250 km) x gaussian(cross), and clear a hole at each vortex
  centre. Cheap, rare, high screenshot value.

### 10. Cirrus: shields, jet streaks, fall streaks

- Where: above ~6 km everywhere; jet-stream cirrus spans continents, jet streaks
  make arcs hundreds of km long; tops 13.5 km tropical versus 7 km polar
  (verified: Wikipedia Cirrus).
- Scales: thickness 100 m to 8 km, mean 1.5 km (verified); global cover 31-32%,
  ~70% tropics, ~10% polar (verified); crystals ~0.25 mm (verified); optical
  depth mostly below 1 when thin (unverified).
- Orbit: translucent streaks and fans along the upper wind, ground and low cloud
  visible through; the first thing that breaks the flat look.
- Ground: fibres, hooks (uncinus = mares' tails, verified), halos.
- Rule: separate 2D layer at 8-12 km (1-2 steps): anisotropic fbm sampled at
  (0.1 x along-wind, 1.0 x cross-wind) for 10:1 streaks; shear fall-streaks by
  adding y x shear to the along-wind coordinate; cover from a jet band at 30-60
  deg with wavenumber-5-6 meander, thickest ahead of comma heads and around
  anvils.

### 11. Subtropical clear belts and polar low cloud

- Where: 20-35 deg latitude under descending air; stratocumulus lies along the
  edges of the highs (verified: Wikipedia Stratocumulus); deserts near cloud
  free. Polar: persistent low stratus, fog over cold sea (unverified), cirrus
  ~10% (verified).
- Cover: clear belts 5-20%; polar low cloud 70-90% over the Southern Ocean
  (unverified).
- Orbit: dark ocean or tan desert with sparse speckle makes the cloudy bands
  legible; polar cloud is a featureless grey-white lid that resembles snow.
- Rule: see the zonal cover curve below; above 55 deg reuse region 3's flat deck
  with lower contrast, and use streets where wind blows ice to open water.

## The planet-scale pattern

Goal: pure F(unit-sphere position, clock) giving cover, regime weights, wind.

- Zonal base cover c0(lat) as a sum of gaussians: ITCZ peak 0.65 at lat_itcz
  (sigma 4 deg); minima 0.12 at +-27 deg (sigma 8 deg); peaks 0.70 at +-52 deg
  (sigma 9 deg); 0.45 at the poles (unverified shape). No local octave may
  exceed c0 + 0.25, or belts vanish into noise.
- Mean wind: trade easterlies 0-30 deg, westerlies 30-60 deg, polar easterlies
  above (general knowledge); surface speeds ~6-12 m/s (unverified). Add a
  divergence-free perturbation as the curl of a low-frequency stream function,
  plus a vortex per cyclone (region 2).
- Synoptic layer: cyclone centres in the 36-60 deg belts per region 2, each with
  a life stage in [0,1] from a hash and the clock (open wave, comma, occluded,
  decaying), radius 600-1200 km by stage.
- Regime weights: stratocumulus = east-of-basin coast side x 15-40 deg; open
  cells = cold advection x ocean; streets = 5-15 m/s x cold advection x ocean;
  trade = ocean x 5-25 deg; land cumulus = land x diurnal factor; orographic =
  terrain x perpendicular wind; deep = ITCZ gaussian plus warm-season land
  afternoons (Amazon, Congo, Maritime Continent, 14-18 h, unverified).
- Blending: choose the dominant regime per ~500 km super-cell and blend weights
  over ~200 km so no seams appear.
- Time: advect coordinates by the local wind. At orbital time-lapse (days per
  minute) re-seed fine detail by a slow noise phase instead of advection, or
  cells smear. Local solar time = lon / 15 + UTC hours.
- Inputs needed: lat, lon, signed coast distance, land mask, terrain height,
  warm/cold-water flag, clock, season; all analytic.
- Noise on the unit-sphere vector, never lat/lon, to avoid pole pinch and seams;
  lat/lon only for the zonal envelope.
- Distance: from 2000 km the 1-5 km scale is sub-pixel; fade fine octaves by
  pixel footprint and fall back to regime-cover albedo, or the field turns into
  grey noise.

## Light

Ranked by visual payoff per cost. Sources: Schneider 2015 and 2022, Wrenninge et
al. (abstract), all read.

- Beer-Lambert T = exp(-d) along the sun ray and the view ray (verified).
  Mandatory. Gives self-shadowing and dark thick bases.
- Flat dark base: free once the density profile has a sharp lower edge; the base
  is lit by ambient only, so T darkens it.
- Dual-lobe Henyey-Greenstein: forward g ~0.6-0.8 for the silver lining, weak
  back lobe g ~ -0.2 (values unverified; HG formula verified in Schneider 2022).
  One expression per step.
- Multiple-scattering fudge, either Wrenninge octaves (N = 8, a = b = c = 0.5
  are the defaults, verified; 2-3 octaves suffice in real time, unverified) or
  the Nubis Evolved term: remap(profile x step, 0.1, 1, 0, 1) x (cover x
  type)^0.25 x light^p1 x height^p2 (verified). Keeps thick cumulus from going
  black inside.
- Powder term, 1 - exp(-2d), faded as the view nears the sun (Schneider 2015,
  verified; exact form from memory). Lighter clefts than bulges. One exp;
  wrong-looking alone.
- Ambient: sqrt(1 - dimensional_profile) from Nubis Evolved (verified), blue sky
  at the top, plus a ground-bounce term from below using the surface albedo
  (unverified). Gives blue shadows and lit undersides over snow or desert.
- Aerial perspective: blend to atmosphere colour with distance (verified:
  Schneider 2015). From orbit this is the limb glow.
- Sun reddening by atmospheric path length; very cheap, sells sunsets.
- Cloud shadows on ground and sea from the same field along the sun ray, one or
  two samples per ground pixel (unverified payoff; high from the air).
- Skip: full multiple scattering, spectral colour, rain shafts.

## Technique notes

What transfers to analytic-noise raymarching at 5-12 steps per pixel.

- Weather map + vertical profile (Nubis): coverage and type channels select a
  height gradient; dimensional_profile = vertical_profile x coverage; density =
  saturate(noise - (1 - dimensional_profile)) (verified: Nubis Evolved).
  Transfers directly: our map is the planet function above, evaluated once per
  ray in 2D. Bottom type sets flat vs wispy base, top type round vs flat top
  (verified: slide labels).
- Perlin-Worley base, Worley erosion (2015): inverted Worley dilating Perlin
  makes billows; a higher-frequency Worley is subtracted only near edges; the
  cheap base pass says where to pay for detail (verified). Analytic cost: 2D
  Worley 9 hashes, 3D Worley 27 per octave (counts from the algorithm, not a
  source). Use 2D Worley for cell structure and a 2-octave 3D erosion only where
  base density is above zero.
- Curl distortion (2015 uses a 128x128 curl texture): analytic substitute is a
  domain warp by the 90-degree-rotated gradient of a low-octave noise
  (divergence-free), applied to the erosion lookup only.
- Shape rules: flat base at LCL; per-cell hash scales tower height; bulged tops
  from Worley F1 to a power; edges evaporate by raising the erosion threshold
  with height (entrainment); shear skew = shear x (h - h_base) along the wind so
  towers lean and anvils smear.
- Marching: 2015 uses 64-128 potential steps, a cheap sampler until a cloud is
  hit, a step back before switching to full detail, early exit at alpha 1
  (verified). At 5-12 steps: intersect the ray with layer shells (low 0.3-4 km,
  mid, cirrus 8-12 km) and march only those intervals; distance scaled step = 3
  m + 60 m x d / 16384 m (verified: Nubis Evolved); jitter the start with blue
  noise; for 800-2000 km views use a single slab evaluation (integrate the
  profile analytically, no steps).
- Light march: 2015 uses 6 cone samples toward the sun, the last far out, and
  the cheap sampler once alpha passes 0.3, a 2x saving (verified). Here: one
  near plus one far light sample per step, or light on every third step; the
  multiple-scattering fudge hides the loss.
- Temporal: 2015 renders quarter-res, updating 1 of 16 pixels per 4x4 block per
  frame with reprojection; 20 ms became ~2 ms (verified). Transfers, but a fast
  descent from orbit to 2 m will ghost: drop reprojection on large camera deltas
  and re-jitter (untested).
- Does not transfer: baked 3D noise textures (use hashes); the painted weather
  map (we synthesise it); fluid-solver assets; a 64-128 step budget; the flat
  local frames (35 km radius in 2015, 16 km tile in 2022). The sphere needs a
  true curved shell intersection (cloud descent to the horizon, verified in
  2015).
- Rough per-pixel budget (unverified): base + erosion + warp ~60-100 hashes per
  sample; 8 steps x (1 view + 1 light) x 80 = ~1300 hashes. Skip detail when the
  base density is 0.

## Sources

Read in full or as search-result text (marked), not from memory.

- https://en.wikipedia.org/wiki/Cloud_street
- https://en.wikipedia.org/wiki/K%C3%A1rm%C3%A1n_vortex_street
- https://en.wikipedia.org/wiki/Intertropical_Convergence_Zone
- https://en.wikipedia.org/wiki/Extratropical_cyclone
- https://en.wikipedia.org/wiki/Stratocumulus_cloud
- https://en.wikipedia.org/wiki/Actinoform_cloud (actinoform: leaf or spoke
  patterns up to 300 km, shallow, off west coasts, rarely near the equator; not
  given its own entry for lack of a shader-relevant rule, treat as a
  stratocumulus-deck variant)
- https://en.wikipedia.org/wiki/Lifted_condensation_level
- https://en.wikipedia.org/wiki/Cirrus_cloud
- https://en.wikipedia.org/wiki/Cumulonimbus_cloud
- https://en.wikipedia.org/wiki/Anvil_cloud
- https://en.wikipedia.org/wiki/Lee_wave
- https://en.wikipedia.org/wiki/Sea_breeze
- https://en.wikipedia.org/wiki/Rossby_wave
- https://en.wikipedia.org/wiki/Cumulus_cloud
- https://atmos.uw.edu/~robwood/papers/lwp_pdf/mcc.html
- https://www.eoas.ubc.ca/courses/atsc113/sailing/met_concepts/10-met-local-
  conditions/10c-mesoscale-cellular-convection/ (its open/closed wording came
  back garbled; Wood's page and search text decided which is which)
- Search-result text only: Wood and Hartmann 2006 (atmos.washington.edu/
  ~robwood/papers/my_papers/Wood_Hartmann_JCLI_2006.pdf); Wood 2012 abstract;
  NASA EO Guadalupe and Juan Fernandez vortex pages
  (earthobservatory.nasa.gov/images/987/, /images/90734/); Stevens et al. 2019
  (elib.dlr.de/131194/) and EGU2018-10832; Machado/Rossow and Yuan/Houze
  (acp.copernicus.org/articles/17/3845/2017/); Henkes et al. 2021, Zheng et al.
  2020, Freedman 2001; Schneidereit et al. 2010 (Hamburg).
- https://www.advances.realtimerendering.com/s2015/ (Schneider and Vos 2015,
  full text via pdftotext)
- https://advances.realtimerendering.com/s2022/SIGGRAPH2022-Advances-
  NubisEvolved-NoVideos.pdf (slide text and code via pdftotext)
- https://fpsunflower.github.io/ckulla/data/oz_volumes.pdf (Wrenninge et al.,
  search-result text only)
- Not obtained: Hillaire 2016 Frostbite slides (the PDF had no text layer) and
  any NASA Worldview global-pattern captions; the global-pattern numbers in
  regions 1, 2 and 11 are mostly (unverified).
