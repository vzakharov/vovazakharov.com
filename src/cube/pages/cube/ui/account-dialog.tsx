'use client';

import './mantine-sheets';

import {
  Button,
  FileButton,
  MantineProvider,
  Modal,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { type FormEvent, useState } from 'react';

import { fillSlots } from '@/kernel/shared/i18n';
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
 * A new account, its key file downloading at once, or a login: the key file
 * opened, or its words or link pasted.
 */
function LogIn({ copy }: WithCopy) {
  const [error, setError] = useState<string | null>(null);
  const tryKey = (text: string) => {
    const phrase = pastedPhrase(text);
    if (isPhrase(phrase)) logIn(phrase);
    else setError(copy.wrongKey);
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const pasted = new FormData(event.currentTarget).get('key');
    tryKey(typeof pasted === 'string' ? pasted : '');
  };
  const open = (file: File | null) => {
    if (file === null) return;
    file.text().then(tryKey, (error_: unknown) => {
      setError(String(error_));
    });
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
      <Text size="sm" c="dimmed">
        {copy.or}
      </Text>
      <FileButton onChange={open} accept="text/plain,.txt">
        {(props) => (
          <Button variant="light" {...props}>
            {copy.openKey}
          </Button>
        )}
      </FileButton>
      <form onSubmit={submit}>
        <Stack gap="xs">
          <TextInput
            name="key"
            label={copy.pasteKey}
            autoComplete="off"
            {...{ error }}
          />
          <Button type="submit" variant="subtle">
            {copy.logIn}
          </Button>
        </Stack>
      </form>
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
