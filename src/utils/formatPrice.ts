import { PriceTypes } from "@/constants/PriceTypes";

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
};

const staticTranslations = {
  "day": "pro Tag",
  "once": "einmalig",
  "hour": "pro Stunde",
  "person": "pro Person",
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