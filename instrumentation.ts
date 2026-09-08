export async function onRequestError(_error: unknown, request: { path: string }) {
  if(process.env.NEXT_RUNTIME!=='nodejs') return;
  if(request.path.startsWith('/api/monitoring') || request.path.startsWith('/api/admin/monitoring')) return;
  const { incident } = await import('./lib/monitoring');
  await incident('application-error', false);
}
