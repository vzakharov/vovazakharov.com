import { Center } from '@mantine/core';
import Image from 'next/image';

import type { SiteConfig } from '@/shared/config';
import type { Named } from '@/shared/typings';

/**
 * The circle is this component's, not the file's, so each site commits one
 * square and its Open Graph card reads the same bytes. `priority` because the
 * mark is above the fold wherever it renders.
 *
 * Takes the site rather than reading it: `@/shared/ui` is the barrel client
 * components import, and a component in it that read the resolved site would be
 * bound to whichever one this process is.
 */
export function SiteAvatar({
  name,
  avatar,
}: Named & Pick<SiteConfig, 'avatar'>) {
  return (
    <Center>
      <Image
        src={avatar.path}
        alt={name}
        width={150}
        height={150}
        style={{ borderRadius: '50%' }}
        priority
      />
    </Center>
  );
}
