export const SITE_ORIGIN = 'https://frontier-devconsults.com';
export const SITE_HOST = 'frontier-devconsults.com';

export function siteUrl(path = '/') {
  return new URL(path, `${SITE_ORIGIN}/`).toString();
}
