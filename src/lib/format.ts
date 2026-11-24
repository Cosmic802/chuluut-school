/** Formats a date as YYYY.MM.DD without relying on locale data. */
export function formatDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}.${p(d.getUTCMonth() + 1)}.${p(d.getUTCDate())}`;
}

export function toDateInput(d: Date): string {
  return d.toISOString().slice(0, 10);
}
