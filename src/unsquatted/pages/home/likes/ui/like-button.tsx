'use client';

import { ActionIcon, type ActionIconProps } from '@mantine/core';
import { Heart } from 'lucide-react';

import type { Named } from '@/kernel/shared/typings';

import type { WithCopy, Zoned } from '../../checker';
import { useLikes } from './likes-state';

type LikeButtonProps = WithCopy &
  ActionIconProps &
  Named &
  Zoned & { iconSize: number };

/**
 * The heart that likes `name` with `zone` preferred, or unlikes it once liked;
 * `data-on` says which, for the stylesheet.
 */
export function LikeButton({
  name,
  zone,
  iconSize,
  copy,
  ...props
}: LikeButtonProps) {
  const { likeFor, like, unlike } = useLikes();
  const isOn = likeFor(name) !== undefined;
  const label = isOn ? copy.unlike : copy.like;

  return (
    <ActionIcon
      {...props}
      data-on={isOn}
      aria-label={label}
      aria-pressed={isOn}
      title={label}
      onClick={() => {
        if (isOn) unlike(name);
        else like(name, zone);
      }}
    >
      <Heart size={iconSize} fill={isOn ? 'currentColor' : 'none'} />
    </ActionIcon>
  );
}
