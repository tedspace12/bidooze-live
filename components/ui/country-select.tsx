"use client";

import { useEffect, useMemo } from "react";
import Select, { type StylesConfig, type SingleValue } from "react-select";
import { City, Country, State } from "country-state-city";

type SelectOption = {
  value: string;
  label: string;
  searchTokens: string[];
};

type CountryOption = SelectOption;
type StateOption = SelectOption & {
  countryIso2: string;
  stateIsoCode: string;
};

interface BaseSelectProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  name?: string;
  className?: string;
  isDisabled?: boolean;
}

interface StateSelectProps extends BaseSelectProps {
  countryIso2?: string;
}

const COUNTRY_OPTIONS: CountryOption[] = Country.getAllCountries()
  .map((country) => {
    const iso2 = country.isoCode?.trim().toUpperCase();
    const label = country.name?.trim();
    if (!iso2 || !label) return null;

    return {
      value: iso2,
      label,
      searchTokens: Array.from(
        new Set([country.name, country.isoCode].filter(Boolean).map((token) => String(token).toLowerCase()))
      ),
    };
  })
  .filter((country): country is CountryOption => Boolean(country))
  .sort((a, b) => a.label.localeCompare(b.label));

const COUNTRY_LOOKUP = COUNTRY_OPTIONS.reduce<Map<string, CountryOption>>((lookup, option) => {
  lookup.set(option.value, option);
  lookup.set(option.value.toLowerCase(), option);
  option.searchTokens.forEach((token) => lookup.set(token, option));
  return lookup;
}, new Map());

const buildStateCode = (countryIso2: string, stateIsoCode: string) =>
  `${countryIso2}-${stateIsoCode}`.toUpperCase();

const getStateIsoCode = (state?: string | null): string | undefined => {
  if (!state) return undefined;
  const trimmed = state.trim().toUpperCase();
  if (!trimmed) return undefined;

  const segments = trimmed.split("-");
  return segments[segments.length - 1];
};

export const normalizeCountryToIso2 = (value?: string | null): string | undefined => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  return (
    COUNTRY_LOOKUP.get(trimmed)?.value ||
    COUNTRY_LOOKUP.get(trimmed.toLowerCase())?.value ||
    COUNTRY_LOOKUP.get(trimmed.toUpperCase())?.value
  );
};

export const normalizeStateToIso31662 = (
  value?: string | null,
  countryIso2?: string | null
): string | undefined => {
  if (!value) return undefined;

  const normalizedCountry = normalizeCountryToIso2(countryIso2);
  if (!normalizedCountry) return undefined;

  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const stateLookup = State.getStatesOfCountry(normalizedCountry).reduce<Map<string, string>>((lookup, state) => {
    const isoCode = state.isoCode?.trim().toUpperCase();
    const stateName = state.name?.trim().toLowerCase();
    if (!isoCode) return lookup;

    const fullCode = buildStateCode(normalizedCountry, isoCode);
    lookup.set(fullCode, fullCode);
    lookup.set(isoCode, fullCode);
    if (stateName) {
      lookup.set(stateName, fullCode);
    }
    return lookup;
  }, new Map());

  const upperValue = trimmed.toUpperCase();
  const lowerValue = trimmed.toLowerCase();

  return stateLookup.get(upperValue) || stateLookup.get(lowerValue);
};

export const getCitySuggestions = (
  countryIso2?: string | null,
  stateCode?: string | null
): string[] => {
  const normalizedCountry = normalizeCountryToIso2(countryIso2);
  const normalizedState = normalizeStateToIso31662(stateCode, normalizedCountry);
  const stateIsoCode = getStateIsoCode(normalizedState);

  if (!normalizedCountry || !stateIsoCode) return [];

  const uniqueCities = new Set<string>();
  City.getCitiesOfState(normalizedCountry, stateIsoCode).forEach((city) => {
    const cityName = city.name?.trim();
    if (cityName) uniqueCities.add(cityName);
  });

  return Array.from(uniqueCities).sort((a, b) => a.localeCompare(b));
};

const mapStatesForCountry = (countryIso2?: string): StateOption[] => {
  if (!countryIso2) return [];

  return State.getStatesOfCountry(countryIso2)
    .map((state) => {
      const stateIsoCode = state.isoCode?.trim().toUpperCase();
      const label = state.name?.trim();
      if (!stateIsoCode || !label) return null;

      return {
        value: buildStateCode(countryIso2, stateIsoCode),
        label,
        countryIso2,
        stateIsoCode,
        searchTokens: Array.from(
          new Set([state.name, state.isoCode].filter(Boolean).map((token) => String(token).toLowerCase()))
        ),
      };
    })
    .filter((state): state is StateOption => Boolean(state))
    .sort((a, b) => a.label.localeCompare(b.label));
};

const selectStyles: StylesConfig<SelectOption, false> = {
  control: (base, state) => ({
    ...base,
    minHeight: "2.25rem",
    borderRadius: "0.375rem",
    borderColor: state.isFocused ? "var(--ring)" : "var(--input)",
    backgroundColor: "var(--background)",
    boxShadow: state.isFocused ? "0 0 0 1px var(--ring)" : "none",
    "&:hover": {
      borderColor: state.isFocused ? "var(--ring)" : "var(--input)",
    },
  }),
  valueContainer: (base) => ({
    ...base,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: "0.75rem",
    paddingRight: "0.75rem",
  }),
  input: (base) => ({
    ...base,
    color: "var(--foreground)",
    margin: 0,
    padding: 0,
  }),
  placeholder: (base) => ({
    ...base,
    color: "var(--muted-foreground)",
  }),
  singleValue: (base) => ({
    ...base,
    color: "var(--foreground)",
  }),
  menu: (base) => ({
    ...base,
    zIndex: 30,
    border: "1px solid var(--border)",
    borderRadius: "0.5rem",
    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.08)",
    backgroundColor: "var(--popover)",
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 90,
  }),
  menuList: (base) => ({
    ...base,
    paddingTop: "0.25rem",
    paddingBottom: "0.25rem",
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "var(--accent)"
      : state.isFocused
        ? "color-mix(in srgb, var(--accent) 40%, transparent)"
        : "transparent",
    color: "var(--foreground)",
    cursor: "pointer",
  }),
  indicatorSeparator: (base) => ({
    ...base,
    backgroundColor: "var(--border)",
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: "var(--muted-foreground)",
    "&:hover": {
      color: "var(--foreground)",
    },
  }),
  clearIndicator: (base) => ({
    ...base,
    color: "var(--muted-foreground)",
    "&:hover": {
      color: "var(--foreground)",
    },
  }),
  noOptionsMessage: (base) => ({
    ...base,
    color: "var(--muted-foreground)",
  }),
};

export function CountrySelect({
  value,
  onChange,
  placeholder = "Search country...",
  name,
  className,
  isDisabled,
}: BaseSelectProps) {
  const normalizedValue = useMemo(() => normalizeCountryToIso2(value), [value]);
  const menuPortalTarget = typeof document !== "undefined" ? document.body : undefined;

  const selectedOption = useMemo(() => {
    if (!normalizedValue) return null;
    return COUNTRY_OPTIONS.find((country) => country.value === normalizedValue) || null;
  }, [normalizedValue]);

  useEffect(() => {
    if (value == null) return;
    const trimmed = value.trim();

    if (!trimmed) {
      onChange(undefined);
      return;
    }

    if (!normalizedValue) {
      onChange(undefined);
      return;
    }

    if (trimmed !== normalizedValue) {
      onChange(normalizedValue);
    }
  }, [normalizedValue, onChange, value]);

  const handleChange = (option: SingleValue<SelectOption>) => {
    onChange(option?.value);
  };

  return (
    <Select<SelectOption, false>
      inputId={name}
      instanceId={name || "country-select"}
      name={name}
      options={COUNTRY_OPTIONS}
      value={selectedOption}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
      isDisabled={isDisabled}
      isClearable
      styles={selectStyles}
      menuPlacement="auto"
      menuPosition="fixed"
      maxMenuHeight={260}
      menuPortalTarget={menuPortalTarget}
      filterOption={(candidate, inputValue) => {
        const query = inputValue.trim().toLowerCase();
        if (!query) return true;
        return candidate.data.searchTokens.some((token) => token.includes(query));
      }}
      formatOptionLabel={(option) => (
        <div className="flex items-center justify-between gap-3">
          <span>{option.label}</span>
          <span className="text-xs text-muted-foreground">{option.value}</span>
        </div>
      )}
    />
  );
}

export function StateSelect({
  countryIso2,
  value,
  onChange,
  placeholder = "Search state...",
  name,
  className,
  isDisabled,
}: StateSelectProps) {
  const normalizedCountry = useMemo(() => normalizeCountryToIso2(countryIso2), [countryIso2]);
  const stateOptions = useMemo(() => mapStatesForCountry(normalizedCountry), [normalizedCountry]);
  const menuPortalTarget = typeof document !== "undefined" ? document.body : undefined;
  const normalizedValue = useMemo(
    () => normalizeStateToIso31662(value, normalizedCountry),
    [value, normalizedCountry]
  );

  const selectedOption = useMemo(() => {
    if (!normalizedValue) return null;
    return stateOptions.find((state) => state.value === normalizedValue) || null;
  }, [normalizedValue, stateOptions]);

  useEffect(() => {
    if (value == null) return;
    const trimmed = value.trim();

    if (!trimmed) {
      onChange(undefined);
      return;
    }

    if (!normalizedCountry) {
      onChange(undefined);
      return;
    }

    if (!normalizedValue) {
      onChange(undefined);
      return;
    }

    if (trimmed !== normalizedValue) {
      onChange(normalizedValue);
    }
  }, [normalizedCountry, normalizedValue, onChange, value]);

  const handleChange = (option: SingleValue<SelectOption>) => {
    onChange(option?.value);
  };

  const effectivePlaceholder = normalizedCountry ? placeholder : "Select country first...";

  return (
    <Select<SelectOption, false>
      inputId={name}
      instanceId={name || "state-select"}
      name={name}
      options={stateOptions}
      value={selectedOption}
      onChange={handleChange}
      placeholder={effectivePlaceholder}
      className={className}
      isDisabled={isDisabled || !normalizedCountry}
      isClearable
      styles={selectStyles}
      menuPlacement="auto"
      menuPosition="fixed"
      maxMenuHeight={260}
      menuPortalTarget={menuPortalTarget}
      filterOption={(candidate, inputValue) => {
        const query = inputValue.trim().toLowerCase();
        if (!query) return true;
        return candidate.data.searchTokens.some((token) => token.includes(query));
      }}
      formatOptionLabel={(option) => (
        <div className="flex items-center justify-between gap-3">
          <span>{option.label}</span>
          <span className="text-xs text-muted-foreground">{option.value}</span>
        </div>
      )}
      noOptionsMessage={() =>
        normalizedCountry
          ? "No states found for this country."
          : "Select a country to load states."
      }
    />
  );
}
