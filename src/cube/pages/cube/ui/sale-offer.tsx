'use client';

// The cube's route has no Mantine root of its own, so the offer brings its
// provider and the sheets of what it renders, in Mantine's own order
// (`.claude/rules/styling.md`). They are the unlayered halves on purpose: a
// module the shell's theme provider also imports becomes a CSS chunk Next
// shares between the two, linked on every shell page after the shell's own,
// which loads `Button` after `Title` there.
import '@mantine/core/styles/baseline.css';
import '@mantine/core/styles/default-css-variables.css';
import '@mantine/core/styles/global.css';
import '@mantine/core/styles/UnstyledButton.css';
import '@mantine/core/styles/Paper.css';
import '@mantine/core/styles/Overlay.css';
import '@mantine/core/styles/CloseButton.css';
import '@mantine/core/styles/ModalBase.css';
import '@mantine/core/styles/Text.css';
import '@mantine/core/styles/Button.css';
import '@mantine/core/styles/Modal.css';
import '@mantine/core/styles/Stack.css';

import { Button, MantineProvider, Modal, Stack, Text } from '@mantine/core';

import { fillSlots } from '@/kernel/shared/i18n';
import type { WithOnClose } from '@/kernel/shared/typings';

import { priceOf, ROOM_HEIGHT, type Signed } from '@/cube/entities/world';

import type COPY from '../config/messages/en.json';
import { formatLength, formatPrice } from '../lib/figures';

/** Floor 1's room side, in metres; each floor's is half the one above's. */
const FLOOR_ONE_SIDE = 5;

type SaleOfferProps = WithOnClose & {
  /** The room whose sign was pressed; null while no offer is open. */
  offer: Signed | null;
  /** Marks the room on offer bought. */
  onBuy: () => void;
  copy: (typeof COPY)['offer'];
};

/**
 * The offer a room's sign opens: its floor, size and price, and a Buy button
 * that charges nothing and makes the room the viewer's until the page reloads.
 * A room already bought shows the same facts as the viewer's own.
 */
export function SaleOffer({ offer, onBuy, onClose, copy }: SaleOfferProps) {
  const floor = offer?.room.n ?? null;
  const yours = offer?.sign.kind === 'yours';
  const side = floor === null ? 0 : FLOOR_ONE_SIDE / 2 ** (floor - 1);
  return (
    <MantineProvider forceColorScheme="dark">
      <Modal
        opened={floor !== null}
        {...{ onClose }}
        title={fillSlots(yours ? copy.titleYours : copy.title, { floor })}
        closeButtonProps={{ 'aria-label': copy.close }}
        centered
      >
        {floor !== null && (
          <Stack gap="sm">
            <Text size="xl" fw={700}>
              {fillSlots(yours ? copy.paid : copy.price, {
                price: formatPrice(priceOf(floor)),
              })}
            </Text>
            <Text c="dimmed">
              {fillSlots(copy.size, {
                side: formatLength(side),
                height: formatLength(side * ROOM_HEIGHT),
              })}
            </Text>
            {!yours && <Button onClick={onBuy}>{copy.buy}</Button>}
            <Text size="sm" c="dimmed">
              {copy.demo}
            </Text>
          </Stack>
        )}
      </Modal>
    </MantineProvider>
  );
}
