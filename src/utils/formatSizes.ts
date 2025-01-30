export const formatRoomSize = (
  sizeInSqM: number,
  locale: string = 'de-DE'
): string => {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'decimal',
    maximumFractionDigits: 2
  });

  return `${formatter.format(sizeInSqM)} m²`;
};