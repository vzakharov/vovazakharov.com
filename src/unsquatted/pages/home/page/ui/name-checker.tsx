'use client';

import {
  ActionIcon,
  Button,
  CloseButton,
  TextInput,
  UnstyledButton,
} from '@mantine/core';
import { useState } from 'react';

import {
  type CopiedPrices,
  type Row,
  rowsFor,
  useChecker,
  useWords,
  zoneOf,
} from '../../checker';
import { FieldTools, TOOL_BUTTON } from '../../field-tools';
import { useVerdicts } from '../../verdict';
import {
  type CopiedPrice,
  type CopiedVerdict,
  OWN_DOMAIN,
  UncheckedLabel,
  VerdictLabel,
} from '../../verdict-label';
import { rollName } from '../lib/dice';
import { DiceIcon } from './dice-icon';
import classes from './unsquatted-home.module.scss';

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
        <UncheckedLabel text={copy.cantCheck} />
      )}
    </li>
  );
}

/**
 * The most rows the closed list shows — its first three lines, at its widest
 * in the stylesheet's `.zones`.
 */
const CLOSED_ROWS = 9;

const checkableDomains = (rows: readonly Row[]) =>
  rows.filter(({ checkable }) => checkable).map(({ domain }) => domain);

/**
 * A name checked in the zones once typing pauses — so the words on the way to
 * the one meant cost no lookups — or at once on Check. Only the first
 * `CLOSED_ROWS` rows are looked up; the rest wait until the toggle or the
 * share button is pointed at or focused, or the toggle opened, so a visitor who
 * reaches for neither costs the registries none of those lookups. On a
 * narrower screen the closed list shows fewer than that, and the surplus is
 * looked up all the same.
 */
export function NameChecker({ copy, prices }: CopiedPrices) {
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
  const looking =
    shownVerdicts.size < shownDomains.length ||
    hiddenVerdicts.size < hiddenDomains.length;
  const busy = (settling && typed.trim() !== '') || looking;

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
        {label !== '' && (
          <span className={classes['fieldTools']}>
            <FieldTools
              onReached={() => {
                setWanted(true);
              }}
              {...{ label, zone, siblings, verdicts, prices, looking, copy }}
            />
          </span>
        )}
        <ActionIcon
          type="button"
          variant="default"
          className={TOOL_BUTTON}
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
          disabled={typed.trim() === ''}
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
