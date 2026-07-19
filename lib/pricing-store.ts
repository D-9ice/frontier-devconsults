import { promises as fs } from 'fs';
import path from 'path';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { defaultPricingSettings, mergePricingSettings, PricingSettings } from '@/lib/pricing';

const SETTINGS_KEY = 'default';
const LOCAL_SETTINGS_PATH = path.join(process.cwd(), 'data', 'pricing-settings.json');

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
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
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

  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase
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
        return settings;
      }

      console.error('Pricing settings Supabase save failed:', error);
    } catch (error) {
      console.error('Pricing settings Supabase save failed:', error);
    }
  }

  await writeLocalPricingSettings(settings);
  return settings;
}
