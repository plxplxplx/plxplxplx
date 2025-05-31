// utils/slugify.ts
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9åäö\- ]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}
