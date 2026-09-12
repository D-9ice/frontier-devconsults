import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Activity, ArrowRight, BatteryCharging, Boxes, BrainCircuit, CircuitBoard,
  Cpu, Factory, Gauge, Lightbulb, MonitorCog, RadioTower, ShieldCheck,
  SlidersHorizontal, Wrench, Zap,
} from 'lucide-react';
import SpecializedAnalytics from '@/components/SpecializedAnalytics';
import SpecializedCtaLink from '@/components/SpecializedCtaLink';
import { SITE_ORIGIN } from '@/lib/site-url';

const canonical = `${SITE_ORIGIN}/services/custom-specialized-solutions`;

export const metadata: Metadata = {
  title: 'Custom Specialized Solutions | Hardware & Software Co-Engineering',
  description: 'Integrated electronics, electrical, embedded, control, monitoring, IoT, and software engineering for specialized systems.',
  alternates: { canonical },
  openGraph: { title: 'Custom Specialized Solutions | Frontier DevConsults', description: 'Electronics. Electrical Engineering. Embedded Intelligence. Software. One Integrated Solution.', url: canonical, type: 'website' },
  twitter: { card: 'summary_large_image', title: 'Custom Specialized Solutions | Frontier DevConsults', description: 'Integrated hardware and software engineering for specialized systems.' },
};

const capabilities = [
  { icon: CircuitBoard, title: 'Electronics & PCB Engineering', text: 'Circuit analysis, board-level design support, sensor interfaces, signal conditioning, component selection, and diagnostic investigation.' },
  { icon: Zap, title: 'Electrical & Energy Systems', text: 'Power distribution, protection concepts, energy monitoring, battery systems, charging, power electronics, and practical electrical integration.' },
  { icon: Cpu, title: 'Embedded Intelligence', text: 'Microcontroller firmware, edge logic, device state management, local automation, communications, and resilient embedded operation.' },
  { icon: SlidersHorizontal, title: 'Control & Automation', text: 'Closed-loop control, actuator coordination, alarms, interlocks, schedules, configurable set-points, and supervisory workflows.' },
  { icon: Activity, title: 'Monitoring & Diagnostics', text: 'Telemetry, dashboards, event histories, fault detection, condition monitoring, maintenance signals, and remote diagnostic tools.' },
  { icon: RadioTower, title: 'Connected & IoT Systems', text: 'Secure device-to-cloud communication, APIs, gateways, remote configuration, notifications, and operational data synchronization.' },
  { icon: MonitorCog, title: 'Operator Software', text: 'Web, mobile, desktop, and human-machine interfaces that make complex equipment understandable, controllable, and supportable.' },
  { icon: Wrench, title: 'Retrofit & Modernization', text: 'Legacy equipment assessment, instrumentation upgrades, replacement controllers, data capture, and phased modernization without needless replacement.' },
  { icon: Factory, title: 'Industrial & OEM Support', text: 'Product architecture, prototype-to-production planning, integration documentation, test strategy, and engineering support for equipment builders.' },
];

const examples = [
  { title: 'Intelligent Energy Management', text: 'A representative system could combine metering, load prioritization, battery status, remote alerts, dashboards, and controlled switching.' },
  { title: 'Connected Equipment Monitor', text: 'A representative retrofit could capture temperature, current, vibration, runtime, and fault events for remote visibility and maintenance planning.' },
  { title: 'Custom Embedded Controller', text: 'A representative controller could coordinate sensors, actuators, safety states, local user controls, communications, and a companion application.' },
  { title: 'Legacy System Modernization', text: 'A representative upgrade could retain serviceable machinery while replacing obsolete controls, adding instrumentation, and exposing operational data securely.' },
];

const process = [
  ['01', 'Discovery & assessment', 'We clarify the operating environment, users, constraints, existing assets, risks, and intended outcome.'],
  ['02', 'System architecture', 'We define functional boundaries across electronics, electrical power, embedded control, communications, software, and data.'],
  ['03', 'Prototype & integration', 'We implement the agreed proof of concept or staged system and integrate its hardware and software interfaces.'],
  ['04', 'Verification & handover', 'We validate against agreed acceptance criteria and provide the appropriate documentation, deployment, and support plan.'],
];

export default function CustomSpecializedSolutionsPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Service', name: 'Custom Specialized Solutions', serviceType: 'Hardware and software co-engineering', provider: { '@type': 'Organization', name: 'Frontier DevConsults', url: SITE_ORIGIN }, areaServed: 'Worldwide', url: canonical, description: metadata.description },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_ORIGIN },
        { '@type': 'ListItem', position: 2, name: 'Services', item: `${SITE_ORIGIN}/services` },
        { '@type': 'ListItem', position: 3, name: 'Custom Specialized Solutions', item: canonical },
      ] },
    ],
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <SpecializedAnalytics />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <section className="relative overflow-hidden bg-slate-950 py-24 text-white sm:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,.35),transparent_45%)]" />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-blue-300">Custom Specialized Solutions</p>
          <h1 className="mt-5 max-w-5xl text-4xl font-black leading-tight sm:text-6xl">We Don&apos;t Just Build Software. We Build the Systems Software Controls.</h1>
          <p className="mt-7 max-w-4xl text-xl font-semibold leading-8 text-blue-100 sm:text-2xl">Electronics. Electrical Engineering. Embedded Intelligence. Software. One Integrated Solution.</p>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">Frontier DevConsults helps organizations turn specialized operational problems into coherent engineered systems—from sensing and power to embedded control, connectivity, applications, and actionable data.</p>
          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <SpecializedCtaLink href="/services/custom-specialized-solutions/start-project" className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-4 font-bold text-white hover:bg-blue-500">Start a Specialized Project <ArrowRight className="ml-2 h-5 w-5" /></SpecializedCtaLink>
            <Link href="#capabilities" className="inline-flex items-center justify-center rounded-lg border border-white/30 px-6 py-4 font-bold hover:bg-white/10">Explore capabilities</Link>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">One coordinated architecture</p>
          <h2 className="mt-3 max-w-4xl text-3xl font-black sm:text-4xl">From the physical process to the decision-making interface</h2>
          <div className="mt-10 grid gap-3 md:grid-cols-6" aria-label="Integrated system architecture">
            {['Physical System', 'Sensors & Power', 'Embedded Control', 'Connectivity', 'Software & Data', 'Human Decisions'].map((label, index) => (
              <div key={label} className="relative rounded-xl border border-blue-200 bg-blue-50 px-4 py-5 text-center font-bold text-blue-950">
                {label}{index < 5 && <ArrowRight className="mx-auto mt-3 h-4 w-4 text-blue-500 md:absolute md:-right-3 md:top-1/2 md:mt-0 md:-translate-y-1/2" aria-hidden="true" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="capabilities" className="py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="max-w-3xl"><p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">Engineering capability</p><h2 className="mt-3 text-3xl font-black sm:text-5xl">A system-level approach, not disconnected parts</h2><p className="mt-5 text-lg leading-8 text-slate-600">Each engagement is scoped to the real problem. We combine only the disciplines the solution needs.</p></div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {capabilities.map(({ icon: Icon, title, text }) => <article key={title} data-specialized-capability className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700"><Icon className="h-6 w-6" /></div><h3 className="mt-5 text-xl font-bold">{title}</h3><p className="mt-3 leading-7 text-slate-600">{text}</p></article>)}
          </div>
        </div>
      </section>

      <section className="bg-slate-950 py-20 text-white">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div><p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-300">What integration changes</p><h2 className="mt-3 text-3xl font-black sm:text-5xl">One technical direction from device to dashboard</h2><p className="mt-5 text-lg leading-8 text-slate-300">A single system architecture reduces ambiguity between electrical behavior, firmware, communications, application logic, and operator expectations. It also makes testing, diagnosis, maintenance, and later expansion more deliberate.</p></div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[['Control', 'Coordinate motors, relays, valves, chargers, alarms, and other controlled equipment.'], ['Observe', 'Turn sensor and device data into useful state, history, trends, and alerts.'], ['Protect', 'Design fault handling, interlocks, access controls, recovery paths, and safe operating states.'], ['Improve', 'Use evidence from the system to support diagnostics, preventive action, and predictive maintenance.']].map(([title, text]) => <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-6"><h3 className="text-xl font-bold text-blue-200">{title}</h3><p className="mt-2 leading-7 text-slate-300">{text}</p></div>)}
            </div>
          </div>
      </div></section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">Representative concepts</p><h2 className="mt-3 text-3xl font-black sm:text-5xl">Examples of the systems we can engineer</h2><p className="mt-4 max-w-3xl text-slate-600">These are representative capabilities, not claims that each system is a completed client case study.</p>
          <div className="mt-10 grid gap-6 md:grid-cols-2">{examples.map(({ title, text }) => <article key={title} data-specialized-example className="rounded-2xl border border-slate-200 bg-white p-7"><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-900">Representative Capability</span><h3 className="mt-5 text-2xl font-bold">{title}</h3><p className="mt-3 leading-7 text-slate-600">{text}</p></article>)}</div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]"><div><Lightbulb className="h-10 w-10 text-blue-700" /><h2 className="mt-5 text-3xl font-black sm:text-4xl">Built for difficult, non-generic requirements</h2><p className="mt-5 leading-8 text-slate-600">Suitable for founders, manufacturers, facilities, equipment owners, laboratories, engineering teams, public-interest organizations, and OEMs that need a solution shaped around their operation.</p></div><div className="grid gap-5 sm:grid-cols-2">{process.map(([number, title, text]) => <article key={number} className="rounded-2xl bg-slate-100 p-6"><span className="text-sm font-black text-blue-700">{number}</span><h3 className="mt-2 text-xl font-bold">{title}</h3><p className="mt-2 leading-7 text-slate-600">{text}</p></article>)}</div></div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-7"><Boxes className="h-8 w-8 text-blue-700" /><h2 className="mt-4 text-xl font-bold">Flexible engagement</h2><p className="mt-3 leading-7 text-slate-600">Assessment, architecture, prototype, subsystem delivery, complete integrated build, modernization, or ongoing technical support—defined by a written scope.</p></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-7"><BatteryCharging className="h-8 w-8 text-blue-700" /><h2 className="mt-4 text-xl font-bold">Designed for the environment</h2><p className="mt-3 leading-7 text-slate-600">Power quality, connectivity, operating conditions, maintenance capability, component availability, and user context are considered during discovery.</p></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-7"><BrainCircuit className="h-8 w-8 text-blue-700" /><h2 className="mt-4 text-xl font-bold">Evidence-led decisions</h2><p className="mt-3 leading-7 text-slate-600">Requirements, assumptions, tests, risks, and acceptance criteria are made explicit so decisions are traceable and outcomes are supportable.</p></div>
        </div>
      </section>

      <section className="border-y border-amber-200 bg-amber-50 py-12">
        <div className="mx-auto flex max-w-7xl gap-5 px-5 sm:px-6 lg:px-8"><ShieldCheck className="mt-1 h-8 w-8 shrink-0 text-amber-800" /><div><h2 className="text-xl font-bold text-amber-950">Safety, compliance, and certification</h2><p className="mt-2 leading-7 text-amber-950/80">Specialized engineering can involve hazardous energy, machinery, batteries, radio systems, environmental exposure, and regulated products. Final safety decisions, statutory approvals, certified designs, installations, and compliance testing must be completed by appropriately licensed professionals and accredited bodies where required. Frontier DevConsults will identify known constraints during scope definition but does not present a preliminary concept as regulatory certification.</p></div></div>
      </section>

      <section className="bg-blue-700 py-20 text-white"><div className="mx-auto max-w-4xl px-5 text-center sm:px-6"><p className="text-sm font-bold uppercase tracking-[0.22em] text-blue-100">Building Digital Excellence</p><h2 className="mt-4 text-3xl font-black sm:text-5xl">Have a specialized system that ordinary software cannot solve?</h2><p className="mt-5 text-lg leading-8 text-blue-100">Tell us what exists, what must change, and what success should look like. If the requirements are still unclear, request a Frontier assessment.</p><SpecializedCtaLink href="/services/custom-specialized-solutions/start-project" className="mt-8 inline-flex items-center rounded-lg bg-white px-7 py-4 font-bold text-blue-800 hover:bg-blue-50">Start a Specialized Project <ArrowRight className="ml-2 h-5 w-5" /></SpecializedCtaLink></div></section>
    </main>
  );
}
