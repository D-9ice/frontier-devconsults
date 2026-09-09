import 'server-only';
import { supabaseServer as db } from '@/lib/supabase-server';
import type { MailFolder, MailRemovalState } from '@/lib/admin-mail';

export async function mailRemovalState(folder: MailFolder, ids: string[]): Promise<MailRemovalState> {
  if (!db) throw new Error('Mail removal storage is unavailable');
  const state = await db.from('admin_mail_folder_state').select('cleared_before,preserve_subject').eq('folder', folder).maybeSingle();
  if (state.error) throw new Error('Mail removal state is unavailable');
  let removedIds: string[] = [];
  if (ids.length) {
    const removed = await db.from('admin_mail_removed').select('message_id').eq('folder', folder).in('message_id', ids);
    if (removed.error) throw new Error('Mail removal state is unavailable');
    removedIds = (removed.data || []).map(row => row.message_id);
  }
  return {
    clearedBefore: state.data?.cleared_before || null,
    preserveSubject: state.data?.preserve_subject || null,
    removedIds: new Set(removedIds),
  };
}

export async function removeMail(folder: MailFolder, id: string) {
  if (!db) throw new Error('Mail removal storage is unavailable');
  const { error } = await db.from('admin_mail_removed').upsert({ folder, message_id: id }, { onConflict: 'folder,message_id' });
  if (error) throw new Error('Unable to remove mail');
}
