import type { Labeled } from '@/shared/typings';

import { TextLink } from './text-link';

export type BackToHomeProps = Partial<Labeled>;

/** The label is a prop because a localized page has to say it in its own language. */
export function BackToHome({ label = '← Home' }: BackToHomeProps) {
  return <TextLink href="/">{label}</TextLink>;
}
