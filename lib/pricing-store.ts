import { promises as fs } from 'fs';
import path from 'path';
import { isSupabaseServerConfigured, supabaseServer } from '@/lib/supabase-server';
import { defaultPricingSettings, mergePricingSettings, PricingSettings } from '@/lib/pricing';

const SETTINGS_KEY = 'default';
const LOCAL_SETTINGS_PATH = path.join(process.cwd(), 'data', 'pricing-settings.json');

export type PricingRevision = {
  id: string;
  settings: PricingSettings;
  action: 'save' | 'restore';
  editorUsername: string;
  createdAt: string;
};

async function readLocalPricingSettings() {
  try {
    const contents = await fs.readFile(LOCAL_SETTINGS_PATH, 'utf8');
    return mergePricingSettings(JSON.parse(contents));
  } catch {
    return defaultPricingSettings;
  }
}

async function writeLocalPricingSettings(settings: PricingSettings) {
  await fs.mkdir(path.dirname(LOCAL_SETTINGS_PATH), { recursive: true });
  await fs.writeFile(LOCAL_SETTINGS_PATH, JSON.stringify(settings, null, 2));
}

export async function getPricingSettings(): Promise<PricingSettings> {
  if (isSupabaseServerConfigured() && supabaseServer) {
    try {
      const { data, error } = await supabaseServer
        .from('pricing_settings')
        .select('settings')
        .eq('key', SETTINGS_KEY)
        .single();

      if (!error && data?.settings) {
        return mergePricingSettings(data.settings as Partial<PricingSettings>);
      }
    } catch (error) {
      console.error('Pricing settings Supabase read failed:', error);
    }
  }

  return readLocalPricingSettings();
}

export async function savePricingSettings(input: PricingSettings): Promise<PricingSettings> {
  const settings = mergePricingSettings({
    ...input,
    updatedAt: new Date().toISOString(),
  });

  if (isSupabaseServerConfigured() && supabaseServer) {
    try {
      const { error } = await supabaseServer
        .from('pricing_settings')
        .upsert(
          {
            key: SETTINGS_KEY,
            settings,
            updated_at: settings.updatedAt,
          },
          { onConflict: 'key' }
        );

      if (!error) {
        const { error: historyError } = await supabaseServer
          .from('pricing_settings_history')
          .insert({
            settings,
            action: 'save',
            editor_username: 'admin',
          });

        if (historyError) {
          console.error('Pricing history save failed:', historyError);
        }

        return settings;
      }

      console.error('Pricing settings Supabase save failed:', error);
    } catch (error) {
      console.error('Pricing settings Supabase save failed:', error);
    }
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Pricing settings could not be saved because secure Supabase server access is not configured.');
  }

  await writeLocalPricingSettings(settings);
  return settings;
}

export async function getPricingHistory(): Promise<PricingRevision[]> {
  if (!isSupabaseServerConfigured() || !supabaseServer) return [];

  const { data, error } = await supabaseServer
    .from('pricing_settings_history')
    .select('id, settings, action, editor_username, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Pricing history fetch failed:', error);
    return [];
  }

  return (data || []).map((revision) => ({
    id: revision.id,
    settings: mergePricingSettings(revision.settings as Partial<PricingSettings>),
    action: revision.action === 'restore' ? 'restore' : 'save',
    editorUsername: revision.editor_username,
    createdAt: revision.created_at,
  }));
}
