'use client';

import { Box } from '@mantine/core';
import { Lightbulb } from 'lucide-react';

import type { WithCopy } from '../../../checker';
import classes from './ideas.module.scss';

/** The three mock-ups the operator picks from; the rest go once one is. */
export type LoadingVariant = 'bar' | 'bulb' | 'underline';

type LoadingLineProps = WithCopy & {
  /** The fraction downloaded. */
  fraction: number;
  variant: LoadingVariant;
};

/** The line under the field while the opt-in's download runs. */
export function LoadingLine({
  fraction,
  variant,
  copy: { ideas: copy },
}: LoadingLineProps) {
  const percent = Math.round(fraction * 100);
  const text = copy.loading.replace('{percent}', String(percent));

  return (
    <Box
      component="p"
      className={classes['loading']}
      data-variant={variant}
      style={{ '--loaded': `${percent}%` }}
    >
      {variant === 'bulb' ? (
        <span className={classes['filling']} aria-hidden>
          <Lightbulb className={classes['bulb']} data-thinking />
          <Lightbulb className={classes['bulb']} data-lit />
        </span>
      ) : (
        <Lightbulb className={classes['bulb']} data-thinking aria-hidden />
      )}
      <span className={classes['loadingText']}>{text}</span>
      <progress
        className={classes[variant === 'bar' ? 'track' : 'unseen']}
        value={percent}
        max={100}
        aria-label={text}
      />
    </Box>
  );
}
