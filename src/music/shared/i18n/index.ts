import { catalogue } from '@/kernel/shared/i18n';

import en from './messages/en.json';
import ru from './messages/ru.json';

export type MusicMessages = typeof en;

export const musicMessages = catalogue<MusicMessages>({ en, ru });
