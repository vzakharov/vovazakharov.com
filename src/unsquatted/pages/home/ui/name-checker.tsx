'use client';

import { ActionIcon, Button, TextInput, UnstyledButton } from '@mantine/core';
import { useState } from 'react';

import type { WithCopy } from '../i18n';
import { rollName } from '../lib/dice';
import { type Row, rowsFor, type Verdict, zoneOf } from '../lib/lookup';
import type { Price, Prices } from '../lib/price';
import { useGridColumns } from '../lib/use-grid-columns';
import { useVerdicts } from '../lib/use-verdict';
import { useWords } from '../lib/use-words';
import { useChecker } from './checker-state';
import { DiceIcon } from './dice-icon';
import classes from './unsquatted-home.module.scss';
import { OWN_DOMAIN, VerdictLabel } from './verdict-label';

type ZoneRowProps = WithCopy &
  Row & {
    verdict: Verdict | undefined;
    ownNeighbour: boolean;
    price: Price | undefined;
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

/** The rows the closed list shows, in the stylesheet's `.zones`. */
const CLOSED_ROWS = 3;

const checkableDomains = (rows: readonly Row[]) =>
  rows.filter(({ checkable }) => checkable).map(({ domain }) => domain);

/**
 * A name checked in the zones once typing pauses — so the words on the way to
 * the one meant cost no lookups — or at once on Check. Only the rows the closed
 * list shows are looked up; the rest wait for the toggle to be opened, pointed
 * at or focused, the first of which asks for them, so a visitor who never opens
 * it costs the registries none of those lookups.
 */
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
  const [wanted, setWanted] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [grid, setGrid] = useState<HTMLUListElement | null>(null);
  const columns = useGridColumns(grid);
  const words = useWords(label !== '');
  const rows =
    label === '' ? [] : rowsFor(label, zone, Object.keys(prices), words);
  const shown = columns === undefined ? 0 : CLOSED_ROWS * columns;
  const shownDomains = checkableDomains(rows.slice(0, shown));
  const hiddenDomains =
    open || wanted ? checkableDomains(rows.slice(shown)) : [];
  const shownVerdicts = useVerdicts(shownDomains, round);
  const hiddenVerdicts = useVerdicts(hiddenDomains, round);
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
        <ul
          ref={setGrid}
          className={classes['zones']}
          data-open={open}
          aria-live="polite"
        >
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
