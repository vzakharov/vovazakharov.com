'use client';

import {
  ActionIcon,
  Button,
  CloseButton,
  TextInput,
  UnstyledButton,
} from '@mantine/core';
import { type ReactNode, useState } from 'react';

import { pick } from '@/kernel/shared/lib/collections';

import { useVerdicts } from '../../verdict';
import type { WithCopy } from '../config/i18n';
import { rollName } from '../lib/dice';
import type { Prices } from '../lib/price';
import { type Row, rowsFor, zoneOf } from '../lib/rows';
import { useWords } from '../lib/use-words';
import { useChecker } from './checker-state';
import { CornerTools } from './corner-tools';
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
  Row & { ownNeighbour: boolean; tools: ReactNode };

function ZoneRow({
  domain,
  checkable,
  verdict,
  ownNeighbour,
  price,
  tools,
  copy,
}: ZoneRowProps) {
  return (
    <li className={classes['zone']}>
      <span className={classes['domain']}>{domain}</span>
      {checkable ? (
        <VerdictLabel
          {...{ domain, verdict, ownNeighbour, price, tools, copy }}
        />
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
    clear,
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
  const verdicts = new Map([...shownVerdicts, ...hiddenVerdicts]);
  const siblings = rows.map(({ domain }) => domain);
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
          rightSection={
            typed === '' ? undefined : (
              <CloseButton
                aria-label={copy.clear}
                title={copy.clear}
                // Pressed, it would take the caret from the field it clears.
                onMouseDown={(event) => {
                  event.preventDefault();
                }}
                onClick={clear}
              />
            )
          }
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
              verdict={verdicts.get(row.domain)}
              tools={
                <CornerTools
                  {...pick(row, 'domain')}
                  name={label}
                  {...{ siblings, verdicts, prices, copy }}
                />
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
