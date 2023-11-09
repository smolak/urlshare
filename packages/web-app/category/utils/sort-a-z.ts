export const sortAZ = (a: string, b: string) =>
  a.localeCompare(b, undefined, { numeric: true, ignorePunctuation: true });
