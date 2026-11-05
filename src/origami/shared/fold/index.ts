export {
  type Assignment,
  ASSIGNMENTS,
  type Crease,
  creasePattern,
  creasePatternSvg,
} from './crease-pattern.ts';
export { fold, run, type Selection, type Step, type StepSpec } from './fold.ts';
export { type Line, type Polygon, type Vec } from './geometry.ts';
export {
  DEFAULT_PAPER,
  type Paper,
  PAPER_IDS,
  type PaperId,
  PAPERS,
} from './paper.ts';
export {
  CREEP_ERROR,
  CREEP_WARN,
  type Finding,
  type Level,
  LEVELS,
  measure,
  physics,
  REVERSE_LAYERS_ERROR,
  SIMPLE_LAYERS_ERROR,
  SIMPLE_LAYERS_WARN,
  type StepReport,
  TIP_WARN_DEGREES,
} from './physics.ts';
export { type PieceSnapshot, type Snapshot, snapshot } from './snapshot.ts';
export { type Vec3 } from './space.ts';
export {
  FOLD_DIRECTIONS,
  type FoldDirection,
  type FoldRecord,
  type FoldState,
  layers,
  where,
} from './state.ts';
