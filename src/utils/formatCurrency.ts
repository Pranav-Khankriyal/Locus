export function formatCurrency(amount: number | null | undefined, currency: 'INR' | 'USD' = 'INR'): string {
  if (amount == null || Number.isNaN(Number(amount))) return '₹0';
  return new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

export function formatMonthLabel(ym: string): string {
  if (!ym || !/^\d{4}-\d{2}$/.test(ym)) return ym || '—';
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m - 1, 1);
  return new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(d);
}

const ONES = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen',
];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function twoDigits(n: number): string {
  if (n < 20) return ONES[n] || '';
  return `${TENS[Math.floor(n / 10)]}${n % 10 ? ' ' + ONES[n % 10] : ''}`;
}

export function amountToWordsINR(amount: number): string {
  const num = Math.round(Math.max(0, amount));
  if (num === 0) return 'Zero Rupees Only';

  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const hundred = Math.floor((num % 1000) / 100);
  const rest = num % 100;

  const parts: string[] = [];
  if (crore) parts.push(`${twoDigits(crore)} Crore`);
  if (lakh) parts.push(`${twoDigits(lakh)} Lakh`);
  if (thousand) parts.push(`${twoDigits(thousand)} Thousand`);
  if (hundred) parts.push(`${ONES[hundred]} Hundred`);
  if (rest) parts.push(`${twoDigits(rest)}`);

  return `${parts.join(' ')} Rupees Only`;
}

