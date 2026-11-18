'use client';

import './mantine-sheets';

import {
  Button,
  CopyButton,
  Group,
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
  loginLink,
  logOut,
  pastedPhrase,
  setRemembered,
} from '@/cube/features/account';

import type COPY from '../config/messages/en.json';
import { formatCubes } from '../lib/figures';
import { Cubes } from './cubes-mark';

type WithCopy = { copy: (typeof COPY)['account'] };

type WithHeld = { held: Held };

/** The mark's spoken name. */
type WithCubes = { cubes: string };

type AccountDialogProps = WithOnClose &
  WithCopy &
  WithHeld &
  WithCubes & { opened: boolean };

type CopyableProps = WithCopy & { value: string };

type LoggedInProps = WithCopy & WithHeld & WithCubes & { identity: Identity };

/** A form field's text, empty where the form has none. */
const fieldOf = (form: FormData, name: string): string => {
  const value = form.get(name);
  return typeof value === 'string' ? value.trim() : '';
};

/** `value` with a button that copies it. */
function Copyable({ value, copy }: CopyableProps) {
  return (
    <CopyButton {...{ value }}>
      {({ copied, copy: onCopy }) => (
        <Button variant="light" size="xs" onClick={onCopy}>
          {copied ? copy.copied : copy.copy}
        </Button>
      )}
    </CopyButton>
  );
}

/**
 * A new account, or the login form: twelve words or a login link carrying
 * them, which the id is derived from. The id's field is hidden but kept, so a
 * password manager can pick the saved login it belongs to.
 */
function LogIn({ copy }: WithCopy) {
  const [error, setError] = useState<string | null>(null);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const phrase = pastedPhrase(
      fieldOf(new FormData(event.currentTarget), 'phrase'),
    );
    if (!isPhrase(phrase)) {
      setError(copy.wrongWords);
      return;
    }
    logIn(phrase);
  };
  return (
    <Stack gap="sm">
      <Button onClick={create}>{copy.create}</Button>
      <Text size="sm" c="dimmed">
        {copy.or}
      </Text>
      <form onSubmit={submit}>
        <Stack gap="xs">
          <input
            name="id"
            aria-label={copy.id}
            autoComplete="username"
            hidden
          />
          <TextInput
            name="phrase"
            type="password"
            label={copy.pasted}
            autoComplete="current-password"
            {...{ error }}
          />
          <Button type="submit" variant="light">
            {copy.logIn}
          </Button>
        </Stack>
      </form>
    </Stack>
  );
}

/** A logged-in account: what it holds, and the four ways to keep its words. */
function LoggedIn({ held, copy, cubes, identity }: LoggedInProps) {
  const [saved, setSaved] = useState(false);
  const link = loginLink(
    `${globalThis.location.origin}${globalThis.location.pathname}`,
    identity.phrase,
  );
  // A browser offers to save a login once its form is submitted and gone.
  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaved(true);
  };
  return (
    <Stack gap="sm">
      <Text size="xl" fw={700}>
        <Cubes count={held.wallet.balance} label={cubes} />
      </Text>
      <Text size="sm">{copy.secret}</Text>
      {saved ? (
        <Text size="sm" c="dimmed">
          {copy.saved}
        </Text>
      ) : (
        <form onSubmit={save}>
          <Stack gap="xs">
            <TextInput
              name="id"
              label={copy.id}
              value={identity.id}
              autoComplete="username"
              readOnly
            />
            <TextInput
              name="phrase"
              label={copy.phrase}
              value={identity.phrase}
              autoComplete="new-password"
              readOnly
            />
            <Group gap="xs">
              <Copyable value={identity.phrase} {...{ copy }} />
              <Button type="submit" variant="light" size="xs">
                {copy.save}
              </Button>
            </Group>
          </Stack>
        </form>
      )}
      {held.storable ? (
        <Group gap="xs">
          <Button
            variant="light"
            size="xs"
            onClick={() => {
              setRemembered(!held.remembered);
            }}
          >
            {held.remembered ? copy.forget : copy.remember}
          </Button>
          {held.remembered && (
            <Text size="sm" c="dimmed">
              {copy.remembered}
            </Text>
          )}
        </Group>
      ) : (
        <Text size="sm" c="dimmed">
          {copy.unstorable}
        </Text>
      )}
      <TextInput label={copy.link} value={link} readOnly />
      <Group gap="xs">
        <Copyable value={link} {...{ copy }} />
        <Text size="xs" c="dimmed">
          {copy.linkWarning}
        </Text>
      </Group>
      <Button variant="subtle" onClick={logOut}>
        {copy.logOut}
      </Button>
    </Stack>
  );
}

/**
 * The account dialog: logged out, a new account or a login; logged in, the
 * balance and every way to keep the twelve words that prove it.
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
