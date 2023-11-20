export const createPossessiveForm = (name: string): string => {
  const endsWithS = name.substring(name.length - 1).toLowerCase() === "s";

  return endsWithS ? `${name}'` : `${name}'s`;
};
