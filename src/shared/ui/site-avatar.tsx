import { Center } from '@mantine/core';
import Image from 'next/image';

import type { Named } from '@/shared/typings';

/**
 * The circle is this component's, not the file's, so each site commits one
 * square and its Open Graph card reads the same bytes. `priority` because the
 * mark is above the fold wherever it renders.
 *
 * Takes the site's name and image rather than reading them: `@/shared/ui` is a
 * barrel client components import, so a module inside it that reads
 * `@/shared/config/index.server-only` would put the whole resolved
 * configuration in the browser.
 */
export function SiteAvatar({ name, src }: Named & { src: string }) {
  return (
    <Center>
      <Image
        {...{ src }}
        alt={name}
        width={150}
        height={150}
        style={{ borderRadius: '50%' }}
        priority
      />
    </Center>
  );
}
