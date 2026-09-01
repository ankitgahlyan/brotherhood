/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

export interface CountryItem {
  name: string;
  code: number; // ISO 3166-1 numeric code
  alpha2: string;
  flag: string;
}

export const ISO_COUNTRIES: CountryItem[] = [
  { name: 'Global / None', code: 0, alpha2: 'GL', flag: '🌐' },
  { name: 'Afghanistan', code: 4, alpha2: 'AF', flag: '🇦🇫' },
  { name: 'Albania', code: 8, alpha2: 'AL', flag: '🇦🇱' },
  { name: 'Algeria', code: 12, alpha2: 'DZ', flag: '🇩🇿' },
  { name: 'Andorra', code: 20, alpha2: 'AD', flag: '🇦🇩' },
  { name: 'Angola', code: 24, alpha2: 'AO', flag: '🇦🇴' },
  { name: 'Argentina', code: 32, alpha2: 'AR', flag: '🇦🇷' },
  { name: 'Armenia', code: 51, alpha2: 'AM', flag: '🇦🇲' },
  { name: 'Australia', code: 36, alpha2: 'AU', flag: '🇦🇺' },
  { name: 'Austria', code: 40, alpha2: 'AT', flag: '🇦🇹' },
  { name: 'Azerbaijan', code: 31, alpha2: 'AZ', flag: '🇦🇿' },
  { name: 'Bahamas', code: 44, alpha2: 'BS', flag: '🇧🇸' },
  { name: 'Bahrain', code: 48, alpha2: 'BH', flag: '🇧🇭' },
  { name: 'Bangladesh', code: 50, alpha2: 'BD', flag: '🇧🇩' },
  { name: 'Barbados', code: 52, alpha2: 'BB', flag: '🇧🇧' },
  { name: 'Belarus', code: 112, alpha2: 'BY', flag: '🇧🇾' },
  { name: 'Belgium', code: 56, alpha2: 'BE', flag: '🇧🇪' },
  { name: 'Belize', code: 84, alpha2: 'BZ', flag: '🇧🇿' },
  { name: 'Benin', code: 204, alpha2: 'BJ', flag: '🇧🇯' },
  { name: 'Bhutan', code: 64, alpha2: 'BT', flag: '🇧🇹' },
  { name: 'Bolivia', code: 68, alpha2: 'BO', flag: '🇧🇴' },
  { name: 'Bosnia and Herzegovina', code: 70, alpha2: 'BA', flag: '🇧🇦' },
  { name: 'Botswana', code: 72, alpha2: 'BW', flag: '🇧🇼' },
  { name: 'Brazil', code: 76, alpha2: 'BR', flag: '🇧🇷' },
  { name: 'Brunei', code: 96, alpha2: 'BN', flag: '🇧🇳' },
  { name: 'Bulgaria', code: 100, alpha2: 'BG', flag: '🇧🇬' },
  { name: 'Burkina Faso', code: 854, alpha2: 'BF', flag: '🇧🇫' },
  { name: 'Burundi', code: 108, alpha2: 'BI', flag: '🇧🇮' },
  { name: 'Cambodia', code: 116, alpha2: 'KH', flag: '🇰🇭' },
  { name: 'Cameroon', code: 120, alpha2: 'CM', flag: '🇨🇲' },
  { name: 'Canada', code: 124, alpha2: 'CA', flag: '🇨🇦' },
  { name: 'Chile', code: 152, alpha2: 'CL', flag: '🇨🇱' },
  { name: 'China', code: 156, alpha2: 'CN', flag: '🇨🇳' },
  { name: 'Colombia', code: 170, alpha2: 'CO', flag: '🇨🇴' },
  { name: 'Congo', code: 178, alpha2: 'CG', flag: '🇨🇬' },
  { name: 'Costa Rica', code: 188, alpha2: 'CR', flag: '🇨🇷' },
  { name: 'Croatia', code: 191, alpha2: 'HR', flag: '🇭🇷' },
  { name: 'Cuba', code: 192, alpha2: 'CU', flag: '🇨🇺' },
  { name: 'Cyprus', code: 196, alpha2: 'CY', flag: '🇨🇾' },
  { name: 'Czech Republic', code: 203, alpha2: 'CZ', flag: '🇨🇿' },
  { name: 'Denmark', code: 208, alpha2: 'DK', flag: '🇩🇰' },
  { name: 'Dominican Republic', code: 214, alpha2: 'DO', flag: '🇩🇴' },
  { name: 'Ecuador', code: 218, alpha2: 'EC', flag: '🇪🇨' },
  { name: 'Egypt', code: 818, alpha2: 'EG', flag: '🇪🇬' },
  { name: 'El Salvador', code: 222, alpha2: 'SV', flag: '🇸🇻' },
  { name: 'Estonia', code: 233, alpha2: 'EE', flag: '🇪🇪' },
  { name: 'Ethiopia', code: 231, alpha2: 'ET', flag: '🇪🇹' },
  { name: 'Finland', code: 246, alpha2: 'FI', flag: '🇫🇮' },
  { name: 'France', code: 250, alpha2: 'FR', flag: '🇫🇷' },
  { name: 'Georgia', code: 268, alpha2: 'GE', flag: '🇬🇪' },
  { name: 'Germany', code: 276, alpha2: 'DE', flag: '🇩🇪' },
  { name: 'Ghana', code: 288, alpha2: 'GH', flag: '🇬🇭' },
  { name: 'Greece', code: 300, alpha2: 'GR', flag: '🇬🇷' },
  { name: 'Guatemala', code: 320, alpha2: 'GT', flag: '🇬🇹' },
  { name: 'Honduras', code: 340, alpha2: 'HN', flag: '🇭🇳' },
  { name: 'Hong Kong', code: 344, alpha2: 'HK', flag: '🇭🇰' },
  { name: 'Hungary', code: 348, alpha2: 'HU', flag: '🇭🇺' },
  { name: 'Iceland', code: 352, alpha2: 'IS', flag: '🇮🇸' },
  { name: 'India', code: 356, alpha2: 'IN', flag: '🇮🇳' },
  { name: 'Indonesia', code: 360, alpha2: 'ID', flag: '🇮🇩' },
  { name: 'Iran', code: 364, alpha2: 'IR', flag: '🇮🇷' },
  { name: 'Iraq', code: 368, alpha2: 'IQ', flag: '🇮🇶' },
  { name: 'Ireland', code: 372, alpha2: 'IE', flag: '🇮🇪' },
  { name: 'Israel', code: 376, alpha2: 'IL', flag: '🇮🇱' },
  { name: 'Italy', code: 380, alpha2: 'IT', flag: '🇮🇹' },
  { name: 'Jamaica', code: 388, alpha2: 'JM', flag: '🇯🇲' },
  { name: 'Japan', code: 392, alpha2: 'JP', flag: '🇯🇵' },
  { name: 'Jordan', code: 400, alpha2: 'JO', flag: '🇯🇴' },
  { name: 'Kazakhstan', code: 398, alpha2: 'KZ', flag: '🇰🇿' },
  { name: 'Kenya', code: 404, alpha2: 'KE', flag: '🇰🇪' },
  { name: 'Kuwait', code: 414, alpha2: 'KW', flag: '🇰🇼' },
  { name: 'Latvia', code: 428, alpha2: 'LV', flag: '🇱🇻' },
  { name: 'Lebanon', code: 422, alpha2: 'LB', flag: '🇱🇧' },
  { name: 'Lithuania', code: 440, alpha2: 'LT', flag: '🇱🇹' },
  { name: 'Luxembourg', code: 442, alpha2: 'LU', flag: '🇱🇺' },
  { name: 'Malaysia', code: 458, alpha2: 'MY', flag: '🇲🇾' },
  { name: 'Maldives', code: 462, alpha2: 'MV', flag: '🇲🇻' },
  { name: 'Malta', code: 470, alpha2: 'MT', flag: '🇲🇹' },
  { name: 'Mexico', code: 484, alpha2: 'MX', flag: '🇲🇽' },
  { name: 'Monaco', code: 492, alpha2: 'MC', flag: '🇲🇨' },
  { name: 'Mongolia', code: 496, alpha2: 'MN', flag: '🇲🇳' },
  { name: 'Morocco', code: 504, alpha2: 'MA', flag: '🇲🇦' },
  { name: 'Nepal', code: 524, alpha2: 'NP', flag: '🇳🇵' },
  { name: 'Netherlands', code: 528, alpha2: 'NL', flag: '🇳🇱' },
  { name: 'New Zealand', code: 554, alpha2: 'NZ', flag: '🇳🇿' },
  { name: 'Nigeria', code: 566, alpha2: 'NG', flag: '🇳🇬' },
  { name: 'Norway', code: 578, alpha2: 'NO', flag: '🇳🇴' },
  { name: 'Oman', code: 512, alpha2: 'OM', flag: '🇴🇲' },
  { name: 'Pakistan', code: 586, alpha2: 'PK', flag: '🇵🇰' },
  { name: 'Panama', code: 591, alpha2: 'PA', flag: '🇵🇦' },
  { name: 'Paraguay', code: 600, alpha2: 'PY', flag: '🇵🇾' },
  { name: 'Peru', code: 604, alpha2: 'PE', flag: '🇵🇪' },
  { name: 'Philippines', code: 608, alpha2: 'PH', flag: '🇵🇭' },
  { name: 'Poland', code: 616, alpha2: 'PL', flag: '🇵🇱' },
  { name: 'Portugal', code: 620, alpha2: 'PT', flag: '🇵🇹' },
  { name: 'Qatar', code: 634, alpha2: 'QA', flag: '🇶🇦' },
  { name: 'Romania', code: 642, alpha2: 'RO', flag: '🇷🇴' },
  { name: 'Russia', code: 643, alpha2: 'RU', flag: '🇷🇺' },
  { name: 'Saudi Arabia', code: 682, alpha2: 'SA', flag: '🇸🇦' },
  { name: 'Serbia', code: 688, alpha2: 'RS', flag: '🇷🇸' },
  { name: 'Singapore', code: 702, alpha2: 'SG', flag: '🇸🇬' },
  { name: 'Slovakia', code: 703, alpha2: 'SK', flag: '🇸🇰' },
  { name: 'Slovenia', code: 705, alpha2: 'SI', flag: '🇸🇮' },
  { name: 'South Africa', code: 710, alpha2: 'ZA', flag: '🇿🇦' },
  { name: 'South Korea', code: 410, alpha2: 'KR', flag: '🇰🇷' },
  { name: 'Spain', code: 724, alpha2: 'ES', flag: '🇪🇸' },
  { name: 'Sri Lanka', code: 144, alpha2: 'LK', flag: '🇱🇰' },
  { name: 'Sweden', code: 752, alpha2: 'SE', flag: '🇸🇪' },
  { name: 'Switzerland', code: 756, alpha2: 'CH', flag: '🇨🇭' },
  { name: 'Taiwan', code: 158, alpha2: 'TW', flag: '🇹🇼' },
  { name: 'Thailand', code: 764, alpha2: 'TH', flag: '🇹🇭' },
  { name: 'Tunisia', code: 788, alpha2: 'TN', flag: '🇹🇳' },
  { name: 'Turkey', code: 792, alpha2: 'TR', flag: '🇹🇷' },
  { name: 'Ukraine', code: 804, alpha2: 'UA', flag: '🇺🇦' },
  { name: 'United Arab Emirates', code: 784, alpha2: 'AE', flag: '🇦🇪' },
  { name: 'United Kingdom', code: 826, alpha2: 'GB', flag: '🇬🇧' },
  { name: 'United States', code: 840, alpha2: 'US', flag: '🇺🇸' },
  { name: 'Uruguay', code: 858, alpha2: 'UY', flag: '🇺🇾' },
  { name: 'Uzbekistan', code: 860, alpha2: 'UZ', flag: 'UZ' },
  { name: 'Venezuela', code: 862, alpha2: 'VE', flag: '🇻🇪' },
  { name: 'Vietnam', code: 704, alpha2: 'VN', flag: '🇻🇳' },
];

export function getCountryByCode(
  code: number | bigint | undefined | null,
): CountryItem {
  if (code === undefined || code === null) {
    return ISO_COUNTRIES[0];
  }
  const numeric = Number(code);
  const found = ISO_COUNTRIES.find((c) => c.code === numeric);
  if (found) return found;
  return {
    name: `Country #${numeric}`,
    code: numeric,
    alpha2: '??',
    flag: '🏳️',
  };
}

export function searchCountries(query: string): CountryItem[] {
  if (!query.trim()) return ISO_COUNTRIES;
  const q = query.toLowerCase().trim();
  return ISO_COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.alpha2.toLowerCase().includes(q) ||
      c.code.toString().includes(q),
  );
}
