import { catalogue } from '@/kernel/shared/i18n';

import en from './messages/en.json';
import ru from './messages/ru.json';

export const homeMessages = catalogue<typeof en>({ en, ru });
