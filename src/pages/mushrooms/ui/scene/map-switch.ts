/** Whether the map is open: its button flips it, and the scene reads it. */
export class MapSwitch {
  private openNow = false;

  get open(): boolean {
    return this.openNow;
  }

  flip(): void {
    this.openNow = !this.openNow;
  }
}
