export const roundToNext15 = (date: Date): Date => {
  // Rounding to the next 15-minute interval
  const minutes = date.getMinutes();
  const roundedMinutes = Math.ceil(minutes / 15) * 15;
  date.setMinutes(roundedMinutes);
  date.setSeconds(0);
  date.setMilliseconds(0);

  if (roundedMinutes === 60) {
    date.setHours(date.getHours() + 1);
    date.setMinutes(0);
  };

  return date;
};