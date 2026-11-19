import type { WithSelected } from '@/kernel/shared/typings';

import type { Zoomed } from '@/scene/shared/lib/plane';

import type { Item } from '@/board/entities/item';

import type { LineLayers } from '../../drawing/index.ts';
import type { Authoring } from '../api/runtime.ts';
import type { Lift } from '../lib/lift.ts';
import type { Store } from './store.ts';

/** Where the viewer is looking, and how close. */
export type WithCamera = { camera: Zoomed };

/**
 * The find box's query and the match it stands on, the matches recomputed from
 * the items; and the fresh item the New button goes to next.
 */
type Finding ={ query: string; match: number; nextFresh: number };

/** The page's nodes and everything the viewer's work changes: the one object every module of the page takes. */
export type Board = WithCamera &
  WithSelected &
  Authoring & {
    readonly stage: HTMLElement;
    /** The wrapper the camera transforms, holding the world and its lines. */
    readonly lens: HTMLElement;
    readonly lift: Lift;
    readonly world: HTMLElement;
    readonly lines: LineLayers;
    readonly status: HTMLElement;
    readonly colors: HTMLElement;
    readonly picker: HTMLInputElement;
    /** The items built into the page, which every store overlays. */
    readonly baked: readonly Item[];
    lineTool: boolean;
    /** The first end of a line being drawn. */
    lineFrom: string | undefined;
    /** The text being edited, while rendering is held off. */
    editing: HTMLElement | undefined;
    names: Record<string, string>;
    finding: Finding;
    store: Store;
  };
