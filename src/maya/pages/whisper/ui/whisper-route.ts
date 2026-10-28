import { localeSegmentRoute } from '@/kernel/shared/i18n';

import { whisperMetadata } from '../lib/whisper-metadata';
import { WhisperPage } from './whisper-page';

export const whisperRoute = localeSegmentRoute(WhisperPage, whisperMetadata);
