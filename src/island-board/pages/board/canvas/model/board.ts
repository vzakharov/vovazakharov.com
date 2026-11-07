import type { Zoomed } from '@/scene/shared/lib/plane';

import type { Item } from '@/island-board/entities/item';

import type { Assets, User } from '../api/runtime.ts';
import type { Store } from './store.ts';

/** The page's nodes and everything the viewer's work changes: the one object every module of the page takes. */
export type Board = {
  readonly stage: HTMLElement;
  readonly world: HTMLElement;
  readonly lines: SVGSVGElement;
  readonly status: HTMLElement;
  readonly colors: HTMLElement;
  readonly picker: HTMLInputElement;
  /** The items built into the page, which every store overlays. */
  readonly baked: readonly Item[];
  camera: Zoomed;
  selected: string | undefined;
  lineTool: boolean;
  /** The first end of a line being drawn. */
  lineFrom: string | undefined;
  /** The text being edited, while rendering is held off. */
  editing: HTMLElement | undefined;
  names: Record<string, string>;
  user: User | null;
  assets: Assets | null;
  store: Store;
};
