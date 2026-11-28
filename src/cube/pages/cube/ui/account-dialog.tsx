'use client';

import './mantine-sheets';

import {
  Button,
  FileButton,
  MantineProvider,
  Modal,
  Stack,
  Text,
} from '@mantine/core';
import { type DragEvent, useState } from 'react';

import { fillSlots } from '@/kernel/shared/i18n';
import { cx } from '@/kernel/shared/lib/class-names';
import type { WithOnClose } from '@/kernel/shared/typings';

import {
  create,
  type Held,
  type Identity,
  isPhrase,
  logIn,
  logOut,
  pastedPhrase,
} from '@/cube/features/account';

import type COPY from '../config/messages/en.json';
import { formatCubes } from '../lib/figures';
import classes from './cube.module.scss';
import { Cubes } from './cubes-mark';
import { downloadKey, keyFileName } from './key-file';

type WithCopy = { copy: (typeof COPY)['account'] };

type WithHeld = { held: Held };

/** The mark's spoken name. */
type WithCubes = { cubes: string };

type AccountDialogProps = WithOnClose &
  WithCopy &
  WithHeld &
  WithCubes & { opened: boolean };

type LoggedInProps = WithCopy & WithHeld & WithCubes & { identity: Identity };

/**
 * A new account, its key file downloading at once, or a login by the key
 * file, picked or dropped. The file's link logs in by itself when opened, so
 * nothing here takes it pasted.
 */
function LogIn({ copy }: WithCopy) {
  const [error, setError] = useState<string | null>(null);
  /** Whether a file is dragged over the drop zone. */
  const [over, setOver] = useState(false);
  const open = (file: File | null | undefined) => {
    if (!file) return;
    file.text().then(
      (text) => {
        const phrase = pastedPhrase(text);
        if (isPhrase(phrase)) logIn(phrase);
        else setError(copy.wrongKey);
      },
      (error_: unknown) => {
        setError(String(error_));
      },
    );
  };
  const drop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setOver(false);
    open(event.dataTransfer.files[0]);
  };
  return (
    <Stack gap="sm">
      <Button
        onClick={() => {
          downloadKey(create(), copy);
        }}
      >
        {copy.create}
      </Button>
      <FileButton onChange={open} accept="text/plain,.txt">
        {(props) => (
          <button
            type="button"
            className={cx(classes['keyDrop'], over && classes['keyDropOver'])}
            onDragOver={(event) => {
              event.preventDefault();
              setOver(true);
            }}
            onDragLeave={() => {
              setOver(false);
            }}
            onDrop={drop}
            {...props}
          >
            {copy.openKey}
            <span className={classes['keyDropHint']}>{copy.dropKey}</span>
          </button>
        )}
      </FileButton>
      {error !== null && (
        <Text size="sm" c="red">
          {error}
        </Text>
      )}
    </Stack>
  );
}

/** A logged-in account: what it holds, and the key file that keeps it. */
function LoggedIn({ held, copy, cubes, identity }: LoggedInProps) {
  return (
    <Stack gap="sm">
      <Text size="xl" fw={700}>
        <Cubes count={held.wallet.balance} label={cubes} />
      </Text>
      <Text size="sm">
        {fillSlots(copy.kept, { file: keyFileName(identity) })}
      </Text>
      {!held.storable && (
        <Text size="sm" c="dimmed">
          {copy.unstorable}
        </Text>
      )}
      <Button
        variant="light"
        onClick={() => {
          downloadKey(identity, copy);
        }}
      >
        {copy.downloadAgain}
      </Button>
      <Button variant="subtle" onClick={logOut}>
        {copy.logOut}
      </Button>
    </Stack>
  );
}

/**
 * The account dialog: logged out, a new account or a login; logged in, the
 * balance and the key file that proves it.
 */
export function AccountDialog({
  opened,
  held,
  copy,
  cubes,
  onClose,
}: AccountDialogProps) {
  const { identity, pending } = held;
  return (
    <MantineProvider forceColorScheme="dark">
      <Modal
        {...{ opened, onClose }}
        title={identity === null ? copy.titleOut : copy.titleIn}
        closeButtonProps={{ 'aria-label': copy.close }}
        centered
      >
        <Stack gap="sm">
          {identity === null && pending > 0 && (
            <Text fw={700}>
              {fillSlots(copy.pending, { count: formatCubes(pending) })}
            </Text>
          )}
          {identity === null ? (
            <LogIn {...{ copy }} />
          ) : (
            <LoggedIn {...{ held, copy, cubes, identity }} />
          )}
        </Stack>
      </Modal>
    </MantineProvider>
  );
}
