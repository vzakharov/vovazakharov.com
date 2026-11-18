'use client';

import './mantine-sheets';

import { Button, MantineProvider, Modal, Stack, Text } from '@mantine/core';

import { fillSlots } from '@/kernel/shared/i18n';
import type { WithOnClose } from '@/kernel/shared/typings';

import { ROOM_HEIGHT } from '@/cube/shared/lib/room-shape';
import { priceOf, type Signed } from '@/cube/entities/world';

import type COPY from '../config/messages/en.json';
import { formatLength } from '../lib/figures';
import { Cubes } from './cubes-mark';

/** Floor 1's room side, in metres; each floor's is half the one above's. */
const FLOOR_ONE_SIDE = 5;

/** What the player can pay with, and how they pay. */
type Paying = {
  /** The кубики the player holds; null while nobody is logged in. */
  balance: number | null;
  /** Buys the room on offer. */
  onBuy: () => void;
  copy: (typeof COPY)['offer'];
};

type SaleOfferProps = WithOnClose &
  Paying & {
    /** The room whose sign was pressed; null while no offer is open. */
    offer: Signed | null;
  };

type PurseProps = Paying & { price: number };

/** What the player holds against `price`, and the Buy button it allows. */
function Purse({ balance, price, onBuy, copy }: PurseProps) {
  const enough = balance !== null && balance >= price;
  return (
    <>
      {balance !== null && (
        <Text>
          {fillSlots(copy.held, {
            balance: <Cubes count={balance} label={copy.cubes} />,
          })}
        </Text>
      )}
      {!enough && (
        <Text size="sm" c="dimmed">
          {balance === null ? copy.nobody : copy.short}
        </Text>
      )}
      <Button onClick={onBuy} disabled={!enough}>
        {copy.buy}
      </Button>
    </>
  );
}

/**
 * The offer a room's sign opens: its floor, size and price in кубики, and a
 * Buy button the player's balance allows. A room already bought shows the
 * same facts as the viewer's own.
 */
export function SaleOffer({
  offer,
  balance,
  onBuy,
  onClose,
  copy,
}: SaleOfferProps) {
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
                price: <Cubes count={priceOf(floor)} label={copy.cubes} />,
              })}
            </Text>
            <Text c="dimmed">
              {fillSlots(copy.size, {
                side: formatLength(side),
                height: formatLength(side * ROOM_HEIGHT),
              })}
            </Text>
            {!yours && (
              <Purse price={priceOf(floor)} {...{ balance, onBuy, copy }} />
            )}
            <Text size="sm" c="dimmed">
              {copy.demo}
            </Text>
          </Stack>
        )}
      </Modal>
    </MantineProvider>
  );
}
