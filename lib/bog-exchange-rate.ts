import 'server-only';

import { parseBankOfGhanaUsdRate, type BankOfGhanaUsdRate } from '@/lib/bog-exchange-rate-parser';

export const BANK_OF_GHANA_FX_URL = 'https://www.bog.gov.gh/treasury-and-the-markets/daily-interbank-fx-rates/';
export const BANK_OF_GHANA_SOURCE_LABEL = 'Bank of Ghana Daily Interbank FX Rates (USD/GHS mid rate)';

export async function fetchBankOfGhanaUsdRate(): Promise<BankOfGhanaUsdRate> {
  const response = await fetch(BANK_OF_GHANA_FX_URL, {
    headers: { Accept: 'text/html', 'User-Agent': 'Frontier-DevConsults-Pricing/1.0' },
    next: { revalidate: 21_600 },
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) throw new Error(`Bank of Ghana rate request failed with HTTP ${response.status}.`);
  const parsed = parseBankOfGhanaUsdRate(await response.text());
  const effective = Date.parse(parsed.effectiveAt);
  if (effective > Date.now() + 86_400_000) throw new Error('Bank of Ghana returned a future effective date.');
  return parsed;
}
