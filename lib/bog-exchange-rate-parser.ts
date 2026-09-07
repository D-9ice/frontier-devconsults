export type BankOfGhanaUsdRate = {
  rate: number;
  effectiveAt: string;
};

const months: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

const textContent = (html: string) => html
  .replace(/<[^>]+>/g, '')
  .replace(/&nbsp;|&#160;/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/\s+/g, ' ')
  .trim();

function parseEffectiveDate(value: string) {
  const match = /^(\d{1,2})\s+([A-Z][a-z]{2})\s+(\d{4})$/.exec(value);
  if (!match || months[match[2]] === undefined) throw new Error('Bank of Ghana returned an unrecognized effective date.');
  const date = new Date(Date.UTC(Number(match[3]), months[match[2]], Number(match[1])));
  if (!Number.isFinite(date.getTime())) throw new Error('Bank of Ghana returned an invalid effective date.');
  return date.toISOString();
}

export function parseBankOfGhanaUsdRate(html: string): BankOfGhanaUsdRate {
  for (const row of html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const cells = [...row[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map((cell) => textContent(cell[1]));
    if (cells.length < 6 || cells[2].toUpperCase() !== 'USDGHS') continue;
    const rate = Number(cells[5].replaceAll(',', ''));
    if (!Number.isFinite(rate) || rate < 0.1 || rate > 100) throw new Error('Bank of Ghana returned an implausible USD/GHS mid rate.');
    return { rate, effectiveAt: parseEffectiveDate(cells[0]) };
  }
  throw new Error('The Bank of Ghana USD/GHS rate row was not found.');
}
