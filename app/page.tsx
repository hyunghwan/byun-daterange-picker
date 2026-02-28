"use client";

import { useState } from "react";
import { Github, Calendar, Clock, Globe, Layers, Zap, CheckCircle2, Copy, Check } from "lucide-react";
import { subDays, startOfYear } from "date-fns";

import {
  SuperDateRangePicker,
  PresetDateRangePicker,
  DEFAULT_PRESETS,
  type SuperDateRangeValue,
} from "@/components/ui/super-date-range-picker";

// ---------------------------------------------------------------------------
// Code snippet component
// ---------------------------------------------------------------------------

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-lg border bg-muted/40 font-mono text-xs">
      <button
        onClick={handleCopy}
        className="absolute right-3 top-3 flex items-center gap-1.5 rounded-md border bg-background px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        aria-label="Copy code"
      >
        {copied ? (
          <Check className="h-3 w-3 text-green-600" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
        {copied ? "Copied!" : "Copy"}
      </button>
      <pre className="overflow-x-auto p-4 pr-20 text-foreground leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Demo card component
// ---------------------------------------------------------------------------

function DemoCard({
  title,
  description,
  children,
  code,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  code: string;
}) {
  const [showCode, setShowCode] = useState(false);

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="p-5 border-b">
        <h3 className="font-semibold text-sm">{title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="p-5">{children}</div>
      <div className="border-t px-5 py-3">
        <button
          onClick={() => setShowCode((s) => !s)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {showCode ? "Hide code" : "Show code"}
        </button>
        {showCode && (
          <div className="mt-3">
            <CodeBlock code={code} />
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Range readout
// ---------------------------------------------------------------------------

function RangeReadout({ value }: { value: SuperDateRangeValue | undefined }) {
  if (value === undefined) {
    return (
      <p className="mt-3 text-xs text-muted-foreground">No value applied yet</p>
    );
  }
  if (value === null) {
    return (
      <p className="mt-3 text-xs text-muted-foreground">
        Applied:{" "}
        <span className="font-medium text-foreground">All dates (no filter)</span>
      </p>
    );
  }
  return (
    <p className="mt-3 text-xs text-muted-foreground">
      Applied:{" "}
      <span className="font-medium text-foreground">
        {value.from?.toLocaleDateString()} – {value.to?.toLocaleDateString() ?? "…"}
      </span>
    </p>
  );
}

// ---------------------------------------------------------------------------
// Feature pill
// ---------------------------------------------------------------------------

function FeaturePill({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-sm">
      <Icon className="h-4 w-4 text-primary" />
      <span>{label}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Props table
// ---------------------------------------------------------------------------

function PropsTable({
  rows,
}: {
  rows: { prop: string; type: string; default: string; description: string }[];
}) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="px-4 py-3 text-left font-medium text-xs text-muted-foreground uppercase tracking-wide">Prop</th>
            <th className="px-4 py-3 text-left font-medium text-xs text-muted-foreground uppercase tracking-wide">Type</th>
            <th className="px-4 py-3 text-left font-medium text-xs text-muted-foreground uppercase tracking-wide">Default</th>
            <th className="px-4 py-3 text-left font-medium text-xs text-muted-foreground uppercase tracking-wide">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.prop} className={i % 2 === 0 ? "" : "bg-muted/20"}>
              <td className="px-4 py-3 font-mono text-xs text-primary font-medium whitespace-nowrap">{row.prop}</td>
              <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">{row.type}</td>
              <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">{row.default}</td>
              <td className="px-4 py-3 text-xs text-muted-foreground">{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function DemoPage() {
  const [applied1, setApplied1] = useState<SuperDateRangeValue | undefined>(undefined);
  const [applied2, setApplied2] = useState<SuperDateRangeValue | undefined>(undefined);
  const [applied3, setApplied3] = useState<SuperDateRangeValue | undefined>(undefined);
  const [applied4, setApplied4] = useState<SuperDateRangeValue | undefined>(undefined);
  const [applied5, setApplied5] = useState<SuperDateRangeValue | undefined>(undefined);
  const [applied6, setApplied6] = useState<SuperDateRangeValue | undefined>(undefined);
  const [applied7, setApplied7] = useState<SuperDateRangeValue | undefined>(undefined);
  const [appliedPreset, setAppliedPreset] = useState<SuperDateRangeValue | undefined>(undefined);

  return (
    <div className="min-h-screen bg-background">
      {/* ---- Header ---- */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm">byun-daterange-picker</span>
          </div>
          <a
            href="https://github.com/hyunghwan/byun-daterange-picker"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
          >
            <Github className="h-4 w-4" />
            GitHub
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16 space-y-24">
        {/* ---- Hero ---- */}
        <section className="space-y-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full border bg-primary/5 px-3 py-1 text-xs text-primary font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              v1.0.0
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              Byun DateRange Picker
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              A full-featured React date range picker with preset sidebar, optional time &amp; timezone
              inputs, 3-click selection UX, and WCAG 2.2 AA accessibility. Built with shadcn/ui,
              Radix UI, and Tailwind CSS.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <FeaturePill icon={Layers} label="Preset sidebar" />
            <FeaturePill icon={Clock} label="Time inputs" />
            <FeaturePill icon={Globe} label="Timezone selector" />
            <FeaturePill icon={Zap} label="3-click selection" />
            <FeaturePill icon={CheckCircle2} label="WCAG 2.2 AA" />
            <FeaturePill icon={Calendar} label="Controlled & uncontrolled" />
          </div>

          <div className="rounded-xl border bg-card p-6">
            <p className="text-xs text-muted-foreground mb-4 font-medium uppercase tracking-wide">Live demo</p>
            <SuperDateRangePicker
              id="hero-demo"
              showTime
              showTimezone
              allowNoDateRange
              onApply={setApplied1}
            />
            <RangeReadout value={applied1} />
          </div>
        </section>

        {/* ---- Quick start ---- */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Quick start</h2>
            <p className="mt-2 text-muted-foreground">
              Clone the repo and copy the component files into your project.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-medium">1. Clone or copy the component files</p>
              <CodeBlock code={`# Clone the demo repo
git clone https://github.com/hyunghwan/byun-daterange-picker.git

# Or copy the component files directly to your project:
# components/ui/super-date-range-picker.tsx
# components/ui/calendar.tsx`} />
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-2 font-medium">2. Install dependencies</p>
              <CodeBlock code={`npm install date-fns react-day-picker lucide-react cmdk \\
  @radix-ui/react-popover @radix-ui/react-dialog \\
  @radix-ui/react-separator @radix-ui/react-switch \\
  @radix-ui/react-slot class-variance-authority \\
  clsx tailwind-merge`} />
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-2 font-medium">3. Use in your project</p>
              <CodeBlock code={`import { SuperDateRangePicker } from "@/components/ui/super-date-range-picker";

export default function App() {
  return (
    <SuperDateRangePicker
      onApply={(range) => console.log(range)}
    />
  );
}`} />
            </div>
          </div>
        </section>

        {/* ---- Demos ---- */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Examples</h2>
            <p className="mt-2 text-muted-foreground">
              All variants of <code className="text-xs rounded bg-muted px-1 py-0.5">SuperDateRangePicker</code> and <code className="text-xs rounded bg-muted px-1 py-0.5">PresetDateRangePicker</code>.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Default */}
            <DemoCard
              title="Default"
              description="Preset sidebar + 2-month calendar. First click sets start date (dashed pending range), second click confirms end date."
              code={`<SuperDateRangePicker
  onApply={(range) => console.log(range)}
/>`}
            >
              <SuperDateRangePicker onApply={setApplied2} />
              <RangeReadout value={applied2} />
            </DemoCard>

            {/* With time */}
            <DemoCard
              title="With time"
              description="showTime — appends editable HH:mm:ss fields to each date input."
              code={`<SuperDateRangePicker
  showTime
  onApply={(range) => console.log(range)}
/>`}
            >
              <SuperDateRangePicker showTime onApply={setApplied3} />
              <RangeReadout value={applied3} />
            </DemoCard>

            {/* With timezone */}
            <DemoCard
              title="With timezone"
              description="showTimezone — adds a searchable timezone dropdown below the calendar."
              code={`<SuperDateRangePicker
  showTimezone
  onApply={(range) => console.log(range)}
/>`}
            >
              <SuperDateRangePicker showTimezone onApply={setApplied4} />
              <RangeReadout value={applied4} />
            </DemoCard>

            {/* Allow no date range */}
            <DemoCard
              title="Allow no date range"
              description='allowNoDateRange — adds an "All dates" option to the preset list and a "Skip date filter" toggle in the footer.'
              code={`<SuperDateRangePicker
  allowNoDateRange
  onApply={(range) => console.log(range)}
/>`}
            >
              <SuperDateRangePicker allowNoDateRange onApply={setApplied5} />
              <RangeReadout value={applied5} />
            </DemoCard>

            {/* No presets */}
            <DemoCard
              title="No presets"
              description="showPresets={false} — hides the sidebar; calendar only."
              code={`<SuperDateRangePicker
  showPresets={false}
  showTime
  showTimezone
  onApply={(range) => console.log(range)}
/>`}
            >
              <SuperDateRangePicker
                showPresets={false}
                showTime
                showTimezone
                onApply={setApplied6}
              />
              <RangeReadout value={applied6} />
            </DemoCard>

            {/* Custom presets */}
            <DemoCard
              title="Custom presets"
              description="Pass your own presets array with any key/label/getRange combination."
              code={`import { startOfYear } from "date-fns";

const myPresets = [
  {
    key: "ytd",
    label: "Year to date",
    getRange: () => ({
      from: startOfYear(new Date()),
      to: new Date(),
    }),
  },
  {
    key: "last90",
    label: "Last 90 days",
    getRange: () => ({
      from: subDays(new Date(), 90),
      to: new Date(),
    }),
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
                onApply={setApplied7}
              />
              <RangeReadout value={applied7} />
            </DemoCard>
          </div>

          {/* PresetDateRangePicker — full width */}
          <DemoCard
            title="PresetDateRangePicker"
            description="Lightweight variant — shows a preset list by default, switches to a 2-month calendar for Custom. Presets apply immediately with no Apply step."
            code={`import { PresetDateRangePicker } from "@/components/ui/super-date-range-picker";

<PresetDateRangePicker
  defaultPreset="2months"
  onApply={(range) => console.log(range)}
/>`}
          >
            <PresetDateRangePicker defaultPreset="2months" onApply={setAppliedPreset} />
            <RangeReadout value={appliedPreset} />
          </DemoCard>
        </section>

        {/* ---- API Reference ---- */}
        <section className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">API reference</h2>
            <p className="mt-2 text-muted-foreground">
              Full props for <code className="text-xs rounded bg-muted px-1 py-0.5">SuperDateRangePicker</code>.
            </p>
          </div>

          <PropsTable
            rows={[
              { prop: "value", type: "SuperDateRangeValue", default: "—", description: "Controlled value. Pass null to represent 'no date range'." },
              { prop: "defaultValue", type: "SuperDateRangeValue", default: "—", description: "Initial value for uncontrolled mode." },
              { prop: "onApply", type: "(value) => void", default: "—", description: "Called when the user confirms a selection by clicking Apply." },
              { prop: "onChange", type: "(value) => void", default: "—", description: "Called on every pending calendar/input change before Apply." },
              { prop: "showPresets", type: "boolean", default: "true", description: "Show the preset sidebar." },
              { prop: "presets", type: "DateRangePreset[]", default: "DEFAULT_PRESETS", description: "Custom preset list. Each preset needs key, label, and getRange." },
              { prop: "defaultPreset", type: "string", default: "—", description: "Key of the preset to activate on initial render." },
              { prop: "showTime", type: "boolean", default: "false", description: "Append HH:mm:ss time inputs to each date field." },
              { prop: "showTimezone", type: "boolean", default: "false", description: "Show a searchable timezone selector." },
              { prop: "timezone", type: "string", default: "—", description: "Controlled timezone (e.g. 'America/New_York')." },
              { prop: "defaultTimezone", type: "string", default: "local", description: "Initial timezone for uncontrolled mode." },
              { prop: "onTimezoneChange", type: "(tz) => void", default: "—", description: "Called when the user selects a different timezone." },
              { prop: "dateFormat", type: "string", default: "dd-MMM-yyyy", description: "date-fns format string for inputs and trigger label." },
              { prop: "minDate", type: "Date", default: "—", description: "Earliest selectable date." },
              { prop: "maxDate", type: "Date", default: "—", description: "Latest selectable date." },
              { prop: "disabled", type: "boolean", default: "false", description: "Disables the trigger button." },
              { prop: "allowNoDateRange", type: "boolean", default: "false", description: "Adds an 'All dates' option to clear the date constraint." },
              { prop: "noDateRangeLabel", type: "string", default: "All dates", description: "Label for the null-range option." },
              { prop: "placeholder", type: "string", default: "Select date range", description: "Trigger placeholder text." },
              { prop: "triggerClassName", type: "string", default: "—", description: "Extra class names for the trigger button." },
              { prop: "triggerVariant", type: "string", default: "outline", description: "Button variant for the trigger." },
              { prop: "align", type: "start | center | end", default: "start", description: "Popover alignment relative to the trigger." },
              { prop: "open", type: "boolean", default: "—", description: "Controlled popover open state." },
              { prop: "onOpenChange", type: "(open) => void", default: "—", description: "Called when the popover open state changes." },
            ]}
          />

          <div>
            <p className="text-sm text-muted-foreground mb-4 font-medium">
              <code className="text-xs rounded bg-muted px-1 py-0.5">PresetDateRangePicker</code> props
            </p>
            <PropsTable
              rows={[
                { prop: "defaultPreset", type: "string", default: "2months", description: "Initial preset key." },
                { prop: "presets", type: "DateRangePreset[]", default: "DEFAULT_PRESETS", description: "Custom preset list." },
                { prop: "onApply", type: "(value) => void", default: "—", description: "Called when the committed range changes." },
                { prop: "align", type: "start | center | end", default: "start", description: "Popover alignment." },
                { prop: "className", type: "string", default: "—", description: "Extra class names." },
              ]}
            />
          </div>
        </section>

        {/* ---- Tech stack ---- */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Built with</h2>
            <p className="mt-2 text-muted-foreground">Open-source libraries that power this component.</p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { name: "shadcn/ui", desc: "Re-usable component foundation", href: "https://ui.shadcn.com" },
              { name: "Radix UI", desc: "Accessible primitive components", href: "https://radix-ui.com" },
              { name: "react-day-picker", desc: "Calendar engine (v9)", href: "https://react-day-picker.js.org" },
              { name: "date-fns", desc: "Date utilities (v4)", href: "https://date-fns.org" },
              { name: "cmdk", desc: "Command palette for timezone search", href: "https://cmdk.paco.me" },
              { name: "Tailwind CSS", desc: "Utility-first CSS framework (v4)", href: "https://tailwindcss.com" },
              { name: "Lucide React", desc: "Icon library", href: "https://lucide.dev" },
              { name: "class-variance-authority", desc: "Component variant management", href: "https://cva.style" },
              { name: "tailwind-merge", desc: "Smart Tailwind class merging", href: "https://github.com/dcastil/tailwind-merge" },
            ].map((lib) => (
              <a
                key={lib.name}
                href={lib.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col gap-1 rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
              >
                <span className="font-medium text-sm group-hover:text-accent-foreground">{lib.name}</span>
                <span className="text-xs text-muted-foreground">{lib.desc}</span>
              </a>
            ))}
          </div>
        </section>
      </main>

      {/* ---- Footer ---- */}
      <footer className="border-t bg-muted/30 mt-24">
        <div className="mx-auto max-w-6xl px-6 py-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>byun-daterange-picker</span>
            <span>·</span>
            <span>MIT License</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>© 2025 Hyunghwan Byun</span>
            <a
              href="https://github.com/hyunghwan/byun-daterange-picker"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-foreground transition-colors"
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
