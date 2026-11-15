import COPY from '../config/messages/en.json';
import { CubeCanvas } from './cube-canvas';

export function CubePage() {
  return <CubeCanvas {...COPY} />;
}
