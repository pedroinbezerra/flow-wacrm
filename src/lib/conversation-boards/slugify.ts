export function slugifyBoardValue(value: string, fallback: string): string {
  const cleaned = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned || fallback;
}

export function makeUniqueSlug(
  base: string,
  existingSlugs: readonly string[],
  fallback: string,
): string {
  const baseSlug = slugifyBoardValue(base, fallback);
  if (!existingSlugs.includes(baseSlug)) return baseSlug;

  let suffix = 2;
  while (existingSlugs.includes(`${baseSlug}-${suffix}`)) suffix += 1;
  return `${baseSlug}-${suffix}`;
}
