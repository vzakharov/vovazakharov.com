import type { z } from 'zod';

type ComposedShape<Schemas extends readonly z.ZodObject[]> =
  Schemas extends readonly [
    infer First extends z.ZodObject,
    ...infer Rest extends readonly z.ZodObject[],
  ]
    ? z.core.util.Extend<First['shape'], ComposedShape<Rest>>
    : Record<never, never>;

/**
 * Every member of `schemas` in one object schema, a later key overriding an
 * earlier one, under the first schema's config (strict, loose, catchall). Own
 * members go on with `.extend({ … })`.
 *
 * Taken from the Playgram app's `shared/typings/compose-schemas`, which is its
 * home — so a fix to it is made there and copied here, not the other way round.
 */
export function composeSchemas<
  const Schemas extends readonly [z.ZodObject, ...z.ZodObject[]],
>(
  ...schemas: Schemas
): z.ZodObject<ComposedShape<Schemas>, Schemas[0]['_zod']['config']>;
export function composeSchemas(
  ...[first, ...rest]: readonly [z.ZodObject, ...z.ZodObject[]]
): z.ZodObject {
  return first.extend(
    Object.fromEntries(rest.flatMap((schema) => Object.entries(schema.shape))),
  );
}
