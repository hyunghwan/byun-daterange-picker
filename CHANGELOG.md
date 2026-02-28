# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] — 2025-02-28

### Added

**`SuperDateRangePicker`** — full-featured date range picker component

- Preset sidebar with built-in presets: last 1 day, 2 days, 1 week, 1 month, 2 months, 3 months
- 2-month calendar with 3-click range selection UX:
  - First click anchors the start date (pending state with dashed range preview)
  - Second click commits the end date
  - Third click anywhere resets and starts a new selection
- Optional `showTime` — appends editable `HH:mm:ss` inputs to each date field
- Optional `showTimezone` — searchable timezone selector (10 common timezones + local)
- `allowNoDateRange` — "All dates" mode to represent a null/cleared date constraint
- Controlled (`value` + `onApply`) and uncontrolled (`defaultValue`) usage
- `onChange` for live preview before Apply is clicked
- Custom preset support via the `presets` prop
- Custom date format via `dateFormat` (any `date-fns` format string)
- Date constraints via `minDate` and `maxDate`
- Controlled popover open state via `open` + `onOpenChange`
- Controlled timezone via `timezone` + `onTimezoneChange`
- WCAG 2.2 Level AA accessibility:
  - `role="dialog"`, `aria-haspopup`, `aria-expanded` on the trigger
  - `aria-pressed` on preset buttons
  - `aria-live` polite region for screen reader announcements
  - Keyboard: Escape closes and returns focus; full calendar keyboard navigation
  - Focus moves to first preset (or start input) on open; returns to trigger on close

**`PresetDateRangePicker`** — lightweight preset-first variant

- Preset list as default view; immediate apply on selection (no Apply/Cancel step)
- "Custom" option switches to a 2-month calendar; auto-closes after two clicks
- Supports custom presets and `defaultPreset`

**`useThreeClickRangeState`** hook (exported from `calendar.tsx`)

- Manages 3-click anchor/commit range state with hover preview
- Can be used standalone with any custom calendar implementation

**Exported constants**

- `DEFAULT_PRESETS` — the six built-in preset entries
- `TIMEZONE_OPTIONS` — the default timezone list (can be used to extend or replace)

**Demo site** — interactive showcase at [daterangepicker.sqncs.com](https://daterangepicker.sqncs.com)

- All component variants with live pickers and applied value readouts
- Show/hide code snippets per demo
- Full API reference table
- Tech stack credits

### Dependencies

- `react` ^19.0.0
- `react-day-picker` ^9.11.1
- `date-fns` ^4.1.0
- `@radix-ui/react-popover` ^1.1.14
- `@radix-ui/react-dialog` ^1.1.14
- `@radix-ui/react-separator` ^1.1.7
- `@radix-ui/react-switch` ^1.3.6
- `@radix-ui/react-slot` ^1.2.3
- `cmdk` ^1.1.1
- `lucide-react` ^0.522.0
- `class-variance-authority` ^0.7.1
- `tailwind-merge` ^3.3.1
- `clsx` ^2.1.1
- `tailwindcss` ^4
