"use client";

import * as React from "react";
import {
	format,
	isValid,
	parse,
	subDays,
	subMonths,
} from "date-fns";
import type { DateRange } from "react-day-picker";
import {
	CalendarIcon,
	Check,
	ChevronDown,
	ChevronsUpDown,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar, useThreeClickRangeState } from "@/components/ui/calendar";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A single preset option that produces a DateRange. */
export interface DateRangePreset {
	/** Unique key for this preset (used for matching and defaultPreset). */
	key: string;
	/** Display label shown in the sidebar. */
	label: string;
	/** Returns the date range for this preset (called fresh on each use). */
	getRange: () => DateRange;
}

/** The committed value type. `null` means "no date filter" (allowNoDateRange). */
export type SuperDateRangeValue = DateRange | null;

export interface SuperDateRangePickerProps {
	// -------------------------------------------------------------------------
	// Value / state — supports both controlled and uncontrolled
	// -------------------------------------------------------------------------

	/** Controlled value. Pass `null` to represent "no date range" (requires `allowNoDateRange`). */
	value?: SuperDateRangeValue;
	/** Initial value for uncontrolled mode. */
	defaultValue?: SuperDateRangeValue;
	/**
	 * Called when the user confirms a selection by clicking Apply.
	 * `null` means the user chose "no date range".
	 */
	onApply?: (value: SuperDateRangeValue) => void;
	/**
	 * Called on every pending calendar/input change before Apply is clicked.
	 * Use this for live previews; `onApply` is the canonical commit callback.
	 */
	onChange?: (value: SuperDateRangeValue) => void;

	// -------------------------------------------------------------------------
	// Presets
	// -------------------------------------------------------------------------

	/** Show the preset sidebar. Default: `true`. */
	showPresets?: boolean;
	/**
	 * Custom preset list. Falls back to `DEFAULT_PRESETS` when omitted.
	 * Each preset must have a unique `key`.
	 */
	presets?: DateRangePreset[];
	/** Key of the preset that should be active on initial render (uncontrolled). */
	defaultPreset?: string;

	// -------------------------------------------------------------------------
	// Time / timezone
	// -------------------------------------------------------------------------

	/** Append time inputs to the date inputs. */
	showTime?: boolean;
	/** Show a searchable timezone selector. */
	showTimezone?: boolean;
	/** Controlled timezone string (e.g. `"America/New_York"`). */
	timezone?: string;
	/** Initial timezone for uncontrolled mode. Defaults to the user's local timezone. */
	defaultTimezone?: string;
	/** Called when the user selects a different timezone. */
	onTimezoneChange?: (timezone: string) => void;

	// -------------------------------------------------------------------------
	// Format
	// -------------------------------------------------------------------------

	/**
	 * date-fns format string used for date inputs and the trigger label.
	 * Default: `"dd-MMM-yyyy"`.
	 */
	dateFormat?: string;

	// -------------------------------------------------------------------------
	// Constraints
	// -------------------------------------------------------------------------

	/** Earliest selectable date. */
	minDate?: Date;
	/** Latest selectable date. */
	maxDate?: Date;
	/** Disables the trigger button entirely. */
	disabled?: boolean;

	// -------------------------------------------------------------------------
	// Special modes
	// -------------------------------------------------------------------------

	/**
	 * Adds an "All dates" entry to the preset sidebar and a "Skip date filter"
	 * toggle in the footer, allowing the user to clear the date constraint.
	 */
	allowNoDateRange?: boolean;
	/** Label for the null-range option. Default: `"All dates"`. */
	noDateRangeLabel?: string;

	// -------------------------------------------------------------------------
	// Trigger customization
	// -------------------------------------------------------------------------

	/** Placeholder text shown when no range is selected. */
	placeholder?: string;
	/** Extra class names for the trigger button. */
	triggerClassName?: string;
	/** Variant passed to the trigger Button. Default: `"outline"`. */
	triggerVariant?: React.ComponentProps<typeof Button>["variant"];

	// -------------------------------------------------------------------------
	// Popover
	// -------------------------------------------------------------------------

	/** Alignment of the popover relative to the trigger. Default: `"start"`. */
	align?: "start" | "center" | "end";
	/** Controlled open state. */
	open?: boolean;
	/** Called when the popover open state changes. */
	onOpenChange?: (open: boolean) => void;

	// -------------------------------------------------------------------------
	// Accessibility / forms
	// -------------------------------------------------------------------------

	/** Accessible label for the trigger button. Auto-generated from value when omitted. */
	"aria-label"?: string;
	/** ID of an element that describes the picker. */
	"aria-describedby"?: string;
	/** ID forwarded to the trigger button for form association. */
	id?: string;

	// -------------------------------------------------------------------------
	// Style
	// -------------------------------------------------------------------------

	className?: string;
}

export interface PresetDateRangePickerProps {
	/** Initial preset key. Default: `"2months"`. */
	defaultPreset?: string;
	/** Custom preset list. Falls back to `DEFAULT_PRESETS`. */
	presets?: DateRangePreset[];
	/** Called when the committed range changes. */
	onApply?: (value: SuperDateRangeValue) => void;
	/** Alignment of the popover. Default: `"start"`. */
	align?: "start" | "center" | "end";
	className?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

function getLocalTimezone(): string {
	return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

function getTimezoneAbbr(timezone: string): string {
	return (
		new Intl.DateTimeFormat("en", {
			timeZone: timezone,
			timeZoneName: "short",
		})
			.formatToParts(new Date())
			.find((p) => p.type === "timeZoneName")?.value ?? ""
	);
}

const LOCAL_TIMEZONE = getLocalTimezone();

/** Built-in preset list. Pass a custom `presets` prop to override. */
export const DEFAULT_PRESETS: DateRangePreset[] = [
	{
		key: "1day",
		label: "Last 1 day",
		getRange: () => ({ from: subDays(new Date(), 1), to: new Date() }),
	},
	{
		key: "2days",
		label: "Last 2 days",
		getRange: () => ({ from: subDays(new Date(), 2), to: new Date() }),
	},
	{
		key: "1week",
		label: "Last 1 week",
		getRange: () => ({ from: subDays(new Date(), 7), to: new Date() }),
	},
	{
		key: "1month",
		label: "Last 1 month",
		getRange: () => ({ from: subMonths(new Date(), 1), to: new Date() }),
	},
	{
		key: "2months",
		label: "Last 2 months",
		getRange: () => ({ from: subMonths(new Date(), 2), to: new Date() }),
	},
	{
		key: "3months",
		label: "Last 3 months",
		getRange: () => ({ from: subMonths(new Date(), 3), to: new Date() }),
	},
];

/** Common timezone options exposed so consumers can build custom lists. */
export const TIMEZONE_OPTIONS: { label: string; value: string }[] = [
	{ label: `Local (${LOCAL_TIMEZONE})`, value: LOCAL_TIMEZONE },
	...([
		{ label: "UTC", value: "UTC" },
		{ label: "America/New_York", value: "America/New_York" },
		{ label: "America/Chicago", value: "America/Chicago" },
		{ label: "America/Denver", value: "America/Denver" },
		{ label: "America/Los_Angeles", value: "America/Los_Angeles" },
		{ label: "Europe/London", value: "Europe/London" },
		{ label: "Europe/Paris", value: "Europe/Paris" },
		{ label: "Asia/Tokyo", value: "Asia/Tokyo" },
		{ label: "Asia/Shanghai", value: "Asia/Shanghai" },
		{ label: "Australia/Sydney", value: "Australia/Sydney" },
	].filter((tz) => tz.value !== LOCAL_TIMEZONE)),
];

// ---------------------------------------------------------------------------
// Internal utilities
// ---------------------------------------------------------------------------

function normalizeDayMs(d: Date): number {
	return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

const DEFAULT_DATE_FORMAT = "dd-MMM-yyyy";

function formatDateValue(date: Date, fmt = DEFAULT_DATE_FORMAT): string {
	return format(date, fmt);
}

function formatRangeLabel(range: DateRange, fmt = DEFAULT_DATE_FORMAT): string {
	if (!range.from) return "";
	const from = formatDateValue(range.from, fmt);
	const to = range.to ? formatDateValue(range.to, fmt) : "\u2026";
	return `${from} \u2013 ${to}`;
}

// ---------------------------------------------------------------------------
// SuperDateRangePicker
// ---------------------------------------------------------------------------

/**
 * A full-featured date range picker with a preset sidebar, optional time /
 * timezone controls, and an Apply/Cancel workflow.
 *
 * Supports both controlled and uncontrolled usage.
 *
 * @example
 * // Uncontrolled
 * <SuperDateRangePicker onApply={(range) => console.log(range)} />
 *
 * @example
 * // Controlled
 * const [range, setRange] = useState<SuperDateRangeValue>(null);
 * <SuperDateRangePicker value={range} onApply={setRange} />
 *
 * @example
 * // Custom presets
 * const myPresets: DateRangePreset[] = [
 *   { key: "ytd", label: "Year to date", getRange: () => ({ from: startOfYear(new Date()), to: new Date() }) },
 * ];
 * <SuperDateRangePicker presets={myPresets} />
 */
export function SuperDateRangePicker({
	value,
	defaultValue,
	onApply,
	onChange,
	showPresets = true,
	presets: presetsProp,
	defaultPreset,
	showTime = false,
	showTimezone = false,
	timezone: timezoneProp,
	defaultTimezone,
	onTimezoneChange,
	dateFormat,
	minDate,
	maxDate,
	disabled = false,
	allowNoDateRange = false,
	noDateRangeLabel = "All dates",
	placeholder = "Select date range",
	triggerClassName,
	triggerVariant = "outline",
	align = "start",
	open: openProp,
	onOpenChange: onOpenChangeProp,
	"aria-label": ariaLabelProp,
	"aria-describedby": ariaDescribedBy,
	id,
	className,
}: SuperDateRangePickerProps) {
	const fmt = dateFormat ?? DEFAULT_DATE_FORMAT;
	const presets = presetsProp ?? DEFAULT_PRESETS;

	// -------------------------------------------------------------------------
	// Resolve initial value
	// -------------------------------------------------------------------------

	const resolveInitialPreset = React.useCallback((): DateRangePreset => {
		if (defaultPreset) {
			const found = presets.find((p) => p.key === defaultPreset);
			if (found) return found;
		}
		return presets[0];
	}, [defaultPreset, presets]);

	const resolveInitialRange = React.useCallback((): DateRange => {
		if (value !== undefined) return value ?? resolveInitialPreset().getRange();
		if (defaultValue !== undefined)
			return defaultValue ?? resolveInitialPreset().getRange();
		return resolveInitialPreset().getRange();
	}, [value, defaultValue, resolveInitialPreset]);

	// -------------------------------------------------------------------------
	// Range state — uses useThreeClickRangeState for 3-click UX
	// -------------------------------------------------------------------------

	const {
		anchorDate,
		currentRange,
		visibleRange,
		setRange,
		onDayClick,
		onDayHover,
		clearHover,
	} = useThreeClickRangeState(resolveInitialRange());

	// -------------------------------------------------------------------------
	// Committed state — what was last applied
	// -------------------------------------------------------------------------

	const [committedValue, setCommittedValue] =
		React.useState<SuperDateRangeValue>(() => {
			if (value !== undefined) return value;
			if (defaultValue !== undefined) return defaultValue;
			return resolveInitialPreset().getRange();
		});

	// Keep committed in sync when controlled value changes from outside
	const isControlled = value !== undefined;
	React.useEffect(() => {
		if (isControlled) {
			setCommittedValue(value);
			if (value) {
				setRange(value);
				setCalendarMonth(value.from ?? new Date());
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isControlled, value]);

	// -------------------------------------------------------------------------
	// No-date-range state
	// -------------------------------------------------------------------------

	const [noDateRange, setNoDateRange] = React.useState(
		() => (value !== undefined ? value === null : defaultValue === null),
	);
	const [committedNoDateRange, setCommittedNoDateRange] = React.useState(
		() => (value !== undefined ? value === null : defaultValue === null),
	);

	// -------------------------------------------------------------------------
	// Timezone — controlled or uncontrolled
	// -------------------------------------------------------------------------

	const isTimezoneControlled = timezoneProp !== undefined && !!onTimezoneChange;
	const [timezoneState, setTimezoneState] = React.useState(
		() => timezoneProp ?? defaultTimezone ?? (showTimezone ? LOCAL_TIMEZONE : "UTC"),
	);
	const timezone = isTimezoneControlled ? timezoneProp! : timezoneState;
	const setTimezone = React.useCallback(
		(tz: string) => {
			if (!isTimezoneControlled) setTimezoneState(tz);
			onTimezoneChange?.(tz);
		},
		[isTimezoneControlled, onTimezoneChange],
	);
	const [timezoneOpen, setTimezoneOpen] = React.useState(false);
	const tzAbbr = showTime ? getTimezoneAbbr(timezone) : "";

	// -------------------------------------------------------------------------
	// Input formatting
	// -------------------------------------------------------------------------

	const formatForInput = React.useCallback(
		(d: Date): string => {
			const base = showTime ? format(d, `${fmt} HH:mm:ss`) : format(d, fmt);
			return showTime && tzAbbr ? `${base} ${tzAbbr}` : base;
		},
		[showTime, fmt, tzAbbr],
	);

	const resolveInputFormat = React.useCallback((): string => {
		const tzSuffix = showTime && tzAbbr ? ` '${tzAbbr}'` : "";
		const base = showTime ? `${fmt} HH:mm:ss` : fmt;
		return `${base}${tzSuffix}`;
	}, [showTime, fmt, tzAbbr]);

	// -------------------------------------------------------------------------
	// Input state
	// -------------------------------------------------------------------------

	const initialRange = resolveInitialRange();
	const [startDateTime, setStartDateTime] = React.useState(() =>
		formatForInput(initialRange.from ?? new Date()),
	);
	const [endDateTime, setEndDateTime] = React.useState(() =>
		formatForInput(initialRange.to ?? new Date()),
	);
	const [activeField, setActiveField] = React.useState<"start" | "end" | null>(
		null,
	);

	// -------------------------------------------------------------------------
	// Calendar month navigation — fully controlled, no remount hacks
	// -------------------------------------------------------------------------

	const [calendarMonth, setCalendarMonth] = React.useState(
		() => resolveInitialRange().from ?? new Date(),
	);

	// -------------------------------------------------------------------------
	// Popover open state — controlled or uncontrolled
	// -------------------------------------------------------------------------

	const [openState, setOpenState] = React.useState(false);
	const isOpenControlled = openProp !== undefined;
	const popoverOpen = isOpenControlled ? openProp! : openState;

	// -------------------------------------------------------------------------
	// Refs for focus management
	// -------------------------------------------------------------------------

	const triggerRef = React.useRef<HTMLButtonElement>(null);
	const firstPresetRef = React.useRef<HTMLButtonElement>(null);
	const startInputRef = React.useRef<HTMLInputElement>(null);
	const liveRegionRef = React.useRef<HTMLDivElement>(null);

	// -------------------------------------------------------------------------
	// Preset matching
	// -------------------------------------------------------------------------

	const matchActivePresetKey = React.useCallback(
		(range: DateRange | null | undefined): string | null => {
			if (!range?.from || !range?.to) return null;
			const found = presets.find(
				(p) => {
					const pr = p.getRange();
					return (
						pr.from &&
						pr.to &&
						normalizeDayMs(pr.from) === normalizeDayMs(range.from!) &&
						normalizeDayMs(pr.to) === normalizeDayMs(range.to!)
					);
				},
			);
			return found?.key ?? null;
		},
		[presets],
	);

	const activePresetKey = React.useMemo(
		() => (noDateRange ? null : matchActivePresetKey(currentRange)),
		[noDateRange, currentRange, matchActivePresetKey],
	);

	// -------------------------------------------------------------------------
	// Trigger label
	// -------------------------------------------------------------------------

	const triggerLabel = React.useMemo(() => {
		if (committedNoDateRange) return noDateRangeLabel;
		if (!committedValue) return placeholder;
		const presetKey = matchActivePresetKey(committedValue);
		if (presetKey) {
			const found = presets.find((p) => p.key === presetKey);
			if (found) return found.label;
		}
		if (!committedValue.from) return placeholder;
		const from = formatDateValue(committedValue.from, fmt);
		const to = committedValue.to ? formatDateValue(committedValue.to, fmt) : "\u2026";
		const timePart = showTime && committedValue.from
			? ` ${format(committedValue.from, "HH:mm")}`
			: "";
		const toTimePart = showTime && committedValue.to
			? ` ${format(committedValue.to, "HH:mm")}`
			: "";
		const tzPart = tzAbbr ? ` ${tzAbbr}` : "";
		return `${from}${timePart} \u2013 ${to}${toTimePart}${tzPart}`;
	}, [
		committedNoDateRange,
		committedValue,
		noDateRangeLabel,
		placeholder,
		presets,
		matchActivePresetKey,
		fmt,
		showTime,
		tzAbbr,
	]);

	const ariaLabel =
		ariaLabelProp ??
		(committedNoDateRange
			? `${noDateRangeLabel}. Press Enter to change.`
			: committedValue?.from
				? `Date range: ${formatRangeLabel(committedValue, fmt)}. Press Enter to change.`
				: `${placeholder}. Press Enter to open.`);

	// -------------------------------------------------------------------------
	// Restore committed range on cancel / close without applying
	// -------------------------------------------------------------------------

	const restoreCommittedRange = React.useCallback(() => {
		setNoDateRange(committedNoDateRange);
		if (!committedNoDateRange && committedValue) {
			setRange(committedValue);
			setCalendarMonth(committedValue.from ?? new Date());
			setStartDateTime(formatForInput(committedValue.from ?? new Date()));
			setEndDateTime(formatForInput(committedValue.to ?? new Date()));
		} else if (committedNoDateRange) {
			setStartDateTime("");
			setEndDateTime("");
		}
		setActiveField(null);
		clearHover();
	}, [committedNoDateRange, committedValue, setRange, formatForInput, clearHover]);

	// -------------------------------------------------------------------------
	// Actions
	// -------------------------------------------------------------------------

	const handlePresetSelect = React.useCallback(
		(preset: DateRangePreset) => {
			setNoDateRange(false);
			const range = preset.getRange();
			setRange(range);
			setStartDateTime(formatForInput(range.from!));
			setEndDateTime(formatForInput(range.to!));
			setCalendarMonth(range.from!);
			setActiveField(null);
			onChange?.(range);
		},
		[setRange, formatForInput, onChange],
	);

	const handleNoDateRangeSelect = React.useCallback(() => {
		setNoDateRange(true);
		setActiveField(null);
		onChange?.(null);
	}, [onChange]);

	const handleCalendarDayClick = React.useCallback(
		(day: Date) => {
			if (noDateRange) setNoDateRange(false);
			if (!anchorDate) {
				setEndDateTime("");
				setActiveField("end");
			} else {
				setActiveField(null);
			}
			onDayClick(day);
		},
		[anchorDate, onDayClick, noDateRange],
	);

	const handleApply = React.useCallback(() => {
		if (noDateRange) {
			setCommittedValue(null);
			setCommittedNoDateRange(true);
			if (liveRegionRef.current)
				liveRegionRef.current.textContent = `${noDateRangeLabel} selected`;
			onApply?.(null);
		} else {
			const from = currentRange?.from ?? committedValue?.from ?? new Date();
			const to = currentRange?.to ?? from;
			const committed: DateRange = { from, to };
			setCommittedValue(committed);
			setCommittedNoDateRange(false);
			if (liveRegionRef.current)
				liveRegionRef.current.textContent = `Date range applied: ${formatRangeLabel(committed, fmt)}`;
			onApply?.(committed);
		}
		setOpenState(false);
		onOpenChangeProp?.(false);
		// Return focus to trigger
		setTimeout(() => triggerRef.current?.focus(), 0);
	}, [
		noDateRange,
		currentRange,
		committedValue,
		noDateRangeLabel,
		onApply,
		onOpenChangeProp,
		fmt,
	]);

	const handleCancel = React.useCallback(() => {
		restoreCommittedRange();
		setOpenState(false);
		onOpenChangeProp?.(false);
		setTimeout(() => triggerRef.current?.focus(), 0);
	}, [restoreCommittedRange, onOpenChangeProp]);

	const handleOpenChange = React.useCallback(
		(open: boolean) => {
			if (!open) restoreCommittedRange();
			if (!isOpenControlled) setOpenState(open);
			onOpenChangeProp?.(open);
			// Move focus into popover when opening
			if (open) {
				setTimeout(() => {
					if (showPresets) {
						firstPresetRef.current?.focus();
					} else {
						startInputRef.current?.focus();
					}
				}, 50);
			}
		},
		[restoreCommittedRange, isOpenControlled, onOpenChangeProp, showPresets],
	);

	// -------------------------------------------------------------------------
	// Input handlers
	// -------------------------------------------------------------------------

	const navigateCalendarTo = React.useCallback((date: Date) => {
		setCalendarMonth(date);
	}, []);

	const handleStartFocus = React.useCallback(() => {
		setActiveField("start");
		if (currentRange?.from) navigateCalendarTo(currentRange.from);
	}, [currentRange?.from, navigateCalendarTo]);

	const handleEndFocus = React.useCallback(() => {
		setActiveField("end");
		const target = currentRange?.to ?? currentRange?.from;
		if (target) navigateCalendarTo(target);
	}, [currentRange?.to, currentRange?.from, navigateCalendarTo]);

	const handleInputBlur = React.useCallback(() => {
		if (!anchorDate) setActiveField(null);
	}, [anchorDate]);

	const handleStartInputChange = React.useCallback(
		(value: string) => {
			setStartDateTime(value);
			const parsed = parse(value, resolveInputFormat(), new Date());
			if (!isValid(parsed)) return;
			navigateCalendarTo(parsed);
			const to = currentRange?.to ?? parsed;
			setRange({ from: parsed, to });
			onChange?.({ from: parsed, to });
		},
		[resolveInputFormat, navigateCalendarTo, currentRange?.to, setRange, onChange],
	);

	const handleEndInputChange = React.useCallback(
		(value: string) => {
			setEndDateTime(value);
			const parsed = parse(value, resolveInputFormat(), new Date());
			if (!isValid(parsed)) return;
			navigateCalendarTo(parsed);
			const from = currentRange?.from ?? parsed;
			setRange({ from, to: parsed });
			onChange?.({ from, to: parsed });
		},
		[resolveInputFormat, navigateCalendarTo, currentRange?.from, setRange, onChange],
	);

	// Sync inputs from calendar selection; skip the actively-typed field
	React.useEffect(() => {
		if (noDateRange) return;
		if (activeField !== "start" && currentRange?.from)
			setStartDateTime(formatForInput(currentRange.from));
		if (activeField !== "end" && currentRange?.to)
			setEndDateTime(formatForInput(currentRange.to));
	}, [
		noDateRange,
		activeField,
		currentRange?.from,
		currentRange?.to,
		formatForInput,
	]);

	// -------------------------------------------------------------------------
	// Keyboard handler for the popover
	// -------------------------------------------------------------------------

	const handlePopoverKeyDown = React.useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Escape") {
				e.preventDefault();
				handleCancel();
			}
		},
		[handleCancel],
	);

	// -------------------------------------------------------------------------
	// Disabled date constraint
	// -------------------------------------------------------------------------

	const disabledDates = React.useCallback(
		(date: Date): boolean => {
			if (minDate && date < minDate) return true;
			if (maxDate && date > maxDate) return true;
			return false;
		},
		[minDate, maxDate],
	);

	const startInputId = id ? `${id}-start` : undefined;
	const endInputId = id ? `${id}-end` : undefined;

	// -------------------------------------------------------------------------
	// Render
	// -------------------------------------------------------------------------

	return (
		<div className={cn("inline-flex", className)}>
			{/* Hidden live region for screen reader announcements */}
			<div
				ref={liveRegionRef}
				aria-live="polite"
				aria-atomic="true"
				className="sr-only"
			/>

			<Popover open={popoverOpen} onOpenChange={handleOpenChange}>
				<PopoverTrigger asChild>
					<Button
						ref={triggerRef}
						id={id}
						variant={triggerVariant}
						disabled={disabled}
						aria-label={ariaLabel}
						aria-describedby={ariaDescribedBy}
						aria-haspopup="dialog"
						aria-expanded={popoverOpen}
						className={cn("justify-between gap-2", triggerClassName)}
					>
						<CalendarIcon
							className="h-4 w-4 shrink-0 text-muted-foreground"
							aria-hidden="true"
						/>
						<span className="truncate">{triggerLabel}</span>
						<ChevronDown
							className="h-4 w-4 shrink-0 text-muted-foreground"
							aria-hidden="true"
						/>
					</Button>
				</PopoverTrigger>

				<PopoverContent
					role="dialog"
					aria-label="Select date range"
					align={align}
					className="w-auto p-0"
					onKeyDown={handlePopoverKeyDown}
				>
					<div className="flex">
						{/* ---- Preset sidebar ---- */}
						{showPresets && (
							<nav
								aria-label="Date range presets"
								className="w-44 shrink-0 border-r py-2"
							>
								{presets.map((preset, i) => {
									const isActive = !noDateRange && activePresetKey === preset.key;
									const isFirst = i === 0;
									const range = preset.getRange();
									return (
										<button
											key={preset.key}
											ref={isFirst ? firstPresetRef : undefined}
											type="button"
											onClick={() => handlePresetSelect(preset)}
											aria-pressed={isActive}
											className={cn(
												"flex w-full items-start gap-1.5 px-2 py-2 text-left text-sm transition-colors hover:bg-accent",
												isActive && "bg-accent",
											)}
										>
											<Check
												className={cn(
													"mt-0.5 h-4 w-4 shrink-0",
													isActive ? "text-foreground" : "text-transparent",
												)}
												aria-hidden="true"
											/>
											<div className="flex min-w-0 flex-1 flex-col">
												<span className="font-medium">{preset.label}</span>
												<span className="text-xs text-muted-foreground">
													{range.from && formatDateValue(range.from, fmt)}
													{range.to && (
														<>
															<br />
															{"– " + formatDateValue(range.to, fmt)}
														</>
													)}
												</span>
											</div>
										</button>
									);
								})}
							</nav>
						)}

						{/* ---- Right panel ---- */}
						<div className="flex min-w-0 flex-1 flex-col space-y-3 p-3">
							{/* Date / time inputs */}
							<div
								className="flex items-center gap-2"
								role="group"
								aria-label="Date range inputs"
							>
								<div className="flex min-w-0 flex-1 flex-col gap-1">
									{startInputId && (
										<label
											htmlFor={startInputId}
											className="text-xs text-muted-foreground"
										>
											Start date
										</label>
									)}
									<Input
										ref={startInputRef}
										id={startInputId}
										aria-label={startInputId ? undefined : "Start date"}
										type={showTime && !dateFormat ? "datetime-local" : "text"}
										step={showTime && !dateFormat ? "1" : undefined}
										value={noDateRange ? "" : startDateTime}
										onChange={(e) => handleStartInputChange(e.target.value)}
										onFocus={handleStartFocus}
										onBlur={handleInputBlur}
										placeholder={fmt}
										disabled={noDateRange}
										className={cn(
											"text-sm [&::-webkit-calendar-picker-indicator]:hidden",
											activeField === "start" &&
												!noDateRange &&
												"border-primary ring-1 ring-primary",
										)}
									/>
								</div>

								<span
									className="mt-4 shrink-0 select-none text-muted-foreground"
									aria-hidden="true"
								>
									–
								</span>

								<div className="flex min-w-0 flex-1 flex-col gap-1">
									{endInputId && (
										<label
											htmlFor={endInputId}
											className="text-xs text-muted-foreground"
										>
											End date
										</label>
									)}
									<Input
										id={endInputId}
										aria-label={endInputId ? undefined : "End date"}
										type={showTime && !dateFormat ? "datetime-local" : "text"}
										step={showTime && !dateFormat ? "1" : undefined}
										value={noDateRange ? "" : endDateTime}
										onChange={(e) => handleEndInputChange(e.target.value)}
										onFocus={handleEndFocus}
										onBlur={handleInputBlur}
										placeholder={fmt}
										disabled={noDateRange}
										className={cn(
											"text-sm [&::-webkit-calendar-picker-indicator]:hidden",
											activeField === "end" &&
												!noDateRange &&
												"border-primary ring-1 ring-primary",
										)}
									/>
								</div>
							</div>

							{/* Calendar */}
							<div
								{...(noDateRange
									? { inert: "" as unknown as boolean, "aria-disabled": "true" }
									: {})}
								className={cn(
									"flex justify-center transition-opacity",
									noDateRange && "opacity-40",
								)}
							>
							<Calendar
								mode="range"
								selected={noDateRange ? undefined : visibleRange}
								onSelect={(_, triggerDate) =>
									handleCalendarDayClick(triggerDate)
								}
								onDayHover={onDayHover}
								month={calendarMonth}
								onMonthChange={setCalendarMonth}
								numberOfMonths={2}
								captionLayout="dropdown"
								fromYear={2020}
								toYear={new Date().getFullYear() + 2}
								fixedWeeks
								disabled={
									minDate || maxDate ? disabledDates : undefined
								}
								isPendingSelection={!!anchorDate}
								className="p-2"
							/>
							</div>

							{/* Timezone selector */}
						{showTimezone && (
							<div
								role="group"
								aria-label="Timezone"
								className="flex flex-col gap-1"
							>
								<span className="text-xs text-muted-foreground">Timezone</span>
								<Popover open={timezoneOpen} onOpenChange={setTimezoneOpen}>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											role="combobox"
											size="sm"
											aria-expanded={timezoneOpen}
											aria-label={`Timezone: ${TIMEZONE_OPTIONS.find((tz) => tz.value === timezone)?.label ?? timezone}`}
											className="w-full justify-between text-sm"
										>
										{TIMEZONE_OPTIONS.find((tz) => tz.value === timezone)
											?.label ?? "Select timezone"}
										<ChevronsUpDown
											className="ml-2 h-4 w-4 shrink-0 opacity-50"
											aria-hidden="true"
										/>
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-full p-0">
									<Command>
										<CommandInput placeholder="Search timezone" />
										<CommandList>
											<CommandEmpty>No timezone found</CommandEmpty>
											<CommandGroup>
												{TIMEZONE_OPTIONS.map((tz) => (
													<CommandItem
														key={tz.value}
														value={tz.value}
														onSelect={(val) => {
															setTimezone(
																val === timezone ? LOCAL_TIMEZONE : val,
															);
															setTimezoneOpen(false);
														}}
													>
														<Check
															className={cn(
																"mr-2 h-4 w-4",
																timezone === tz.value
																	? "opacity-100"
																	: "opacity-0",
															)}
															aria-hidden="true"
														/>
														{tz.label}
													</CommandItem>
												))}
											</CommandGroup>
										</CommandList>
									</Command>
								</PopoverContent>
							</Popover>
						</div>
					)}
						</div>
					</div>

					{/* Footer */}
					<div className="flex items-center justify-between border-t px-3 py-2">
						{allowNoDateRange ? (
							<label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
								<Switch
									checked={noDateRange}
									onCheckedChange={(checked) => {
										if (checked) handleNoDateRangeSelect();
										else {
											setNoDateRange(false);
											if (committedValue) setRange(committedValue);
										}
									}}
									aria-label={`Skip date filter — ${noDateRange ? "on" : "off"}`}
								/>
								<span aria-hidden="true">Skip date filter</span>
							</label>
						) : (
							<div />
						)}

						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={handleCancel}
							>
								Cancel
							</Button>
							<Button size="sm" onClick={handleApply}>
								Apply
							</Button>
						</div>
					</div>
				</PopoverContent>
			</Popover>
		</div>
	);
}

// ---------------------------------------------------------------------------
// PresetDateRangePicker — lightweight EA-workbench variant
// ---------------------------------------------------------------------------

/**
 * A compact date range picker that shows a preset list by default and
 * switches to a two-month calendar when the user selects "Custom".
 *
 * Presets are applied immediately (no Apply step). The "Custom" view
 * requires two calendar clicks to commit a range, then auto-closes.
 *
 * @example
 * <PresetDateRangePicker
 *   defaultPreset="2months"
 *   onApply={(range) => console.log(range)}
 * />
 */
export function PresetDateRangePicker({
	defaultPreset = "2months",
	presets = DEFAULT_PRESETS,
	onApply,
	align = "start",
	className,
}: PresetDateRangePickerProps) {
	const initial =
		presets.find((p) => p.key === defaultPreset) ?? presets[0];

	const [selectedPresetKey, setSelectedPresetKey] = React.useState<
		string | "custom"
	>(defaultPreset);

	const {
		anchorDate,
		currentRange,
		visibleRange,
		setRange,
		onDayClick,
		onDayHover,
		clearHover,
	} = useThreeClickRangeState(initial.getRange());

	const [view, setView] = React.useState<"presets" | "calendar">("presets");
	const [isOpen, setIsOpen] = React.useState(false);

	const triggerLabel = React.useMemo(() => {
		if (selectedPresetKey === "custom" && currentRange) {
			return formatRangeLabel(currentRange);
		}
		return presets.find((p) => p.key === selectedPresetKey)?.label ?? "";
	}, [selectedPresetKey, currentRange, presets]);

	const handlePresetSelect = React.useCallback(
		(preset: DateRangePreset) => {
			const range = preset.getRange();
			setSelectedPresetKey(preset.key);
			setRange(range);
			setIsOpen(false);
			setView("presets");
			onApply?.(range);
		},
		[setRange, onApply],
	);

	const handleCalendarDayClick = React.useCallback(
		(day: Date) => {
			const hadAnchor = Boolean(anchorDate);
			onDayClick(day);
			if (hadAnchor) {
				// Second click — range is complete
				setSelectedPresetKey("custom");
				const finalRange = {
					from: anchorDate! < day ? anchorDate! : day,
					to: anchorDate! < day ? day : anchorDate!,
				};
				onApply?.(finalRange);
			}
		},
		[anchorDate, onDayClick, onApply],
	);

	const handleOpenChange = React.useCallback(
		(open: boolean) => {
			setIsOpen(open);
			if (!open) {
				clearHover();
				setView("presets");
			}
		},
		[clearHover],
	);

	const presetRanges = React.useMemo(
		() => presets.map((p) => ({ ...p, range: p.getRange() })),
		[presets],
	);

	const triggerRef = React.useRef<HTMLButtonElement>(null);

	const ariaLabel = React.useMemo(() => {
		if (selectedPresetKey === "custom" && currentRange?.from) {
			return `Date range: ${formatRangeLabel(currentRange)}. Press Enter to change.`;
		}
		const label = presets.find((p) => p.key === selectedPresetKey)?.label ?? "Select date range";
		return `Date range: ${label}. Press Enter to change.`;
	}, [selectedPresetKey, currentRange, presets]);

	return (
		<div className={cn("inline-flex", className)}>
			<Popover open={isOpen} onOpenChange={handleOpenChange}>
				<PopoverTrigger asChild>
					<Button
						ref={triggerRef}
						variant="outline"
						aria-label={ariaLabel}
						aria-haspopup="dialog"
						aria-expanded={isOpen}
						className="justify-between gap-2"
					>
						<CalendarIcon
							className="h-4 w-4 shrink-0 text-muted-foreground"
							aria-hidden="true"
						/>
						<span className="truncate">{triggerLabel}</span>
						<ChevronDown
							className="h-4 w-4 shrink-0 text-muted-foreground"
							aria-hidden="true"
						/>
					</Button>
				</PopoverTrigger>

				<PopoverContent
					role="dialog"
					aria-label="Select date range"
					align={align}
					className={cn("p-0", view === "calendar" ? "w-auto" : "w-72")}
					onKeyDown={(e) => {
						if (e.key === "Escape") {
							setIsOpen(false);
							setTimeout(() => triggerRef.current?.focus(), 0);
						}
					}}
				>
					{view === "presets" ? (
						<nav aria-label="Date range presets" className="flex flex-col py-1">
							{presetRanges.map((preset) => (
								<button
									key={preset.key}
									type="button"
									onClick={() => handlePresetSelect(preset)}
									aria-pressed={selectedPresetKey === preset.key}
									className={cn(
										"flex items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-accent",
										selectedPresetKey === preset.key && "bg-accent",
									)}
								>
									<span
										className={cn(
											"mt-1 h-2 w-2 shrink-0 rounded-full",
											selectedPresetKey === preset.key
												? "bg-foreground"
												: "bg-transparent",
										)}
										aria-hidden="true"
									/>
									<div className="flex flex-col">
										<span className="text-sm font-medium">{preset.label}</span>
										<span className="text-xs text-muted-foreground">
											{formatRangeLabel(preset.range)}
										</span>
									</div>
								</button>
							))}

							<Separator />

							<button
								type="button"
								onClick={() => setView("calendar")}
								aria-pressed={selectedPresetKey === "custom"}
								className="flex items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-accent"
							>
								<span
									className={cn(
										"mt-1 h-2 w-2 shrink-0 rounded-full",
										selectedPresetKey === "custom"
											? "bg-foreground"
											: "bg-transparent",
									)}
									aria-hidden="true"
								/>
								<span className="text-sm font-medium">Custom</span>
							</button>
						</nav>
					) : (
						<div className="p-3">
							<Calendar
								mode="range"
								selected={visibleRange}
								onSelect={(_, triggerDate) =>
									handleCalendarDayClick(triggerDate)
								}
								onDayHover={onDayHover}
								numberOfMonths={2}
								captionLayout="dropdown"
								fromYear={2020}
								toYear={new Date().getFullYear()}
								defaultMonth={currentRange?.from}
								isPendingSelection={!!anchorDate}
							/>
						</div>
					)}
				</PopoverContent>
			</Popover>
		</div>
	);
}
