import { catalogue } from '@/kernel/shared/i18n';

import en from './messages/en.json';
import ru from './messages/ru.json';

export type Messages = typeof en;

export const whisperMessages = catalogue<Messages>({ en, ru });
