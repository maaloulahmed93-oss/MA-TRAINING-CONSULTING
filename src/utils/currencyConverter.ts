// Currency conversion utility with real exchange rates
// Base currency: EUR (Euro)

export interface ExchangeRates {
  [key: string]: number;
}

// Current exchange rates (updated 2024)
// 1 EUR = X currency
export const EXCHANGE_RATES: ExchangeRates = {
  '€': 1,        // Euro (base currency)
  '$': 1.08,     // US Dollar
  'TND': 3.35,   // Tunisian Dinar
};

// Currency symbols and names
export const CURRENCIES = {
  '€': { name: 'Euro', symbol: '€' },
  '$': { name: 'Dollar US', symbol: '$' },
  'TND': { name: 'Dinar Tunisien', symbol: 'TND' }
};

/**
 * Convert price from EUR to selected currency
 * @param priceInEur - Price in EUR (base currency)
 * @param targetCurrency - Target currency code
 * @returns Formatted price string
 */
export const convertPrice = (priceInEur: number, targetCurrency: string): string => {
  if (!priceInEur || priceInEur <= 0) {
    return "Prix sur demande";
  }

  const rate = EXCHANGE_RATES[targetCurrency] || 1;
  const convertedPrice = Math.round(priceInEur * rate);
  const currency = CURRENCIES[targetCurrency as keyof typeof CURRENCIES];
  
  if (!currency) {
    return `${priceInEur} €`;
  }

  // Format based on currency
  switch (targetCurrency) {
    case '$':
      return `$${convertedPrice}`;
    case 'TND':
      return `${convertedPrice} TND`;
    case '€':
    default:
      return `${convertedPrice}€`;
  }
};

/**
 * Get exchange rate for a currency
 * @param currency - Currency code
 * @returns Exchange rate
 */
export const getExchangeRate = (currency: string): number => {
  return EXCHANGE_RATES[currency] || 1;
};

/**
 * Convert price with detailed breakdown
 * @param priceInEur - Price in EUR
 * @param targetCurrency - Target currency
 * @returns Object with converted price and details
 */
export const convertPriceDetailed = (priceInEur: number, targetCurrency: string) => {
  const rate = getExchangeRate(targetCurrency);
  const convertedPrice = Math.round(priceInEur * rate);
  const currency = CURRENCIES[targetCurrency as keyof typeof CURRENCIES];
  
  return {
    originalPrice: priceInEur,
    convertedPrice,
    currency: currency?.name || 'Euro',
    symbol: currency?.symbol || '€',
    rate,
    formatted: convertPrice(priceInEur, targetCurrency)
  };
};
