'use client';

import {
  ActionIcon,
  Button,
  Textarea,
  Tooltip,
  UnstyledButton,
} from '@mantine/core';
import { Copy as CopyIcon, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { useCopied } from '@/shell/shared/ui';

import { useChecker, type WithCopy, zoneOf } from '../../checker';
import { nameOf, parseLiked, preferredOf, useLikes } from '../../likes';
import { useVerdicts, type Verdict, type WithVerdicts } from '../../verdict';
import {
  mainDomains,
  mainTaken,
  otherDomains,
  standingOf,
} from '../lib/standing';
import classes from './unsquatted-home.module.scss';

/**
 * The most chips the folded list shows, and the fewer it shows below `sm` —
 * the stylesheet's `.chips` cut-offs.
 */
const SHOWN_CHIPS = 8;
const SHOWN_CHIPS_NARROW = 5;

type Copy = WithCopy['copy'];

const counted = (template: string, count: number) =>
  template.replace('{count}', String(count));

/** `.com, .net and .io` of those domains. */
const zonesListed = (domains: readonly string[], and: string) => {
  const zones = domains.map((domain) => `.${zoneOf(domain)}`);

  return zones.length < 2
    ? zones.join('')
    : `${zones.slice(0, -1).join(', ')} ${and} ${zones.at(-1) ?? ''}`;
};

/**
 * What a chip shows for `like` on the answers in `verdicts`: the text, the
 * state its stylesheet keys on, and the hint naming why, if any. A preferred
 * domain stands alone; a bare name shows its first free main domain, or
 * stands out where every main one is taken.
 */
function shown(
  like: string,
  verdicts: ReadonlyMap<string, Verdict>,
  copy: Copy,
): { text: string; state: string; hint?: string } {
  const words = copy.shortlist;

  if (preferredOf(like) !== undefined) {
    return { text: like, state: verdicts.get(like)?.state ?? 'pending' };
  }

  const standing = standingOf(like, verdicts);

  if (standing.state === 'free') {
    return { text: standing.domain, state: 'free' };
  }
  if (standing.state === 'others') {
    return {
      text: like,
      state: 'others',
      hint: words.othersFree
        .replace('{main}', zonesListed(mainDomains(like), words.and))
        .replace('{free}', zonesListed(standing.free, words.and)),
    };
  }

  return standing.state === 'taken'
    ? { text: like, state: 'taken', hint: words.allTaken }
    : { text: like, state: 'pending' };
}

type ChipProps = WithCopy &
  WithVerdicts & {
    /** The like as stored: a name, or the domain of it preferred. */
    like: string;
  };

/**
 * One liked name, which a press puts in the checker as it was liked, shown as
 * `shown` reads it.
 */
function Chip({ like, verdicts, copy }: ChipProps) {
  const { checkNow } = useChecker();
  const { unlike } = useLikes();
  const { text, state, hint } = shown(like, verdicts, copy);

  return (
    <li className={classes['chip']} data-state={state}>
      <Tooltip label={hint} disabled={hint === undefined} multiline w={260}>
        <button
          type="button"
          className={classes['chipName']}
          aria-label={hint === undefined ? undefined : `${text}. ${hint}`}
          onClick={() => {
            checkNow(like);
          }}
        >
          <span className={classes['domain']}>{text}</span>
        </button>
      </Tooltip>
      <ActionIcon
        variant="subtle"
        size="sm"
        className={classes['remove']}
        aria-label={copy.unlike}
        title={copy.unlike}
        onClick={() => {
          unlike(nameOf(like));
        }}
      >
        <Trash2 size={14} />
      </ActionIcon>
    </li>
  );
}

type EditorProps = WithCopy & { close: () => void };

function Editor({ close, copy }: EditorProps) {
  const { liked, replace } = useLikes();
  const [text, setText] = useState(liked.join('\n'));
  const [invalid, setInvalid] = useState<string[]>([]);
  const { copied, copy: copyText } = useCopied();
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
        description={words.hint}
        inputWrapperOrder={['input', 'description', 'error']}
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
            copyText(text);
          }}
        >
          {copied ? copy.copied : words.copy}
        </Button>
        <Button variant="default" onClick={close}>
          {words.cancel}
        </Button>
        <Button type="submit">{words.save}</Button>
      </div>
    </form>
  );
}

/** What a like is looked up in first: its preferred domain, or its main ones. */
const firstAsked = (like: string) => {
  const preferred = preferredOf(like);

  return preferred === undefined ? mainDomains(like) : [preferred];
};

/**
 * The answers on `likes`: each looked up as `firstAsked` says, then — once
 * every first answer is in, so the second list is asked once — the bare names
 * whose main domains are all taken looked up in the other zones.
 */
function useStandings(likes: readonly string[]) {
  const first = likes.flatMap((like) => firstAsked(like));
  const firstVerdicts = useVerdicts(first);
  const second =
    firstVerdicts.size < new Set(first).size
      ? []
      : likes
          .filter(
            (like) =>
              preferredOf(like) === undefined &&
              mainTaken(like, firstVerdicts),
          )
          .flatMap((like) => otherDomains(like));
  const secondVerdicts = useVerdicts(second);

  return new Map([...firstVerdicts, ...secondVerdicts]);
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
 * The liked names, one chip each, looked up as `useStandings` says. Past
 * `SHOWN_CHIPS` the rest fold behind a toggle, and are looked up only once it
 * is pointed at, focused or opened, as the checker's own surplus zones are.
 */
export function Shortlist({ copy }: WithCopy) {
  const { liked, kept } = useLikes();
  const [editing, setEditing] = useState(false);
  const [open, setOpen] = useState(false);
  const [wanted, setWanted] = useState(false);
  const shownVerdicts = useStandings(liked.slice(0, SHOWN_CHIPS));
  const hiddenVerdicts = useStandings(
    open || wanted ? liked.slice(SHOWN_CHIPS) : [],
  );
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
            {liked.map((like) => (
              <Chip key={like} {...{ like, verdicts, copy }} />
            ))}
          </ul>
          {liked.length > SHOWN_CHIPS_NARROW && (
            <UnstyledButton
              className={classes['moreChips']}
              data-wide={liked.length > SHOWN_CHIPS}
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
                    {counted(words.more, liked.length - SHOWN_CHIPS)}
                  </span>
                  <span className={classes['narrowCount']}>
                    {counted(words.more, liked.length - SHOWN_CHIPS_NARROW)}
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
