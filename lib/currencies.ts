export type CurrencyOption = {
  value: string;
  label: string;
  searchTokens: string[];
};

let cachedCurrencyCodes: string[] | null = null;
let cachedCurrencyOptions: CurrencyOption[] | null = null;

const toTitleCase = (value: string) =>
  value
    .split(" ")
    .filter(Boolean)
    .map((word) => {
      if (/^[A-Z]{2,}$/.test(word)) return word;
      return `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`;
    })
    .join(" ");

const singularizeLastWord = (value: string) => {
  const words = value.split(" ").filter(Boolean);
  if (words.length === 0) return value;

  const lastIndex = words.length - 1;
  const lastWord = words[lastIndex];
  if (/^[A-Za-z]+s$/i.test(lastWord) && !/ss$/i.test(lastWord)) {
    words[lastIndex] = lastWord.slice(0, -1);
  }

  return words.join(" ");
};

const extractCurrencyName = (currencyCode: string): string => {
  try {
    const formatter = new Intl.NumberFormat("en", {
      style: "currency",
      currency: currencyCode,
      currencyDisplay: "name",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    const parts = formatter.formatToParts(1);
    const currencyPart = parts.find((part) => part.type === "currency")?.value?.trim();
    if (currencyPart) {
      return toTitleCase(singularizeLastWord(currencyPart.replace(/\s+/g, " ").trim()));
    }

    const formatted = formatter.format(1);
    const stripped = formatted.replace(/[\d.,\s\u00A0-]/g, " ").replace(/\s+/g, " ").trim();
    if (!stripped) return currencyCode;

    return toTitleCase(singularizeLastWord(stripped));
  } catch {
    return currencyCode;
  }
};

export const getSupportedCurrencyCodes = (): string[] => {
  if (cachedCurrencyCodes) return cachedCurrencyCodes;

  const supportedValuesOf =
    typeof Intl === "undefined"
      ? undefined
      : (Intl as typeof Intl & { supportedValuesOf?: (key: string) => string[] }).supportedValuesOf;

  if (typeof supportedValuesOf !== "function") {
    cachedCurrencyCodes = [];
    return cachedCurrencyCodes;
  }

  try {
    const values = supportedValuesOf("currency");
    cachedCurrencyCodes = Array.from(
      new Set(values.filter((value) => typeof value === "string" && value.trim().length > 0))
    ).sort((a, b) => a.localeCompare(b));
  } catch {
    cachedCurrencyCodes = [];
  }

  return cachedCurrencyCodes;
};

export const getCurrencyLabel = (currencyCode: string): string => extractCurrencyName(currencyCode);

export const getCurrencyOptions = (): CurrencyOption[] => {
  if (cachedCurrencyOptions) return cachedCurrencyOptions;

  cachedCurrencyOptions = getSupportedCurrencyCodes()
    .map((currencyCode) => {
      const label = getCurrencyLabel(currencyCode);
      return {
        value: currencyCode,
        label,
        searchTokens: [currencyCode.toLowerCase(), label.toLowerCase()],
      };
    })
    .sort((a, b) => {
      const byLabel = a.label.localeCompare(b.label);
      if (byLabel !== 0) return byLabel;
      return a.value.localeCompare(b.value);
    });

  return cachedCurrencyOptions;
};

