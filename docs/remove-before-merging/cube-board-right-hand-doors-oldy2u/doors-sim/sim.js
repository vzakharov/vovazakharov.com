// Door simulator over the cube's floor maze: recursive division exactly as
// src/cube/entities/world/model/maze.ts draws it, plus openable doors in
// closed interior walls, plus three explorers that look for the hole.
// In the browser index.html loads maze.js, doors.js, walks.js and eyes.js before
// this file; in Node it requires them.
(function (root) {
  'use strict';
  if (typeof require === 'function') for (const part of ['maze', 'doors', 'walks', 'eyes']) require(`./${part}.js`);

  const { buildMaze, placeDoors, randomWalk, exploreWalk, metAlong, withGaps, seededRoll, deadEnds, eyesOf, WALL_HALF, redundant, adjacency, bfs, shortcuts, mapper, wanderer, follower, opener, trial, randomPairs, sweep, treeDistance, levelOf, mulberry32 } = root.DoorSimParts;

  root.DoorSim = { buildMaze, placeDoors, randomWalk, exploreWalk, metAlong, withGaps, seededRoll, deadEnds, eyesOf, WALL_HALF, redundant, adjacency, bfs, shortcuts, mapper, wanderer, follower, opener, trial, randomPairs, sweep, treeDistance, levelOf, mulberry32 };
  if (typeof module !== 'undefined') module.exports = root.DoorSim;
})(typeof globalThis !== 'undefined' ? globalThis : this);
