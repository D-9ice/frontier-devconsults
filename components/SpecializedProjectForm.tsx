'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, FileLock2, LoaderCircle, Send } from 'lucide-react';
import { recordCommercialEvent } from '@/components/CommercialEvent';
import {
  connectivityRequirementOptions, controlRequirementOptions, currentSystemStates,
  developmentScopeOptions, interfaceRequirementOptions, monitoringRequirementOptions,
  specializedBudgetChoices, specializedLabels, specializedProjectTypes, specializedTimelines,
} from '@/lib/specialized-options';

type FormState = {
  idempotencyKey: string; fullName: string; email: string; country: string; company: string; phone: string; website: string; jobTitle: string;
  projectTypes: string[]; currentSystemState: string[]; projectDescription: string; equipmentType: string; operatingVoltage: string; powerLevel: string;
  motorType: string; batteryType: string; existingController: string; existingCommunicationInterface: string; sensorCount: string; deviceCount: string; environment: string;
  controlRequirements: string[]; monitoringRequirements: string[]; interfaceRequirements: string[]; connectivityRequirements: string[]; developmentScope: string[];
  timeline: string; budgetRange: string; additionalInformation: string; privacyAcknowledged: boolean; websiteField: string;
};

const initialForm: FormState = {
  idempotencyKey: '', fullName: '', email: '', country: '', company: '', phone: '', website: '', jobTitle: '', projectTypes: [], currentSystemState: [],
  projectDescription: '', equipmentType: '', operatingVoltage: '', powerLevel: '', motorType: '', batteryType: '', existingController: '', existingCommunicationInterface: '',
  sensorCount: '', deviceCount: '', environment: '', controlRequirements: [], monitoringRequirements: [], interfaceRequirements: [], connectivityRequirements: [],
  developmentScope: [], timeline: '', budgetRange: '', additionalInformation: '', privacyAcknowledged: false, websiteField: '',
};

const inputClass = 'mt-2 w-full rounded-lg border border-gray-300 px-3.5 py-3 text-gray-950 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100';

export default function SpecializedProjectForm() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const started = useRef(false);
  const router = useRouter();

  useEffect(() => { setForm((current) => ({ ...current, idempotencyKey: crypto.randomUUID() })); }, []);
  const setValue = (key: keyof FormState, value: string | boolean | string[]) => setForm((current) => ({ ...current, [key]: value }));
  const toggle = (key: keyof FormState, value: string) => setForm((current) => {
    const values = current[key] as string[];
    return { ...current, [key]: values.includes(value) ? values.filter((item) => item !== value) : [...values, value] };
  });
  const startTracking = () => {
    if (started.current) return;
    started.current = true;
    recordCommercialEvent('specialized_project_form_started');
  };

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true); setStatus(''); setErrors({});
    try {
      const query = new URLSearchParams(window.location.search);
      const response = await fetch('/api/specialized-projects', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, attribution: { utmSource: query.get('utm_source'), utmMedium: query.get('utm_medium'), utmCampaign: query.get('utm_campaign'), utmContent: query.get('utm_content'), utmTerm: query.get('utm_term'), referrer: document.referrer, landingPage: `${window.location.pathname}${window.location.search}` } }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setErrors(payload.fields || {});
        throw new Error(payload.error || 'Unable to submit your request.');
      }
      recordCommercialEvent('specialized_project_form_submitted');
      router.push(`/services/custom-specialized-solutions/confirmation/${encodeURIComponent(payload.reference)}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to submit your request.');
    } finally { setSubmitting(false); }
  }

  return (
    <form onSubmit={submit} onFocusCapture={startTracking} className="space-y-10" noValidate>
      {status && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">{status}</div>}
      {Object.keys(errors).length > 0 && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800"><p className="font-bold">Please correct the highlighted fields.</p><ul className="mt-2 list-disc pl-5 text-sm">{Object.values(errors).map((error) => <li key={error}>{error}</li>)}</ul></div>}
      <div className="absolute -left-[10000px]" aria-hidden="true"><label htmlFor="specialized-website-field">Leave this field empty</label><input id="specialized-website-field" tabIndex={-1} autoComplete="off" value={form.websiteField} onChange={(event) => setValue('websiteField', event.target.value)} /></div>

      <FormSection title="Your information" description="Required fields are marked with an asterisk.">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField id="fullName" label="Full Name *" value={form.fullName} error={errors.fullName} required onChange={(value) => setValue('fullName', value)} />
          <TextField id="email" label="Email *" value={form.email} error={errors.email} type="email" required onChange={(value) => setValue('email', value)} />
          <TextField id="country" label="Country *" value={form.country} error={errors.country} required onChange={(value) => setValue('country', value)} />
          <TextField id="company" label="Company / Organization" value={form.company} onChange={(value) => setValue('company', value)} />
          <TextField id="phone" label="Phone / WhatsApp" value={form.phone} type="tel" onChange={(value) => setValue('phone', value)} />
          <TextField id="jobTitle" label="Job Title / Role" value={form.jobTitle} onChange={(value) => setValue('jobTitle', value)} />
          <div className="sm:col-span-2"><TextField id="website" label="Website" value={form.website} error={errors.website} type="url" placeholder="https://example.com" onChange={(value) => setValue('website', value)} /></div>
        </div>
      </FormSection>

      <FormSection title="Project definition" description="Select every option that applies. It is fine to request Frontier’s assessment.">
        <Checklist legend="Project type *" values={specializedProjectTypes} selected={form.projectTypes} labels={specializedLabels.projectType} error={errors.projectTypes} onToggle={(value) => toggle('projectTypes', value)} />
        <Checklist legend="What currently exists?" values={currentSystemStates} selected={form.currentSystemState} labels={specializedLabels.currentState} onToggle={(value) => toggle('currentSystemState', value)} />
        <label className="block font-semibold text-gray-900" htmlFor="projectDescription">Describe the equipment, product or system and what you want Frontier DevConsults to make it do. *</label>
        <textarea id="projectDescription" rows={7} required aria-invalid={Boolean(errors.projectDescription)} aria-describedby={errors.projectDescription ? 'projectDescription-error' : undefined} value={form.projectDescription} onChange={(event) => setValue('projectDescription', event.target.value)} className={inputClass} placeholder="What should be controlled, monitored or automated? What should users see? What exists today, and what needs to change?" />
        {errors.projectDescription && <p id="projectDescription-error" className="mt-2 text-sm text-red-700">{errors.projectDescription}</p>}
      </FormSection>

      <FormSection title="Physical system information" description="Complete what you know. Leave unknown items blank or write “Need Frontier Assessment.”">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField id="equipmentType" label="Equipment type" value={form.equipmentType} onChange={(value) => setValue('equipmentType', value)} />
          <TextField id="operatingVoltage" label="Operating voltage" value={form.operatingVoltage} onChange={(value) => setValue('operatingVoltage', value)} />
          <TextField id="powerLevel" label="Approximate power level" value={form.powerLevel} onChange={(value) => setValue('powerLevel', value)} />
          <TextField id="motorType" label="Motor type" value={form.motorType} onChange={(value) => setValue('motorType', value)} />
          <TextField id="batteryType" label="Battery type" value={form.batteryType} onChange={(value) => setValue('batteryType', value)} />
          <TextField id="existingController" label="Existing controller / PCB" value={form.existingController} onChange={(value) => setValue('existingController', value)} />
          <TextField id="existingCommunicationInterface" label="Existing communication interface" value={form.existingCommunicationInterface} onChange={(value) => setValue('existingCommunicationInterface', value)} />
          <TextField id="sensorCount" label="Approximate number of sensors" value={form.sensorCount} onChange={(value) => setValue('sensorCount', value)} />
          <TextField id="deviceCount" label="Number of devices / machines" value={form.deviceCount} onChange={(value) => setValue('deviceCount', value)} />
          <div className="sm:col-span-2"><TextField id="environment" label="Operating environment and local/remote use" value={form.environment} placeholder="Indoor/outdoor, heat, dust, moisture, distance, local or remote operation" onChange={(value) => setValue('environment', value)} /></div>
        </div>
      </FormSection>

      <FormSection title="Control, monitoring and interfaces" description="These selections help us prepare the first technical assessment.">
        <Checklist legend="What should the software control?" values={controlRequirementOptions} selected={form.controlRequirements} labels={specializedLabels.control} onToggle={(value) => toggle('controlRequirements', value)} />
        <Checklist legend="What should the system monitor?" values={monitoringRequirementOptions} selected={form.monitoringRequirements} labels={specializedLabels.monitoring} onToggle={(value) => toggle('monitoringRequirements', value)} />
        <Checklist legend="How should users interact with the system?" values={interfaceRequirementOptions} selected={form.interfaceRequirements} labels={specializedLabels.interface} onToggle={(value) => toggle('interfaceRequirements', value)} />
        <Checklist legend="How should the system communicate?" values={connectivityRequirementOptions} selected={form.connectivityRequirements} labels={specializedLabels.connectivity} onToggle={(value) => toggle('connectivityRequirements', value)} />
      </FormSection>

      <FormSection title="Frontier scope and planning" description="Selections are for assessment and do not create a delivery commitment.">
        <Checklist legend="What should Frontier provide?" values={developmentScopeOptions} selected={form.developmentScope} labels={specializedLabels.scope} onToggle={(value) => toggle('developmentScope', value)} />
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField id="timeline" label="Preferred timeline" value={form.timeline} options={specializedTimelines} labels={specializedLabels.timeline} onChange={(value) => setValue('timeline', value)} />
          <SelectField id="budgetRange" label="Budget preference" value={form.budgetRange} options={specializedBudgetChoices} labels={specializedLabels.budget} onChange={(value) => setValue('budgetRange', value)} />
        </div>
        <label className="block font-semibold text-gray-900" htmlFor="additionalInformation">Additional requirements</label>
        <textarea id="additionalInformation" rows={5} value={form.additionalInformation} onChange={(event) => setValue('additionalInformation', event.target.value)} className={inputClass} placeholder="Safety considerations, deployment constraints, existing faults, desired outcomes, or other useful context" />
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-950"><p className="flex items-center gap-2 font-bold"><FileLock2 className="h-5 w-5" /> Confidential technical files</p><p className="mt-1">After initial review, Frontier can arrange a secure channel for equipment photos, schematics, datasheets, videos, PCB images and requirement documents. Files are not accepted through an insecure public upload.</p></div>
      </FormSection>

      <label className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-6 text-gray-700">
        <input type="checkbox" className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600" checked={form.privacyAcknowledged} onChange={(event) => setValue('privacyAcknowledged', event.target.checked)} aria-invalid={Boolean(errors.privacyAcknowledged)} />
        <span>I understand that Frontier will use this information to assess and respond to my request, subject to the <Link href="/privacy" className="font-semibold text-blue-700 underline">Privacy Policy</Link>. Submission does not guarantee feasibility, certification, pricing or delivery.</span>
      </label>
      {errors.privacyAcknowledged && <p className="text-sm text-red-700">{errors.privacyAcknowledged}</p>}
      <button type="submit" disabled={submitting || !form.idempotencyKey} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-6 py-3 font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
        {submitting ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}{submitting ? 'Submitting…' : 'Submit Specialized Engineering Project'}
      </button>
      <p className="flex items-start gap-2 text-sm leading-6 text-gray-600"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />You will receive a private reference number for this request.</p>
    </form>
  );
}

function FormSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <section className="space-y-6 border-b border-gray-200 pb-10 last:border-0"><div><h2 className="text-2xl font-bold text-gray-950">{title}</h2><p className="mt-2 text-sm leading-6 text-gray-600">{description}</p></div>{children}</section>;
}

function TextField({ id, label, value, onChange, error, required, type = 'text', placeholder }: { id: string; label: string; value: string; onChange: (value: string) => void; error?: string; required?: boolean; type?: string; placeholder?: string }) {
  return <label className="block font-semibold text-gray-900" htmlFor={id}>{label}<input id={id} type={type} required={required} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} className={inputClass} />{error && <span id={`${id}-error`} className="mt-2 block text-sm font-normal text-red-700">{error}</span>}</label>;
}

function Checklist<T extends readonly string[]>({ legend, values, selected, labels, onToggle, error }: { legend: string; values: T; selected: string[]; labels: Record<T[number], string>; onToggle: (value: T[number]) => void; error?: string }) {
  return <fieldset><legend className="font-bold text-gray-950">{legend}</legend><div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{values.map((value) => <label key={value} className="flex min-h-11 items-start gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 hover:border-blue-300"><input type="checkbox" checked={selected.includes(value)} onChange={() => onToggle(value as T[number])} className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600" /><span>{labels[value as T[number]]}</span></label>)}</div>{error && <p className="mt-2 text-sm text-red-700">{error}</p>}</fieldset>;
}

function SelectField<T extends readonly string[]>({ id, label, value, options, labels, onChange }: { id: string; label: string; value: string; options: T; labels: Record<T[number], string>; onChange: (value: string) => void }) {
  return <label className="block font-semibold text-gray-900" htmlFor={id}>{label}<select id={id} value={value} onChange={(event) => onChange(event.target.value)} className={inputClass}><option value="">Not specified</option>{options.map((option) => <option key={option} value={option}>{labels[option as T[number]]}</option>)}</select></label>;
}
