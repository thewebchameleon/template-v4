/** Bound CPU pixel work independently of the display's size and pixel density. */
export class GradientQuality {
  private readonly expensive: boolean;
  private readonly preserveDetail: boolean;
  private scale = 1;
  private samples = 0;
  private cost = 0;

  constructor(
    type: string,
    private readonly thumbnail: boolean,
  ) {
    // Flow's per-pixel CPU cost was benchmarked. Other types retain their original
    // starting resolution rather than assuming they share the same bottleneck.
    this.expensive = type === 'FLOW';
    this.preserveDetail = type === 'SKY' || type === 'AURORA';
  }

  dimensions(width: number, height: number, pixelRatio: number): [number, number] {
    if (width <= 0 || height <= 0) return [0, 0];
    const edge = this.thumbnail || this.expensive ? 240 : 960;
    const pixels = this.expensive ? 240 * 135 : edge * edge;
    const ratio = Math.min(
      pixelRatio || 1,
      (edge * this.scale) / Math.max(width, height),
      Math.sqrt((pixels * this.scale * this.scale) / (width * height)),
    );
    return [Math.max(1, Math.round(width * ratio)), Math.max(1, Math.round(height * ratio))];
  }

  record(milliseconds: number): void {
    // These renderers need their original resolution for large-screen detail.
    if (this.preserveDetail) return;
    this.cost += milliseconds;
    this.samples++;
    // React immediately to long frames; otherwise average to avoid reacting to timing noise.
    if (milliseconds < 33 && this.samples < 8) return;
    const average = this.cost / this.samples;
    if (average > 12) {
      // Leave most of the 33ms frame interval available for interaction. Only decrease
      // during this session so quality cannot oscillate on a device near the budget.
      this.scale = Math.max(
        this.expensive ? 0.4 : 0.75,
        this.scale * Math.max(0.5, Math.sqrt(10 / average)),
      );
    }
    this.samples = 0;
    this.cost = 0;
  }
}
