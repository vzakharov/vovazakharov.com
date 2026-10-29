'use client';

import { ActionIcon, Button, TextInput } from '@mantine/core';
import { Dices } from 'lucide-react';

import type { WithCopy } from '../i18n';
import { rollName } from '../lib/dice';
import { type Row, rowsFor, type Verdict } from '../lib/lookup';
import { useVerdicts } from '../lib/use-verdict';
import { useChecker } from './checker-state';
import classes from './unsquatted-home.module.scss';
import { VerdictLabel } from './verdict-label';

type ZoneRowProps = WithCopy & Row & { verdict: Verdict | undefined };

function ZoneRow({ domain, checkable, verdict, copy }: ZoneRowProps) {
  return (
    <li className={classes['zone']}>
      <span className={classes['domain']}>{domain}</span>
      {checkable ? (
        <VerdictLabel {...{ domain, verdict }} />
      ) : (
        <span className={classes['verdict']} data-state="unknown">
          {copy.cantCheck}
        </span>
      )}
    </li>
  );
}

/**
 * A name checked in every zone of `ZONES` as it is typed, once typing pauses —
 * so each word on the way to the one meant is not a round of lookups — or at
 * once on Check. A zone typed with the name leads the list.
 */
export function NameChecker({ copy }: WithCopy) {
  const {
    typed,
    type,
    label,
    zone,
    round,
    settling,
    checkTyped,
    checkNow,
    fieldRef,
  } = useChecker();
  const rows = label === '' ? [] : rowsFor(label, zone);
  const checked = rows.filter(({ checkable }) => checkable);
  const verdicts = useVerdicts(
    checked.map(({ domain }) => domain),
    round,
  );
  const busy =
    (settling && typed.trim() !== '') || verdicts.size < checked.length;

  return (
    <>
      <form
        className={classes['field']}
        onSubmit={(event) => {
          event.preventDefault();
          checkTyped();
        }}
      >
        <TextInput
          ref={fieldRef}
          aria-label={copy.fieldLabel}
          placeholder={copy.fieldPlaceholder}
          autoComplete="off"
          spellCheck={false}
          size="md"
          value={typed}
          onChange={(event) => {
            type(event.currentTarget.value);
          }}
          classNames={{ root: classes['fieldInput'], input: classes['input'] }}
        />
        <ActionIcon
          type="button"
          variant="default"
          size={42}
          aria-label={copy.dice}
          title={copy.dice}
          onClick={() => {
            rollName().then(checkNow, reportError);
          }}
        >
          <Dices size={20} />
        </ActionIcon>
        <Button type="submit" size="md" loading={busy}>
          {copy.checkButton}
        </Button>
      </form>
      {rows.length > 0 && (
        <ul className={classes['zones']} aria-live="polite">
          {rows.map((row) => (
            <ZoneRow
              key={row.domain}
              {...row}
              verdict={verdicts.get(row.domain)}
              {...{ copy }}
            />
          ))}
        </ul>
      )}
    </>
  );
}
