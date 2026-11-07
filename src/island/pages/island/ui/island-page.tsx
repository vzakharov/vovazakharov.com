import { COPY } from '../config/i18n';
import { ControlsHint } from './controls-hint';
import { IslandCanvas } from './island-canvas';

export function IslandPage() {
  return (
    <>
      <IslandCanvas label={COPY.canvas} />
      <ControlsHint />
    </>
  );
}
