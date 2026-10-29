'use client';

import { Button, TextInput } from '@mantine/core';
import { useState } from 'react';

import type { WithCopy } from '../i18n';
import { cleanLabel, type WithDomain, ZONES } from '../lib/lookup';
import { useVerdict } from '../lib/use-verdict';
import classes from './unsquatted-home.module.scss';
import { VerdictLabel } from './verdict-label';

function ZoneRow({ domain }: WithDomain) {
  return (
    <li className={classes['zone']}>
      <span className={classes['domain']}>{domain}</span>
      <VerdictLabel {...{ domain }} verdict={useVerdict(domain)} />
    </li>
  );
}

/** A name typed in, checked in every zone of `ZONES` at once. */
export function NameChecker({ copy }: WithCopy) {
  const [typed, setTyped] = useState('');
  const [label, setLabel] = useState('');

  return (
    <>
      <form
        className={classes['form']}
        onSubmit={(event) => {
          event.preventDefault();
          const cleaned = cleanLabel(typed);
          setTyped(cleaned);
          setLabel(cleaned);
        }}
      >
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
          classNames={{ root: classes['field'], input: classes['input'] }}
        />
        <Button type="submit" size="md">
          {copy.check}
        </Button>
      </form>
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
