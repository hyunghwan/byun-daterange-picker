# byun-daterange-picker

A full-featured React date range picker with preset sidebar, optional time &amp; timezone inputs, 3-click selection UX, and WCAG 2.2 AA accessibility.

**Demo:** [daterangepicker.sqncs.com](https://daterangepicker.sqncs.com)

---

## Features

- **Preset sidebar** — built-in presets (last 1 day, 2 days, 1 week, 1/2/3 months) with support for fully custom presets
- **3-click range selection** — first click anchors the start date with a dashed pending-range preview; second click commits the end date
- **Optional time inputs** — append editable `HH:mm:ss` fields to each date input with `showTime`
- **Optional timezone selector** — searchable timezone dropdown with `showTimezone`
- **Allow no date range** — "All dates" option to represent a null/cleared constraint
- **Controlled & uncontrolled** — works with or without external state
- **Date constraints** — `minDate` / `maxDate` to restrict selectable dates
- **Custom presets** — pass any `DateRangePreset[]` array
- **Custom date format** — any `date-fns` format string via `dateFormat`
- **WCAG 2.2 AA** — ARIA labels, live regions, keyboard navigation, focus management
- **`PresetDateRangePicker`** — lightweight variant: preset list → immediate apply, "Custom" opens 2-month calendar

---

## Installation

This is a **copy-paste component** (shadcn-style) — not an npm package. Clone this repo and copy the files you need into your project.

### 1. Copy the component files

```
components/ui/super-date-range-picker.tsx   ← main export
components/ui/calendar.tsx                   ← calendar + useThreeClickRangeState hook
components/ui/button.tsx
components/ui/popover.tsx
components/ui/command.tsx
components/ui/dialog.tsx
components/ui/input.tsx
components/ui/separator.tsx
components/ui/switch.tsx
lib/utils.ts
```

### 2. Install dependencies

```bash
npm install date-fns react-day-picker lucide-react cmdk \
  @radix-ui/react-popover @radix-ui/react-dialog \
  @radix-ui/react-separator @radix-ui/react-switch \
  @radix-ui/react-slot class-variance-authority \
  clsx tailwind-merge
```

### 3. Configure Tailwind CSS (v4)

Ensure your `app/globals.css` includes the design tokens used by the components. At minimum, define the semantic color variables (`--primary`, `--accent`, `--border`, etc.) and map them via `@theme inline`. See [`app/globals.css`](app/globals.css) in this repo for the full reference.

---

## Usage

### Basic (uncontrolled)

```tsx
import { SuperDateRangePicker } from "@/components/ui/super-date-range-picker";

export default function App() {
  return (
    <SuperDateRangePicker
      onApply={(range) => console.log(range)}
    />
  );
}
```

### Controlled

```tsx
import { useState } from "react";
import {
  SuperDateRangePicker,
  type SuperDateRangeValue,
} from "@/components/ui/super-date-range-picker";

export default function App() {
  const [range, setRange] = useState<SuperDateRangeValue>(null);

  return (
    <SuperDateRangePicker
      value={range}
      onApply={setRange}
    />
  );
}
```

### With time and timezone

```tsx
<SuperDateRangePicker
  showTime
  showTimezone
  onApply={(range) => console.log(range)}
/>
```

### Allow clearing the date filter

```tsx
<SuperDateRangePicker
  allowNoDateRange
  noDateRangeLabel="All time"
  onApply={(range) => {
    if (range === null) {
      // User chose "no date filter"
    } else {
      // range.from, range.to
    }
  }}
/>
```

### Custom presets

```tsx
import { startOfYear, subDays } from "date-fns";
import {
  SuperDateRangePicker,
  type DateRangePreset,
} from "@/components/ui/super-date-range-picker";

const myPresets: DateRangePreset[] = [
  {
    key: "ytd",
    label: "Year to date",
    getRange: () => ({ from: startOfYear(new Date()), to: new Date() }),
  },
  {
    key: "last90",
    label: "Last 90 days",
    getRange: () => ({ from: subDays(new Date(), 90), to: new Date() }),
  },
];

<SuperDateRangePicker
  presets={myPresets}
  defaultPreset="ytd"
  onApply={(range) => console.log(range)}
/>
```

### Lightweight variant: `PresetDateRangePicker`

```tsx
import { PresetDateRangePicker } from "@/components/ui/super-date-range-picker";

<PresetDateRangePicker
  defaultPreset="2months"
  onApply={(range) => console.log(range)}
/>
```

Presets apply immediately (no Apply/Cancel step). Selecting "Custom" opens a 2-month calendar; picking two dates auto-closes the popover.

---

## API Reference

### `SuperDateRangePicker`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `SuperDateRangeValue` | — | Controlled value. `null` = no date range. |
| `defaultValue` | `SuperDateRangeValue` | — | Initial value for uncontrolled mode. |
| `onApply` | `(value: SuperDateRangeValue) => void` | — | Called when the user confirms by clicking Apply. |
| `onChange` | `(value: SuperDateRangeValue) => void` | — | Called on every pending change before Apply. |
| `showPresets` | `boolean` | `true` | Show the preset sidebar. |
| `presets` | `DateRangePreset[]` | `DEFAULT_PRESETS` | Custom preset list. |
| `defaultPreset` | `string` | — | Key of the preset to activate initially. |
| `showTime` | `boolean` | `false` | Append HH:mm:ss time inputs. |
| `showTimezone` | `boolean` | `false` | Show a searchable timezone selector. |
| `timezone` | `string` | — | Controlled timezone (e.g. `"America/New_York"`). |
| `defaultTimezone` | `string` | local | Initial timezone for uncontrolled mode. |
| `onTimezoneChange` | `(tz: string) => void` | — | Called when the user selects a timezone. |
| `dateFormat` | `string` | `"dd-MMM-yyyy"` | `date-fns` format string for inputs and the trigger label. |
| `minDate` | `Date` | — | Earliest selectable date. |
| `maxDate` | `Date` | — | Latest selectable date. |
| `disabled` | `boolean` | `false` | Disables the trigger button. |
| `allowNoDateRange` | `boolean` | `false` | Adds an "All dates" option to clear the constraint. |
| `noDateRangeLabel` | `string` | `"All dates"` | Label for the null-range option. |
| `placeholder` | `string` | `"Select date range"` | Trigger placeholder text. |
| `triggerClassName` | `string` | — | Extra class names for the trigger button. |
| `triggerVariant` | `string` | `"outline"` | Button variant for the trigger. |
| `align` | `"start" \| "center" \| "end"` | `"start"` | Popover alignment relative to the trigger. |
| `open` | `boolean` | — | Controlled popover open state. |
| `onOpenChange` | `(open: boolean) => void` | — | Called when the popover open state changes. |
| `aria-label` | `string` | auto | Accessible label for the trigger button. |
| `aria-describedby` | `string` | — | ID of an element describing the picker. |
| `id` | `string` | — | ID forwarded to the trigger button. |
| `className` | `string` | — | Extra class names for the wrapper. |

### `PresetDateRangePicker`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `defaultPreset` | `string` | `"2months"` | Initial preset key. |
| `presets` | `DateRangePreset[]` | `DEFAULT_PRESETS` | Custom preset list. |
| `onApply` | `(value: SuperDateRangeValue) => void` | — | Called when the committed range changes. |
| `align` | `"start" \| "center" \| "end"` | `"start"` | Popover alignment. |
| `className` | `string` | — | Extra class names. |

### Types

```ts
// The value type — null means "no date filter"
type SuperDateRangeValue = DateRange | null;

// DateRange is from react-day-picker
// { from: Date | undefined; to: Date | undefined }

// A single preset entry
interface DateRangePreset {
  key: string;            // unique identifier
  label: string;          // displayed in the sidebar
  getRange: () => DateRange;  // called fresh on each use
}
```

### Exported constants

```ts
// Default preset list (can be used as a base for custom presets)
import { DEFAULT_PRESETS } from "@/components/ui/super-date-range-picker";

// Common timezone options for building custom timezone lists
import { TIMEZONE_OPTIONS } from "@/components/ui/super-date-range-picker";
```

### `useThreeClickRangeState` hook

The calendar's 3-click interaction is exposed as a standalone hook if you need it outside of the picker:

```ts
import { useThreeClickRangeState } from "@/components/ui/calendar";

const {
  anchorDate,       // Date | null — the first click anchor
  currentRange,     // DateRange | undefined — the current selection
  visibleRange,     // DateRange | undefined — includes hover preview
  setRange,         // set programmatically
  onDayClick,       // call on each calendar day click
  onDayHover,       // call on pointer enter
  clearHover,       // reset hover state
} = useThreeClickRangeState(initialRange);
```

---

## Accessibility

This component targets **WCAG 2.2 Level AA** compliance:

- **ARIA** — `role="dialog"` on the popover, `aria-haspopup`, `aria-expanded`, `aria-pressed` on preset buttons, `aria-live` region for screen reader announcements
- **Keyboard navigation** — Escape closes the popover and returns focus to the trigger; full keyboard navigation within the calendar
- **Focus management** — focus moves into the popover on open (to first preset or start input); returns to trigger on close/apply/cancel
- **Screen reader announcements** — applied range is announced via a polite live region

---

## Running the demo locally

```bash
git clone https://github.com/hyunghwan/byun-daterange-picker.git
cd byun-daterange-picker
npm install
npm run dev
# Open http://localhost:3000
```

---

## Built with

| Library | Version | Purpose |
|---------|---------|---------|
| [shadcn/ui](https://ui.shadcn.com) | — | UI component foundation |
| [Radix UI](https://radix-ui.com) | ^1.x | Accessible primitive components |
| [react-day-picker](https://react-day-picker.js.org) | ^9.11 | Calendar engine |
| [date-fns](https://date-fns.org) | ^4.1 | Date utilities |
| [cmdk](https://cmdk.paco.me) | ^1.1 | Command palette (timezone search) |
| [Tailwind CSS](https://tailwindcss.com) | ^4 | Utility-first CSS framework |
| [Lucide React](https://lucide.dev) | ^0.522 | Icon library |
| [class-variance-authority](https://cva.style) | ^0.7 | Component variant management |
| [tailwind-merge](https://github.com/dcastil/tailwind-merge) | ^3.3 | Smart Tailwind class merging |
| [clsx](https://github.com/lukeed/clsx) | ^2.1 | Conditional class names |

---

## License

[MIT](LICENSE) © 2025 Hyunghwan Byun

---

## Contributing

Contributions, issues, and feature requests are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.
