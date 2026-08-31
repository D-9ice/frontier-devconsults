const base = (process.env.PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
const paths = ['/', '/services', '/projects', '/app-store', '/pricing', '/contact', '/upwork-portfolio', '/sitemap.xml'];
const failures = [];
for (const path of paths) {
  try {
    const response = await fetch(`${base}${path}`, { redirect: 'follow', signal: AbortSignal.timeout(12_000) });
    if (!response.ok) failures.push(`${path}: HTTP ${response.status}`);
  } catch (error) { failures.push(`${path}: ${error instanceof Error ? error.message : 'request failed'}`); }
}
if (failures.length) { console.error(`Public link validation failed:\n${failures.join('\n')}`); process.exitCode = 1; }
else console.log(`Validated ${paths.length} public routes at ${base}.`);
