import { PriceTypes, PricingLabels } from "./pricingManager";

const staticTranslations = {
  "day": "pro Tag",
  "once": "einmalig",
  "hour": "pro Stunde",
  "person": "pro Person",
  "personHour": "pro Person/Stunde",
  "consumption": "Mindestverzehr",
  "none": "kostenlos",
  "exact": "genau",
  "from": "ab",
} as const;

export const formatPrice = (price: number, pricingLabel?: PricingLabels): string => {
  const strPrice = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);

  if (pricingLabel && pricingLabel !== 'exact') {
    return `${staticTranslations[pricingLabel]} ${strPrice}`;
  }
  return strPrice;
};

export const translatePrices = (values: PriceTypes[]): string => {
  if (!values || values.length === 0) {
    return "-";
  }

  const translated = values.map((key) => {
    return staticTranslations[key];
  });

  return translated.join(", ");
};

export const translatePrice = (value: PriceTypes): string => {
  if (!value || value.length === 0) {
    return "-";
  }

  return staticTranslations[value];
};

export const formatPriceWithType = (
  price: number,
  priceType: PriceTypes,
  pricingLabel?: PricingLabels
): string => {
  if (!priceType || priceType.length === 0) {
    return formatPrice(price, pricingLabel);
  }

  // Ensure priceType exists in staticTranslations
  const translation = staticTranslations[priceType];

  if (priceType === "none") {
    return translation;
  }

  return `${formatPrice(price, pricingLabel)} ${translation}`;
};

export const translatePricingLabel = (value: PricingLabels): string => {
  if (!value || value.length === 0) {
    return "-";
  }

  return staticTranslations[value];
};