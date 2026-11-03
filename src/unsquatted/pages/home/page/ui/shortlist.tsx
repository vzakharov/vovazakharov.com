'use client';

import { ActionIcon, Button, Textarea, UnstyledButton } from '@mantine/core';
import { Copy as CopyIcon, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { useCopied } from '@/shell/shared/ui';

import { useChecker, type WithCopy } from '../../checker';
import { nameOf, parseLiked, preferredOf, useLikes } from '../../likes';
import { useVerdicts } from '../../verdict';
import classes from './unsquatted-home.module.scss';
import type { CopiedVerdict } from './verdict-label';

/**
 * The most chips the folded list shows, and the fewer it shows below `sm` —
 * the stylesheet's `.chips` cut-offs.
 */
const SHOWN_CHIPS = 8;
const SHOWN_CHIPS_NARROW = 5;

type Copy = WithCopy['copy'];

const counted = (template: string, count: number) =>
  template.replace('{count}', String(count));

type ChipProps = CopiedVerdict & {
  /** The like as stored: a name, or the domain of it preferred. */
  like: string;
};

/**
 * One liked name, which a press puts in the checker as it was liked. A
 * preferred domain taken since, or pasted in taken, is struck through.
 */
function Chip({ like, verdict, copy }: ChipProps) {
  const { checkNow } = useChecker();
  const { unlike } = useLikes();

  return (
    <li className={classes['chip']} data-taken={verdict?.state === 'taken'}>
      <button
        type="button"
        className={classes['chipName']}
        onClick={() => {
          checkNow(like);
        }}
      >
        <span className={classes['domain']}>{like}</span>
      </button>
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

/** The domains `likes` prefer, which are all a chip looks up. */
const preferredAmong = (likes: readonly string[]) =>
  likes.flatMap((like) => preferredOf(like) ?? []);

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
 * The liked names, one chip each. A chip's preferred domain is looked up, so
 * one taken shows as taken; past `SHOWN_CHIPS` the rest fold behind a toggle,
 * and are looked up only once it is pointed at, focused or opened, as the
 * checker's own surplus zones are.
 */
export function Shortlist({ copy }: WithCopy) {
  const { liked, kept } = useLikes();
  const [editing, setEditing] = useState(false);
  const [open, setOpen] = useState(false);
  const [wanted, setWanted] = useState(false);
  const shownDomains = preferredAmong(liked.slice(0, SHOWN_CHIPS));
  const hiddenDomains =
    open || wanted ? preferredAmong(liked.slice(SHOWN_CHIPS)) : [];
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
            {liked.map((like) => (
              <Chip
                key={like}
                verdict={verdicts.get(like)}
                {...{ like, copy }}
              />
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
