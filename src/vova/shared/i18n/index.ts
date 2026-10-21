import { catalogue } from '@/kernel/shared/i18n';

import en from './messages/en.json';
import ru from './messages/ru.json';

export type VovaMessages = typeof en;

export const vovaMessages = catalogue<VovaMessages>({ en, ru });
