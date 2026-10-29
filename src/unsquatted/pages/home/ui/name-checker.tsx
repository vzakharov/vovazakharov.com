'use client';

import { TextInput } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { useState } from 'react';

import type { WithCopy } from '../i18n';
import { cleanLabel, type WithDomain, ZONES } from '../lib/lookup';
import { useVerdict } from '../lib/use-verdict';
import classes from './unsquatted-home.module.scss';
import { VerdictLabel } from './verdict-label';

/** How long typing has to pause before the name is looked up. */
const SETTLE_MS = 350;

function ZoneRow({ domain }: WithDomain) {
  return (
    <li className={classes['zone']}>
      <span className={classes['domain']}>{domain}</span>
      <VerdictLabel {...{ domain }} verdict={useVerdict(domain)} />
    </li>
  );
}

/**
 * A name checked in every zone of `ZONES` as it is typed, once typing pauses —
 * so each word on the way to the one meant is not a round of lookups.
 */
export function NameChecker({ copy }: WithCopy) {
  const [typed, setTyped] = useState('');
  const [settled] = useDebouncedValue(typed, SETTLE_MS);
  const label = cleanLabel(settled);

  return (
    <>
      <TextInput
        aria-label={copy.fieldLabel}
        placeholder={copy.fieldPlaceholder}
        autoComplete="off"
        spellCheck={false}
        size="md"
        value={typed}
        onChange={(event) => {
          setTyped(event.currentTarget.value);
        }}
        classNames={{ input: classes['input'] }}
      />
      {label !== '' && (
        <ul className={classes['zones']} aria-live="polite">
          {ZONES.map((zone) => (
            <ZoneRow key={zone} domain={`${label}.${zone}`} />
          ))}
        </ul>
      )}
    </>
  );
}
