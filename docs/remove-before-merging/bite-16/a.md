# Package A — the button: hand-over

## Done

- The mute gone whole from `sound.ts` (`readMuted`, `rememberMuted`,
  `MUTED_KEY`, `toggleMuted`, `muted`, the fade); `settle()` and the
  hidden-tab suspend kept. Its tests turned to the hidden tab.
- Renamed for the map: `WithMap`, `Controls.map`, the `map` handler, the
  layout's comments, `game.ts`'s comment on `shut`.
- `drawMapButton` in `hud.ts`; while open the button draws `drawPullButton`
  (the flower picker's cross), chosen in `Controls.paint`.
- The press: `controlActions().map` flips the scene's `MapSwitch`
  (`map-switch.ts`), pops, dispatches `shut`, repaints. `Controls.paint`
  takes `mapOpen` and `Controls.update` hides every other button while open.
- Probe: `state().mapOpen`, `controls().map`; `play-meadow` opens and shuts
  the map (`7-map`); `play-approach`, `play-fliers` off the mute.
- `decisions.md`: sound off is the device's, the top-left circle the map's.

## Left

- Land (squash onto the shared branch).

## Decided

- The open flag lives in `MapSwitch` (`map-switch.ts`), held by the scene,
  so the scene grows by three lines (453), not a method.
- No new palette colours: the map is the disc's `hud` white in `inkCool`, the
  middle panel shaded with `shadeInk`.
