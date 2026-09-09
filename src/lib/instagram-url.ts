export function instagramUrl(value: string): string {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && ['instagram.com', 'www.instagram.com'].includes(url.hostname)
      && !url.username && !url.password && !url.port ? url.href : '';
  } catch { return ''; }
}
