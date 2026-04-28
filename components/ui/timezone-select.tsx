"use client";

import { useMemo } from "react";
import Select, { type SingleValue, type StylesConfig } from "react-select";
import {
  formatTimezoneLabel,
  getTimezoneOptions,
  type TimezoneOption,
} from "@/lib/timezones";

interface TimezoneSelectProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  name?: string;
  className?: string;
  isDisabled?: boolean;
  error?: boolean;
}

const getSelectStyles = (hasError?: boolean): StylesConfig<TimezoneOption, false> => ({
  control: (base, state) => ({
    ...base,
    minHeight: "2.25rem",
    borderRadius: "0.375rem",
    borderColor: hasError
      ? "var(--destructive)"
      : state.isFocused
        ? "var(--ring)"
        : "var(--input)",
    backgroundColor: "var(--background)",
    boxShadow: hasError
      ? "0 0 0 1px var(--destructive)"
      : state.isFocused
        ? "0 0 0 1px var(--ring)"
        : "none",
    "&:hover": {
      borderColor: hasError
        ? "var(--destructive)"
        : state.isFocused
          ? "var(--ring)"
          : "var(--input)",
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
});

export function TimezoneSelect({
  value,
  onChange,
  placeholder = "Search timezone...",
  name,
  className,
  isDisabled,
  error,
}: TimezoneSelectProps) {
  const options = useMemo(() => getTimezoneOptions(), []);
  const menuPortalTarget = typeof document !== "undefined" ? document.body : undefined;
  const styles = useMemo(() => getSelectStyles(error), [error]);

  const selectedOption = useMemo(() => {
    if (!value) return null;
    const existing = options.find((option) => option.value === value);
    if (existing) return existing;

    const label = formatTimezoneLabel(value);
    return {
      value,
      label,
      searchTokens: [value.toLowerCase(), label.toLowerCase()],
    };
  }, [options, value]);

  const handleChange = (option: SingleValue<TimezoneOption>) => {
    onChange(option?.value);
  };

  return (
    <Select<TimezoneOption, false>
      inputId={name}
      instanceId={name || "timezone-select"}
      name={name}
      options={options}
      value={selectedOption}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
      isDisabled={isDisabled}
      isClearable
      styles={styles}
      menuPlacement="auto"
      menuPosition="fixed"
      maxMenuHeight={280}
      menuPortalTarget={menuPortalTarget}
      filterOption={(candidate, inputValue) => {
        const query = inputValue.trim().toLowerCase();
        if (!query) return true;
        return candidate.data.searchTokens.some((token) => token.includes(query));
      }}
      formatOptionLabel={(option) => (
        <div className="flex items-center justify-between gap-3">
          <span className="truncate">{option.label}</span>
          <span className="text-xs text-muted-foreground">{option.value}</span>
        </div>
      )}
      noOptionsMessage={() =>
        options.length === 0
          ? "Loading timezones..."
          : "No matching timezones found."
      }
    />
  );
}
