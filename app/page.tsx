"use client";

import { useState } from "react";
import { Calendar, Check, Copy, Github } from "lucide-react";
import { startOfYear, subDays } from "date-fns";

import {
  DEFAULT_PRESETS,
  SuperDateRangePicker,
  type SuperDateRangeValue,
} from "@/components/ui/super-date-range-picker";

type PropsRow = {
  prop: string;
  type: string;
  defaultValue: string;
  description: string;
};

const TOC_ITEMS = [
  { id: "overview", label: "Overview" },
  { id: "live-demo", label: "Live demo" },
  { id: "quick-start", label: "Quick start" },
  { id: "examples", label: "Examples" },
  { id: "api-reference", label: "API reference" },
] as const;

const REQUIRED_FILES = [
  "components/ui/super-date-range-picker.tsx",
  "components/ui/calendar.tsx",
  "components/ui/button.tsx",
  "components/ui/popover.tsx",
  "components/ui/command.tsx",
  "components/ui/dialog.tsx",
  "components/ui/input.tsx",
  "components/ui/separator.tsx",
  "components/ui/switch.tsx",
  "lib/utils.ts",
] as const;

const DEMO_DATE_FORMAT = "dd-MMM-yyyy";

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-md border bg-muted/20 font-mono text-xs">
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-sm border bg-background px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground"
        aria-label="Copy code"
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        {copied ? "Copied" : "Copy"}
      </button>
      <pre className="overflow-x-auto p-3 pr-16 leading-relaxed text-foreground">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function RangeReadout({ value }: { value: SuperDateRangeValue | undefined }) {
  if (value === undefined) {
    return <p className="mt-3 text-xs text-muted-foreground">No value applied yet.</p>;
  }
  if (value === null) {
    return (
      <p className="mt-3 text-xs text-muted-foreground">
        Applied: <span className="font-medium text-foreground">All dates (no filter)</span>
      </p>
    );
  }
  return (
    <p className="mt-3 text-xs text-muted-foreground">
      Applied:{" "}
      <span className="font-medium text-foreground">
        {value.from?.toLocaleDateString()} - {value.to?.toLocaleDateString() ?? "..."}
      </span>
    </p>
  );
}

function ExampleBlock({
  title,
  description,
  code,
  children,
}: {
  title: string;
  description: string;
  code: string;
  children: React.ReactNode;
}) {
  const [showCode, setShowCode] = useState(false);

  return (
    <article className="rounded-md border bg-card/50">
      <div className="border-b px-4 py-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="space-y-3 px-4 py-4">
        {children}
        <button
          onClick={() => setShowCode((prev) => !prev)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          {showCode ? "Hide code" : "Show code"}
        </button>
        {showCode ? <CodeBlock code={code} /> : null}
      </div>
    </article>
  );
}

function PropsTable({ rows }: { rows: PropsRow[] }) {
  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Prop</th>
            <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Type</th>
            <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Default</th>
            <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.prop} className="border-b last:border-b-0">
              <td className="whitespace-nowrap px-3 py-2 font-mono text-xs font-medium text-foreground">{row.prop}</td>
              <td className="whitespace-nowrap px-3 py-2 font-mono text-xs text-muted-foreground">{row.type}</td>
              <td className="whitespace-nowrap px-3 py-2 font-mono text-xs text-muted-foreground">{row.defaultValue}</td>
              <td className="px-3 py-2 text-xs text-muted-foreground">{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function DemoPage() {
  const [appliedLive, setAppliedLive] = useState<SuperDateRangeValue | undefined>(undefined);
  const [appliedDefault, setAppliedDefault] = useState<SuperDateRangeValue | undefined>(undefined);
  const [appliedTimeZone, setAppliedTimeZone] = useState<SuperDateRangeValue | undefined>(undefined);
  const [appliedNoDate, setAppliedNoDate] = useState<SuperDateRangeValue | undefined>(undefined);
  const [appliedNoPresets, setAppliedNoPresets] = useState<SuperDateRangeValue | undefined>(undefined);
  const [appliedCustomPresets, setAppliedCustomPresets] = useState<SuperDateRangeValue | undefined>(undefined);

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/95">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Calendar className="h-4 w-4" />
            <span>byun-daterange-picker</span>
          </div>
          <a
            href="https://github.com/hyunghwan/byun-daterange-picker"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <Github className="h-3.5 w-3.5" />
            GitHub
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:px-6">
        <nav className="mb-6 overflow-x-auto pb-1 lg:hidden">
          <ul className="flex min-w-max gap-2">
            {TOC_ITEMS.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="block rounded-md border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10">
          <aside className="hidden lg:block">
            <div className="sticky top-20">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                On this page
              </p>
              <ul className="space-y-1">
                {TOC_ITEMS.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="block rounded px-2 py-1 text-sm text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div className="space-y-14">
            <section id="overview" className="scroll-mt-24 space-y-4">
              <h1 className="text-3xl font-semibold tracking-tight">Byun DateRange Picker</h1>
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                A copy-paste React date range picker with presets, optional time and timezone
                inputs, and 3-click range selection. This demo page focuses on practical usage and
                API details in a document-first layout.
              </p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                <li>Preset sidebar with customizable preset definitions</li>
                <li>Optional time and timezone controls</li>
                <li>Controlled and uncontrolled usage patterns</li>
                <li>Accessible defaults with keyboard support</li>
              </ul>
            </section>

            <section id="live-demo" className="scroll-mt-24 space-y-3">
              <h2 className="text-2xl font-semibold tracking-tight">Live demo</h2>
              <p className="text-sm text-muted-foreground">
                Full picker with time, timezone, and no-date-range mode enabled.
              </p>
              <div className="rounded-md border bg-card/50 p-4">
                <SuperDateRangePicker
                  id="live-demo-picker"
                  showTime
                  showTimezone
                  allowNoDateRange
                  dateFormat={DEMO_DATE_FORMAT}
                  onApply={setAppliedLive}
                />
                <RangeReadout value={appliedLive} />
              </div>
            </section>

            <section id="quick-start" className="scroll-mt-24 space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight">Quick start</h2>
                <p className="text-sm text-muted-foreground">
                  Prerequisites: Node.js 20+ and pnpm 10+.
                </p>
                <p className="text-sm text-muted-foreground">
                  This is a copy-paste component, not an npm package. Copy the files below into
                  your project and install the dependencies.
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-sm font-semibold">1. Clone and copy required files</p>
                  <CodeBlock
                    code={`git clone https://github.com/hyunghwan/byun-daterange-picker.git
cd byun-daterange-picker`}
                  />
                  <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                    {REQUIRED_FILES.map((file) => (
                      <li key={file}>
                        <code>{file}</code>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold">2. Install dependencies</p>
                  <CodeBlock
                    code={`pnpm add date-fns react-day-picker lucide-react cmdk \\
  @radix-ui/react-popover @radix-ui/react-dialog \\
  @radix-ui/react-separator @radix-ui/react-switch \\
  @radix-ui/react-slot class-variance-authority \\
  clsx tailwind-merge`}
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold">3. Use in your app</p>
                  <CodeBlock
                    code={`import { SuperDateRangePicker } from "@/components/ui/super-date-range-picker";

export default function App() {
  return <SuperDateRangePicker onApply={(range) => console.log(range)} />;
}`}
                  />
                </div>
              </div>
            </section>

            <section id="examples" className="scroll-mt-24 space-y-5">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight">Examples</h2>
                <p className="text-sm text-muted-foreground">
                  Core examples are shown by default. Advanced variants are grouped in a collapsed
                  section.
                </p>
              </div>

              <div className="space-y-4">
                <ExampleBlock
                  title="Default"
                  description="Preset sidebar + 2-month calendar with Apply commit."
                  code={`<SuperDateRangePicker
  onApply={(range) => console.log(range)}
/>`}
                >
                  <SuperDateRangePicker onApply={setAppliedDefault} />
                  <RangeReadout value={appliedDefault} />
                </ExampleBlock>

                <ExampleBlock
                  title="Time + timezone"
                  description="Enable both time inputs and timezone selector."
                  code={`<SuperDateRangePicker
  showTime
  showTimezone
  dateFormat="dd-MMM-yyyy"
  onApply={(range) => console.log(range)}
/>`}
                >
                  <SuperDateRangePicker
                    showTime
                    showTimezone
                    dateFormat={DEMO_DATE_FORMAT}
                    onApply={setAppliedTimeZone}
                  />
                  <RangeReadout value={appliedTimeZone} />
                </ExampleBlock>

                <ExampleBlock
                  title="Allow no date range"
                  description="Adds an All dates option and Skip date filter toggle."
                  code={`<SuperDateRangePicker
  allowNoDateRange
  onApply={(range) => console.log(range)}
/>`}
                >
                  <SuperDateRangePicker allowNoDateRange onApply={setAppliedNoDate} />
                  <RangeReadout value={appliedNoDate} />
                </ExampleBlock>
              </div>

              <details className="rounded-md border bg-card/30">
                <summary className="cursor-pointer px-4 py-3 text-sm font-medium">
                  Advanced examples
                </summary>
                <div className="space-y-4 border-t px-4 py-4">
                  <ExampleBlock
                    title="No presets"
                    description="Calendar-only mode by hiding the preset sidebar."
                    code={`<SuperDateRangePicker
  showPresets={false}
  showTime
  showTimezone
  dateFormat="dd-MMM-yyyy"
  onApply={(range) => console.log(range)}
/>`}
                  >
                    <SuperDateRangePicker
                      showPresets={false}
                      showTime
                      showTimezone
                      dateFormat={DEMO_DATE_FORMAT}
                      onApply={setAppliedNoPresets}
                    />
                    <RangeReadout value={appliedNoPresets} />
                  </ExampleBlock>

                  <ExampleBlock
                    title="Custom presets"
                    description="Inject your own DateRangePreset array."
                    code={`import { startOfYear, subDays } from "date-fns";

const myPresets = [
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
/>`}
                  >
                    <SuperDateRangePicker
                      presets={[
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
                        ...DEFAULT_PRESETS.slice(3),
                      ]}
                      defaultPreset="ytd"
                      onApply={setAppliedCustomPresets}
                    />
                    <RangeReadout value={appliedCustomPresets} />
                  </ExampleBlock>

                </div>
              </details>
            </section>

            <section id="api-reference" className="scroll-mt-24 space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight">API reference</h2>
                <p className="text-sm text-muted-foreground">
                  Props for <code>SuperDateRangePicker</code>.
                </p>
              </div>

              <PropsTable
                rows={[
                  { prop: "value", type: "SuperDateRangeValue", defaultValue: "-", description: "Controlled value. Pass null for no date range." },
                  { prop: "defaultValue", type: "SuperDateRangeValue", defaultValue: "-", description: "Initial value for uncontrolled mode." },
                  { prop: "onApply", type: "(value) => void", defaultValue: "-", description: "Called when the user clicks Apply." },
                  { prop: "onChange", type: "(value) => void", defaultValue: "-", description: "Called for pending changes before Apply." },
                  { prop: "showPresets", type: "boolean", defaultValue: "true", description: "Shows preset sidebar." },
                  { prop: "presets", type: "DateRangePreset[]", defaultValue: "DEFAULT_PRESETS", description: "Custom preset list." },
                  { prop: "defaultPreset", type: "string", defaultValue: "-", description: "Preset key selected on first render." },
                  { prop: "showTime", type: "boolean", defaultValue: "false", description: "Adds HH:mm:ss inputs." },
                  { prop: "showTimezone", type: "boolean", defaultValue: "false", description: "Shows searchable timezone selector." },
                  { prop: "timezone", type: "string", defaultValue: "-", description: "Controlled timezone value." },
                  { prop: "defaultTimezone", type: "string", defaultValue: "local", description: "Initial timezone for uncontrolled mode." },
                  { prop: "onTimezoneChange", type: "(tz) => void", defaultValue: "-", description: "Called when timezone changes." },
                  { prop: "dateFormat", type: "string", defaultValue: "dd-MMM-yyyy", description: "date-fns format string for inputs and label." },
                  { prop: "minDate", type: "Date", defaultValue: "-", description: "Earliest selectable date." },
                  { prop: "maxDate", type: "Date", defaultValue: "-", description: "Latest selectable date." },
                  { prop: "disabled", type: "boolean", defaultValue: "false", description: "Disables trigger button." },
                  { prop: "allowNoDateRange", type: "boolean", defaultValue: "false", description: "Enables no-date-range mode." },
                  { prop: "noDateRangeLabel", type: "string", defaultValue: "All dates", description: "Label for no-date-range option." },
                  { prop: "placeholder", type: "string", defaultValue: "Select date range", description: "Trigger placeholder text." },
                  { prop: "triggerClassName", type: "string", defaultValue: "-", description: "Extra trigger classes." },
                  { prop: "triggerVariant", type: "string", defaultValue: "outline", description: "Trigger button variant." },
                  { prop: "align", type: "start | center | end", defaultValue: "start", description: "Popover alignment." },
                  { prop: "open", type: "boolean", defaultValue: "-", description: "Controlled popover open state." },
                  { prop: "onOpenChange", type: "(open) => void", defaultValue: "-", description: "Called when open state changes." },
                  { prop: "aria-label", type: "string", defaultValue: "auto", description: "Accessible label for trigger button." },
                  { prop: "aria-describedby", type: "string", defaultValue: "-", description: "ID describing the picker." },
                  { prop: "id", type: "string", defaultValue: "-", description: "ID forwarded to trigger button." },
                  { prop: "className", type: "string", defaultValue: "-", description: "Extra wrapper classes." },
                ]}
              />
            </section>
          </div>
        </div>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>byun-daterange-picker · MIT License</p>
          <div className="flex items-center gap-3">
            <span>Copyright {currentYear} Hyunghwan Byun</span>
            <a
              href="https://github.com/hyunghwan/byun-daterange-picker"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-foreground"
            >
              <Github className="h-3.5 w-3.5" />
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
