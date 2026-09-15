import { Center } from '@mantine/core';
import Image from 'next/image';

import { SITE_CONFIG } from '@/shared/config';

/**
 * The site's own mark, at the size a home page heads itself with. The circle is
 * this component's, not the file's, so each site commits one square and the
 * Open Graph card reads the same bytes; `priority` because it is above the fold
 * wherever it renders.
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
