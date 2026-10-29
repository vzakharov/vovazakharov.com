'use client';

import { ActionIcon, Button, TextInput, UnstyledButton } from '@mantine/core';
import { useState } from 'react';

import type { WithCopy } from '../i18n';
import { rollName } from '../lib/dice';
import { type Row, rowsFor, type Verdict } from '../lib/lookup';
import { type Prices, priceText } from '../lib/prices';
import { useVerdicts } from '../lib/use-verdict';
import { useChecker } from './checker-state';
import { DiceIcon } from './dice-icon';
import classes from './unsquatted-home.module.scss';
import { OWN_DOMAIN, VerdictLabel } from './verdict-label';

type ZoneRowProps = WithCopy &
  Row & {
    verdict: Verdict | undefined;
    ownNeighbour: boolean;
    price: string | undefined;
  };

function ZoneRow({
  domain,
  checkable,
  verdict,
  ownNeighbour,
  price,
  copy,
}: ZoneRowProps) {
  return (
    <li className={classes['zone']}>
      <span className={classes['domain']}>{domain}</span>
      {checkable ? (
        <VerdictLabel {...{ domain, verdict, ownNeighbour, price }} />
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
 * once on Check. A zone typed with the name leads the list, and the zones past
 * the first three rows wait behind a toggle — looked up all the same, so
 * opening it shows answers rather than a round of lookups.
 */
type NameCheckerProps = WithCopy & { prices: Prices };

export function NameChecker({ copy, prices }: NameCheckerProps) {
  const {
    typed,
    type,
    label,
    zone,
    round,
    settling,
    checkTyped,
    checkHere,
    fieldRef,
  } = useChecker();
  const [open, setOpen] = useState(false);
  const rows = label === '' ? [] : rowsFor(label, zone);
  const checked = rows.filter(({ checkable }) => checkable);
  const verdicts = useVerdicts(
    checked.map(({ domain }) => domain),
    round,
  );
  const ownIndex = rows.findIndex(({ domain }) => domain === OWN_DOMAIN);
  const priceOf = (domain: string) => {
    const price = prices[domain.slice(domain.indexOf('.') + 1)];

    return price === undefined ? undefined : priceText(price);
  };
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
          className={classes['diceButton']}
          size={42}
          aria-label={copy.dice}
          title={copy.dice}
          onClick={() => {
            rollName().then(checkHere, reportError);
          }}
        >
          <DiceIcon />
        </ActionIcon>
        <Button
          type="submit"
          size="md"
          loading={busy}
          className={classes['check']}
        >
          {copy.checkButton}
        </Button>
      </form>
      {rows.length > 0 && (
        <ul
          className={classes['zones']}
          data-open={open}
          aria-live="polite"
        >
          {rows.map((row, index) => (
            <ZoneRow
              key={row.domain}
              {...row}
              ownNeighbour={ownIndex !== -1 && index === ownIndex + 1}
              price={priceOf(row.domain)}
              verdict={verdicts.get(row.domain)}
              {...{ copy }}
            />
          ))}
        </ul>
      )}
      {rows.length > 0 && (
        <UnstyledButton
          className={classes['moreZones']}
          onClick={() => {
            setOpen(!open);
          }}
        >
          {open ? copy.fewerZones : copy.moreZones}
        </UnstyledButton>
      )}
    </>
  );
}
