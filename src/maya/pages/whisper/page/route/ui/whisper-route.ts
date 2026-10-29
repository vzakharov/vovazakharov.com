import { localeSegmentRoute } from '@/kernel/shared/i18n';

import { whisperMetadata } from '../../metadata';
import { WhisperPage } from '../../screen';

export const whisperRoute = localeSegmentRoute(WhisperPage, whisperMetadata);
