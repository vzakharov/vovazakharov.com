'use client';

import { Button, Textarea, UnstyledButton } from '@mantine/core';
import { Copy as CopyIcon } from 'lucide-react';
import { useState } from 'react';

import { cx } from '@/kernel/shared/lib/class-names';

import { useChecker, type WithCopy } from '../../checker';
import { CornerTools, type Lookups, toolHolder } from '../../corner-tools';
import { type Group, grouped, parseLiked, useLikes } from '../../likes';
import { useVerdicts } from '../../verdict';
import classes from './unsquatted-home.module.scss';
import type { CopiedPrices } from './verdict-label';

/**
 * The most chips the folded list shows, and the fewer it shows below `sm` —
 * the stylesheet's `.chips` cut-offs.
 */
const SHOWN_CHIPS = 8;
const SHOWN_CHIPS_NARROW = 5;

type Copy = WithCopy['copy'];

const counted = (template: string, count: number) =>
  template.replace('{count}', String(count));

type ChipProps = WithCopy & Group & Lookups;

function Chip({ name, shown, domains, verdicts, prices, copy }: ChipProps) {
  const { checkNow } = useChecker();
  const siblings = domains.length - 1;
  const { siblings: plural } = copy.shortlist;

  return (
    <li
      className={cx(classes['chip'], toolHolder)}
      data-taken={verdicts.get(shown)?.state === 'taken'}
    >
      <button
        type="button"
        className={classes['chipName']}
        title={domains.join(', ')}
        onClick={() => {
          checkNow(name);
        }}
      >
        <span className={classes['domain']}>{shown}</span>
        {siblings > 0 && (
          <span className={classes['siblings']}>
            {counted(siblings === 1 ? plural.one : plural.other, siblings)}
          </span>
        )}
      </button>
      <CornerTools
        domain={shown}
        unlikes={domains}
        siblings={domains}
        heartOnHover
        {...{ name, verdicts, prices, copy }}
      />
    </li>
  );
}

type EditorProps = WithCopy & { close: () => void };

function Editor({ close, copy }: EditorProps) {
  const { liked, replace } = useLikes();
  const [text, setText] = useState(liked.join('\n'));
  const [invalid, setInvalid] = useState<string[]>([]);
  const words = copy.shortlist;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const parsed = parseLiked(text);

        setInvalid(parsed.invalid);
        if (parsed.invalid.length > 0) return;
        replace(parsed.liked);
        close();
      }}
    >
      <Textarea
        aria-label={words.editLabel}
        autosize
        minRows={4}
        maxRows={12}
        spellCheck={false}
        value={text}
        onChange={(event) => {
          setText(event.currentTarget.value);
        }}
        error={
          invalid.length > 0 &&
          words.invalid.replace('{lines}', invalid.join(', '))
        }
        classNames={{ input: classes['input'] }}
      />
      <div className={classes['editorButtons']}>
        <Button
          variant="default"
          leftSection={<CopyIcon size={14} />}
          onClick={() => {
            navigator.clipboard.writeText(text).catch(reportError);
          }}
        >
          {words.copy}
        </Button>
        <Button variant="default" onClick={close}>
          {words.cancel}
        </Button>
        <Button type="submit">{words.save}</Button>
      </div>
    </form>
  );
}

function heading(copy: Copy, count: number, kept: boolean) {
  return (
    <>
      {copy.shortlist.heading}{' '}
      <span className={classes['count']}>({count})</span>
      {!kept && (
        <span className={classes['notKept']}> · {copy.shortlist.notKept}</span>
      )}
    </>
  );
}

/**
 * The liked domains, one chip per name. Past `SHOWN_CHIPS` the rest fold
 * behind a toggle, and are looked up only once it is pointed at, focused or
 * opened, as the checker's own surplus zones are.
 */
export function Shortlist({ copy, prices }: CopiedPrices) {
  const { liked, kept } = useLikes();
  const [editing, setEditing] = useState(false);
  const [open, setOpen] = useState(false);
  const [wanted, setWanted] = useState(false);
  const groups = grouped(liked);
  const shownDomains = groups
    .slice(0, SHOWN_CHIPS)
    .flatMap(({ domains }) => domains);
  const hiddenDomains =
    open || wanted
      ? groups.slice(SHOWN_CHIPS).flatMap(({ domains }) => domains)
      : [];
  const shownVerdicts = useVerdicts(shownDomains);
  const hiddenVerdicts = useVerdicts(hiddenDomains);
  const verdicts = new Map([...shownVerdicts, ...hiddenVerdicts]);
  const words = copy.shortlist;

  if (liked.length === 0 && !editing) return null;

  return (
    <section aria-labelledby="shortlist">
      <div className={classes['shortlistHead']}>
        <h2 id="shortlist" className={classes['sectionHeading']}>
          {heading(copy, liked.length, kept)}
        </h2>
        {!editing && (
          <UnstyledButton
            className={classes['edit']}
            onClick={() => {
              setEditing(true);
            }}
          >
            {words.edit}
          </UnstyledButton>
        )}
      </div>
      {editing ? (
        <Editor
          close={() => {
            setEditing(false);
          }}
          {...{ copy }}
        />
      ) : (
        <>
          <ul className={classes['chips']} data-open={open}>
            {groups.map((group) => (
              <Chip
                key={group.name}
                {...group}
                {...{ verdicts, prices, copy }}
              />
            ))}
          </ul>
          {groups.length > SHOWN_CHIPS_NARROW && (
            <UnstyledButton
              className={classes['moreChips']}
              data-wide={groups.length > SHOWN_CHIPS}
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
              {open ? (
                words.fewer
              ) : (
                <>
                  <span className={classes['wideCount']}>
                    {counted(words.more, groups.length - SHOWN_CHIPS)}
                  </span>
                  <span className={classes['narrowCount']}>
                    {counted(words.more, groups.length - SHOWN_CHIPS_NARROW)}
                  </span>
                </>
              )}
            </UnstyledButton>
          )}
        </>
      )}
    </section>
  );
}
