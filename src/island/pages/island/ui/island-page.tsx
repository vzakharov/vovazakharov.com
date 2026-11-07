import COPY from '../config/messages/en.json';
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
