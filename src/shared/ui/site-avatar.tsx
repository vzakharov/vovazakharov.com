import { Center } from '@mantine/core';
import Image from 'next/image';

import { SITE_CONFIG } from '@/shared/config';

/**
 * The circle is this component's, not the file's, so each site commits one
 * square and its Open Graph card reads the same bytes. `priority` because the
 * mark is above the fold wherever it renders.
 */
export function SiteAvatar() {
  const { name, avatar } = SITE_CONFIG;

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
