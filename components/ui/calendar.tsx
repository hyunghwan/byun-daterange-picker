"use client";

import * as React from "react";
import {
	ChevronDownIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
} from "lucide-react";
import { DayButton, DayPicker, getDefaultClassNames } from "react-day-picker";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";

type CalendarHoverHandler = (date: Date) => void;
type CalendarHoverLeaveHandler = () => void;

const CalendarHoverContext = React.createContext<CalendarHoverHandler | null>(
	null,
);
const CalendarHoverLeaveContext =
	React.createContext<CalendarHoverLeaveHandler | null>(null);

/**
 * When true, range-middle cells receive a "pending" visual treatment:
 * transparent background + dashed border, indicating the end date has not
 * been confirmed yet. Range start/end cells are unaffected.
 */
const CalendarPendingContext = React.createContext<boolean>(false);

function normalizeDay(date: Date) {
	const normalized = new Date(date);
	normalized.setHours(0, 0, 0, 0);
	return normalized;
}

function toOrderedRange(first: Date, second: Date): DateRange {
	const start = normalizeDay(first);
	const end = normalizeDay(second);
	return start <= end ? { from: start, to: end } : { from: end, to: start };
}

/**
 * When only start date is selected, build a temporary range preview from hover.
 */
function getHoverPreviewRange(
	currentRange: DateRange | undefined,
	hoveredDate: Date | null,
): DateRange | undefined {
	if (!currentRange?.from || currentRange.to || !hoveredDate) {
		return currentRange;
	}

	return toOrderedRange(currentRange.from, hoveredDate);
}

export function useThreeClickRangeState(initialRange?: DateRange) {
	const [committedRange, setCommittedRange] = React.useState<
		DateRange | undefined
	>(() => {
		if (!initialRange?.from || !initialRange?.to) return undefined;
		return toOrderedRange(initialRange.from, initialRange.to);
	});
	const [anchorDate, setAnchorDate] = React.useState<Date | null>(() => {
		if (initialRange?.from && !initialRange.to) {
			return normalizeDay(initialRange.from);
		}
		return null;
	});
	const [hoveredDate, setHoveredDate] = React.useState<Date | null>(null);

	const visibleRange = React.useMemo(() => {
		const baseRange: DateRange | undefined = anchorDate
			? { from: anchorDate, to: undefined }
			: committedRange;
		return getHoverPreviewRange(baseRange, hoveredDate);
	}, [anchorDate, committedRange, hoveredDate]);

	const setRange = React.useCallback((range: DateRange | undefined) => {
		if (!range?.from) {
			setAnchorDate(null);
			setCommittedRange(undefined);
			setHoveredDate(null);
			return;
		}

		if (range.to) {
			setCommittedRange(toOrderedRange(range.from, range.to));
			setAnchorDate(null);
			setHoveredDate(null);
			return;
		}

		setAnchorDate(normalizeDay(range.from));
		setCommittedRange(undefined);
		setHoveredDate(null);
	}, []);

	const onDayClick = React.useCallback(
		(day: Date) => {
			if (!anchorDate) {
				setAnchorDate(normalizeDay(day));
				setCommittedRange(undefined);
				setHoveredDate(null);
				return;
			}

			const finalizedRange = toOrderedRange(anchorDate, day);
			setCommittedRange(finalizedRange);
			setAnchorDate(null);
			setHoveredDate(null);
		},
		[anchorDate],
	);

	const onDayHover = React.useCallback(
		(day: Date) => {
			if (!anchorDate) {
				setHoveredDate(null);
				return;
			}
			setHoveredDate(normalizeDay(day));
		},
		[anchorDate],
	);

	const currentRange = React.useMemo(
		() => (anchorDate ? { from: anchorDate, to: undefined } : committedRange),
		[anchorDate, committedRange],
	);

	const clearHover = React.useCallback(() => {
		setHoveredDate(null);
	}, []);

	return {
		anchorDate,
		committedRange,
		currentRange,
		visibleRange,
		setRange,
		onDayClick,
		onDayHover,
		clearHover,
	};
}

function Calendar({
	className,
	classNames,
	showOutsideDays = true,
	captionLayout = "label",
	buttonVariant = "ghost",
	formatters,
	components,
	onDayHover,
	onDayMouseLeave,
	isPendingSelection = false,
	...props
}: React.ComponentProps<typeof DayPicker> & {
	buttonVariant?: React.ComponentProps<typeof Button>["variant"];
	onDayHover?: CalendarHoverHandler;
	onDayMouseLeave?: CalendarHoverLeaveHandler;
	/** When true, range-middle cells render with a dashed border and transparent
	 *  background to signal that the end date has not been confirmed yet. */
	isPendingSelection?: boolean;
}) {
	const defaultClassNames = getDefaultClassNames();
	const leaveTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
		null,
	);

	const handleHover = React.useCallback(
		(date: Date) => {
			if (leaveTimeoutRef.current) {
				clearTimeout(leaveTimeoutRef.current);
				leaveTimeoutRef.current = null;
			}
			onDayHover?.(date);
		},
		[onDayHover],
	);

	const handleLeave = React.useCallback(() => {
		leaveTimeoutRef.current = setTimeout(() => {
			onDayMouseLeave?.();
			leaveTimeoutRef.current = null;
		}, 50);
	}, [onDayMouseLeave]);

	return (
		<CalendarPendingContext.Provider value={isPendingSelection}>
		<CalendarHoverContext.Provider value={onDayHover ? handleHover : null}>
			<CalendarHoverLeaveContext.Provider
				value={onDayMouseLeave ? handleLeave : null}
			>
				<DayPicker
					showOutsideDays={showOutsideDays}
					className={cn(
						"bg-background group/calendar p-3 [--cell-size:--spacing(8)] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
						String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
						String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
						className,
					)}
					captionLayout={captionLayout}
					formatters={{
						formatMonthDropdown: (date) =>
							date.toLocaleString("default", { month: "short" }),
						...formatters,
					}}
					classNames={{
						root: cn("w-fit", defaultClassNames.root),
						months: cn(
							"flex gap-4 flex-col md:flex-row relative",
							defaultClassNames.months,
						),
						month: cn("flex flex-col w-full gap-4", defaultClassNames.month),
						nav: cn(
							"flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between",
							defaultClassNames.nav,
						),
						button_previous: cn(
							buttonVariants({ variant: buttonVariant }),
							"size-(--cell-size) aria-disabled:opacity-50 p-0 select-none",
							defaultClassNames.button_previous,
						),
						button_next: cn(
							buttonVariants({ variant: buttonVariant }),
							"size-(--cell-size) aria-disabled:opacity-50 p-0 select-none",
							defaultClassNames.button_next,
						),
						month_caption: cn(
							"flex items-center justify-center h-(--cell-size) w-full px-(--cell-size)",
							defaultClassNames.month_caption,
						),
						dropdowns: cn(
							"w-full flex items-center text-sm font-medium justify-center h-(--cell-size) gap-1.5",
							defaultClassNames.dropdowns,
						),
						dropdown_root: cn(
							"relative has-focus:border-ring border border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] rounded-md",
							defaultClassNames.dropdown_root,
						),
						dropdown: cn(
							"absolute inset-0 opacity-0",
							defaultClassNames.dropdown,
						),
						caption_label: cn(
							"select-none font-medium",
							captionLayout === "label"
								? "text-sm"
								: "rounded-md pl-2 pr-1 flex items-center gap-1 text-sm h-8 [&>svg]:text-muted-foreground [&>svg]:size-3.5",
							defaultClassNames.caption_label,
						),
						table: "w-full table-fixed border-separate border-spacing-1",
						weekdays: cn("flex", defaultClassNames.weekdays),
						weekday: cn(
							"text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem] select-none",
							defaultClassNames.weekday,
						),
						week: cn("flex w-full mt-2", defaultClassNames.week),
						week_number_header: cn(
							"select-none w-(--cell-size)",
							defaultClassNames.week_number_header,
						),
						week_number: cn(
							"text-[0.8rem] select-none text-muted-foreground",
							defaultClassNames.week_number,
						),
						day: cn(
							"relative w-full h-full p-0 text-center min-w-(--cell-size) [&:first-child[data-selected=true]_button]:rounded-l-md [&:first-child[data-selected=true]_button]:border-l [&:first-child[data-selected=true]_button]:border-primary [&:last-child[data-selected=true]_button]:rounded-r-md [&:last-child[data-selected=true]_button]:border-r [&:last-child[data-selected=true]_button]:border-primary group/day aspect-square select-none",
							defaultClassNames.day,
						),
					range_start: cn(defaultClassNames.range_start),
					range_middle: cn(defaultClassNames.range_middle),
					range_end: cn(defaultClassNames.range_end),
						today: cn(
							"bg-accent text-accent-foreground rounded-md data-[selected=true]:rounded-none",
							defaultClassNames.today,
						),
						outside: cn(
							"text-muted-foreground aria-selected:text-muted-foreground",
							defaultClassNames.outside,
						),
						disabled: cn(
							"text-muted-foreground opacity-50",
							defaultClassNames.disabled,
						),
						hidden: cn("invisible", defaultClassNames.hidden),
						...classNames,
					}}
					components={{
						Root: ({ className, rootRef, ...props }) => {
							return (
								<div
									data-slot="calendar"
									ref={rootRef}
									className={cn(className)}
									{...props}
								/>
							);
						},
						Chevron: ({ className, orientation, ...props }) => {
							if (orientation === "left") {
								return (
									<ChevronLeftIcon
										className={cn("size-4", className)}
										{...props}
									/>
								);
							}

							if (orientation === "right") {
								return (
									<ChevronRightIcon
										className={cn("size-4", className)}
										{...props}
									/>
								);
							}

							return (
								<ChevronDownIcon
									className={cn("size-4", className)}
									{...props}
								/>
							);
						},
						DayButton: CalendarDayButton,
						WeekNumber: ({ children, ...props }) => {
							return (
								<td {...props}>
									<div className="flex size-(--cell-size) items-center justify-center text-center">
										{children}
									</div>
								</td>
							);
						},
						...components,
					}}
					{...props}
				/>
			</CalendarHoverLeaveContext.Provider>
		</CalendarHoverContext.Provider>
		</CalendarPendingContext.Provider>
	);
}

function CalendarDayButton({
	className,
	day,
	modifiers,
	...props
}: React.ComponentProps<typeof DayButton>) {
	const defaultClassNames = getDefaultClassNames();
	const onDayHover = React.useContext(CalendarHoverContext);
	const onDayMouseLeave = React.useContext(CalendarHoverLeaveContext);
	const isPending = React.useContext(CalendarPendingContext);

	const ref = React.useRef<HTMLButtonElement>(null);
	React.useEffect(() => {
		if (modifiers.focused) ref.current?.focus();
	}, [modifiers.focused]);

	const originalPointerEnter = props.onPointerEnter;
	const originalPointerLeave = props.onPointerLeave;

	const handlePointerEnter = React.useCallback(
		(event: React.PointerEvent<HTMLButtonElement>) => {
			originalPointerEnter?.(event);
			if (!modifiers.disabled) {
				onDayHover?.(day.date);
			}
		},
		[originalPointerEnter, modifiers.disabled, onDayHover, day.date],
	);

	const handlePointerLeave = React.useCallback(
		(event: React.PointerEvent<HTMLButtonElement>) => {
			originalPointerLeave?.(event);
			onDayMouseLeave?.();
		},
		[originalPointerLeave, onDayMouseLeave],
	);

	return (
		<Button
			ref={ref}
			variant="ghost"
			size="icon"
			data-day={day.date.toLocaleDateString()}
			data-selected-single={
				modifiers.selected &&
				!modifiers.range_start &&
				!modifiers.range_end &&
				!modifiers.range_middle
			}
			data-range-start={modifiers.range_start}
			data-range-end={modifiers.range_end}
			data-range-middle={modifiers.range_middle}
			data-pending-middle={modifiers.range_middle && isPending}
			className={cn(
				// Base range styles (committed state)
				"data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground",
				"data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground",
				"data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground",
				"data-[range-middle=true]:bg-primary-background data-[range-middle=true]:text-accent-foreground",
				// Committed border styles
				"data-[range-start=true]:border-l data-[range-start=true]:border-t data-[range-start=true]:border-b data-[range-start=true]:border-primary",
				"data-[range-middle=true]:border-t data-[range-middle=true]:border-b data-[range-middle=true]:border-primary",
				"data-[range-end=true]:border-r data-[range-end=true]:border-t data-[range-end=true]:border-b data-[range-end=true]:border-primary",
				// Pending middle override — transparent bg + dashed border, placed after committed
				// rules so these take precedence when data-pending-middle=true
				"data-[pending-middle=true]:bg-transparent data-[pending-middle=true]:text-foreground",
				"data-[pending-middle=true]:border-t data-[pending-middle=true]:border-b data-[pending-middle=true]:border-dashed data-[pending-middle=true]:border-primary/60",
				// Shape
				"data-[range-start=true]:rounded-l-md data-[range-start=true]:rounded-r-none",
				"data-[range-middle=true]:rounded-none",
				"data-[range-end=true]:rounded-r-md data-[range-end=true]:rounded-l-none",
				// Focus ring
				"group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px]",
				// Layout
				"dark:hover:text-accent-foreground flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-normal [&>span]:text-xs [&>span]:opacity-70",
				defaultClassNames.day,
				className,
			)}
			{...props}
			onPointerEnter={handlePointerEnter}
			onPointerLeave={handlePointerLeave}
		/>
	);
}

export { Calendar, CalendarDayButton };
