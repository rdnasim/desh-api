/** Canonical on-disk format for data files: 2-space JSON with a trailing newline. */
export function formatJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}
