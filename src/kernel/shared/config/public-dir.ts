import path from 'node:path';

/**
 * The site's static assets, resolved against the working directory — which is
 * the site's own directory under `sites/`, every build and render script being
 * entered there. Run one from the repository root and this points at nothing.
 */
export const PUBLIC_DIR = path.join(process.cwd(), 'public');

/**
 * Where the pipeline's whole-site renders land under `public/`, and the one
 * directory a walk for sources skips: an output read back as an input never
 * settles, a render's own product hashing into the source set that decides
 * whether it is stale. The name is therefore a contract — a run writes here
 * and never reads here.
 *
 * A rooted collection's directory is the site's whole `public/`, which is what
 * makes that separation this constant rather than where the directories sit.
 */
export const GENERATED_DIR = 'generated';
