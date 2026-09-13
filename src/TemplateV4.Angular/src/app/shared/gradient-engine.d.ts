export const typeNames: Record<string, string>;
export const defaultsByType: Record<string, Record<string, unknown>>;
export const presetsByType: Record<string, (Record<string, unknown> & { id: string })[]>;
export const defaultBlur: Record<string, number>;
export const defaultGrain: Record<string, number>;
export const initialTime: number;
export function grainTile(): HTMLCanvasElement;
export function paintGradient(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  stops: readonly string[],
  type: string,
  ...parameters: unknown[]
): void;
