'use client';

import { ActionIcon, Button, TextInput, UnstyledButton } from '@mantine/core';
import { useState } from 'react';

import type { WithCopy } from '../i18n';
import { rollName } from '../lib/dice';
import { type Row, rowsFor, zoneOf } from '../lib/lookup';
import type { Prices } from '../lib/price';
import { useVerdicts } from '../lib/use-verdict';
import { useWords } from '../lib/use-words';
import { useChecker } from './checker-state';
import { DiceIcon } from './dice-icon';
import classes from './unsquatted-home.module.scss';
import {
  type CopiedPrice,
  type CopiedVerdict,
  OWN_DOMAIN,
  VerdictLabel,
} from './verdict-label';

type ZoneRowProps = CopiedVerdict &
  CopiedPrice &
  Row & { ownNeighbour: boolean };

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
        <VerdictLabel {...{ domain, verdict, ownNeighbour, price, copy }} />
      ) : (
        <span className={classes['verdict']} data-state="unknown">
          {copy.cantCheck}
        </span>
      )}
    </li>
  );
}

type NameCheckerProps = WithCopy & { prices: Prices };

/** The most rows the closed list shows, at its widest in the stylesheet's `.zones`. */
const CLOSED_ROWS = 9;

const checkableDomains = (rows: readonly Row[]) =>
  rows.filter(({ checkable }) => checkable).map(({ domain }) => domain);

/**
 * A name checked in the zones once typing pauses — so the words on the way to
 * the one meant cost no lookups — or at once on Check. Only the first
 * `CLOSED_ROWS` rows are looked up; the rest wait until the toggle is pointed
 * at, focused or opened, so a visitor who never reaches for it costs the
 * registries none of those lookups. On a narrower screen the closed list shows
 * fewer than that, and the surplus is looked up all the same.
 */
export function NameChecker({ copy, prices }: NameCheckerProps) {
  const {
    typed,
    type,
    label,
    zone,
    asks,
    settling,
    checkTyped,
    checkHere,
    fieldRef,
  } = useChecker();
  const [open, setOpen] = useState(false);
  const [wanted, setWanted] = useState(false);
  const [rolling, setRolling] = useState(false);
  const words = useWords(label !== '');
  const rows =
    label === '' ? [] : rowsFor(label, zone, Object.keys(prices), words);
  const shownDomains = checkableDomains(rows.slice(0, CLOSED_ROWS));
  const hiddenDomains =
    open || wanted ? checkableDomains(rows.slice(CLOSED_ROWS)) : [];
  const shownVerdicts = useVerdicts(shownDomains, asks);
  const hiddenVerdicts = useVerdicts(hiddenDomains, asks);
  const ownIndex = rows.findIndex(({ domain }) => domain === OWN_DOMAIN);
  const busy =
    (settling && typed.trim() !== '') ||
    shownVerdicts.size < shownDomains.length ||
    hiddenVerdicts.size < hiddenDomains.length;

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
          loading={rolling}
          onClick={() => {
            setRolling(true);
            rollName()
              .then(checkHere, reportError)
              .finally(() => {
                setRolling(false);
              });
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
        <ul className={classes['zones']} data-open={open} aria-live="polite">
          {rows.map((row, index) => (
            <ZoneRow
              key={row.domain}
              {...row}
              ownNeighbour={ownIndex !== -1 && index === ownIndex + 1}
              price={prices[zoneOf(row.domain)]}
              verdict={
                shownVerdicts.get(row.domain) ?? hiddenVerdicts.get(row.domain)
              }
              {...{ copy }}
            />
          ))}
        </ul>
      )}
      {rows.length > 0 && (
        <UnstyledButton
          className={classes['moreZones']}
          onPointerEnter={() => {
            setWanted(true);
          }}
          onFocus={() => {
            setWanted(true);
          }}
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
