'use client';

import { useEffect, useRef } from 'react';

import type { WithChildren } from '@/shared/typings';

import classes from './marquee.module.scss';

/** How fast an overflowing line crawls, in pixels a second — slow enough to read along. */
const SPEED = 30;
/** How long the line rests at its start before it moves, in milliseconds. */
const REST_AT_START = 2500;
/** How long it rests at its end before it jumps back to the start. */
const REST_AT_END = 2000;
/** How long an ellipsis takes to come or go once the line starts or stops. */
const FADE = 300;

/** A clip that hides this much of the line at either end, in pixels. */
function inset(left: number, right: number) {
  return `inset(0 ${right}px 0 ${left}px)`;
}

/**
 * One line that, when it does not fit, rests, crawls to its end with the text
 * leaving into an ellipsis on the left and arriving out of one on the right,
 * rests again, and starts over. A line that fits, or a reader who asked for
 * reduced motion, gets a still line cut by the right ellipsis.
 *
 * Remount it (`key`) when its text changes: the cycle is measured once per
 * size, and a new text of the same width would otherwise carry on mid-crawl.
 */
export function Marquee({ children }: WithChildren) {
  const viewRef = useRef<HTMLSpanElement>(null);
  const clipRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const leadRef = useRef<HTMLSpanElement>(null);
  const tailRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const view = viewRef.current;
    const clip = clipRef.current;
    const text = textRef.current;
    const lead = leadRef.current;
    const tail = tailRef.current;

    if (!view || !clip || !text || !lead || !tail) return;

    const reducedMotion = globalThis.matchMedia(
      '(prefers-reduced-motion: reduce)',
    );
    let animations: Animation[] = [];

    const start = () => {
      for (const animation of animations) animation.cancel();
      animations = [];

      const distance = text.scrollWidth - view.clientWidth;
      const ellipsis = tail.offsetWidth;

      view.dataset['overflowing'] = String(distance > 0);
      view.style.setProperty('--marquee-ellipsis', `${ellipsis}px`);

      if (distance <= 0 || reducedMotion.matches) return;

      const crawl = (distance / SPEED) * 1000;
      const fade = Math.min(FADE, crawl / 2);
      const total = REST_AT_START + crawl + REST_AT_END;
      // Offsets into the cycle: the crawl starts, the lead ellipsis is in,
      // the tail ellipsis starts to go, and the crawl ends.
      const moving = REST_AT_START / total;
      const leadIn = (REST_AT_START + fade) / total;
      const tailOut = (REST_AT_START + crawl - fade) / total;
      const stopped = (REST_AT_START + crawl) / total;

      const timing = { duration: total, iterations: Infinity };

      animations = [
        text.animate(
          [
            { offset: 0, transform: 'translateX(0)' },
            { offset: moving, transform: 'translateX(0)' },
            { offset: stopped, transform: `translateX(${-distance}px)` },
            { offset: 1, transform: `translateX(${-distance}px)` },
          ],
          timing,
        ),
        clip.animate(
          [
            { offset: 0, clipPath: inset(0, ellipsis) },
            { offset: moving, clipPath: inset(0, ellipsis) },
            { offset: leadIn, clipPath: inset(ellipsis, ellipsis) },
            { offset: tailOut, clipPath: inset(ellipsis, ellipsis) },
            { offset: stopped, clipPath: inset(ellipsis, 0) },
            { offset: 1, clipPath: inset(ellipsis, 0) },
          ],
          timing,
        ),
        lead.animate(
          [
            { offset: 0, opacity: 0 },
            { offset: moving, opacity: 0 },
            { offset: leadIn, opacity: 1 },
            { offset: 1, opacity: 1 },
          ],
          timing,
        ),
        tail.animate(
          [
            { offset: 0, opacity: 1 },
            { offset: tailOut, opacity: 1 },
            { offset: stopped, opacity: 0 },
            { offset: 1, opacity: 0 },
          ],
          timing,
        ),
      ];
    };

    const observer = new ResizeObserver(start);

    observer.observe(view);
    observer.observe(text);
    reducedMotion.addEventListener('change', start);

    return () => {
      observer.disconnect();
      reducedMotion.removeEventListener('change', start);
      for (const animation of animations) animation.cancel();
    };
  }, []);

  return (
    <span ref={viewRef} className={classes['view']}>
      <span ref={clipRef} className={classes['clip']}>
        <span ref={textRef} className={classes['text']}>
          {children}
        </span>
      </span>
      <span ref={leadRef} className={classes['lead']} aria-hidden>
        …
      </span>
      <span ref={tailRef} className={classes['tail']} aria-hidden>
        …
      </span>
    </span>
  );
}
