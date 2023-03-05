export const validateDepartureDate = (index, dates) => {
  if (index === 0) {
    return true; // no validation needed for the first component
  }
  const previousDate = dates[index - 1];
  const currentDate = dates[index];
  return currentDate.isAfter(previousDate);
};
