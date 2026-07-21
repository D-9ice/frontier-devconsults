'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Code2, Edit3, Eye, EyeOff, Plus, Save, Trash2, X } from 'lucide-react';
import { MediaUpload } from '@/components/admin/media-upload';

type ProjectStatus = 'Production' | 'Development' | 'Planning';
type ProjectColor = 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'yellow';
type Project = {
  id: string;
  title: string;
  slug: string | null;
  category: string;
  status: ProjectStatus;
  visibility: 'draft' | 'published';
  featured: boolean;
  sortOrder: number;
  description: string;
  technologies: string[];
  features: string[];
  logoUrl: string | null;
  liveLink: string | null;
  downloadLink: string | null;
  color: ProjectColor;
};

type ProjectForm = Omit<Project, 'id'>;

const emptyProject: ProjectForm = {
  title: '', slug: '', category: '', status: 'Planning', visibility: 'draft', featured: false,
  sortOrder: 0, description: '', technologies: [], features: [], logoUrl: '', liveLink: '', downloadLink: '', color: 'blue',
};

const statuses: ProjectStatus[] = ['Production', 'Development', 'Planning'];
const colors: ProjectColor[] = ['blue', 'green', 'purple', 'orange', 'pink', 'yellow'];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState<ProjectForm>(emptyProject);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const stats = useMemo(() => ({
    production: projects.filter((project) => project.status === 'Production').length,
    development: projects.filter((project) => project.status === 'Development').length,
    planning: projects.filter((project) => project.status === 'Planning').length,
  }), [projects]);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/projects', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load projects.');
      setProjects(data);
    } catch (error) {
      setNotice({ type: 'error', text: error instanceof Error ? error.message : 'Unable to load projects.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadProjects(); }, []);

  const openCreate = () => {
    setForm({ ...emptyProject, sortOrder: projects.length });
    setEditingId(null);
    setNotice(null);
    setIsFormOpen(true);
  };

  const openEdit = (project: Project) => {
    const { id, ...values } = project;
    setEditingId(id);
    setForm(values);
    setNotice(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setForm(emptyProject);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setNotice(null);
    try {
      const response = await fetch(editingId ? `/api/admin/projects/${editingId}` : '/api/admin/projects', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to save project.');
      await loadProjects();
      closeForm();
      setNotice({ type: 'success', text: editingId ? 'Project updated.' : 'Project created.' });
    } catch (error) {
      setNotice({ type: 'error', text: error instanceof Error ? error.message : 'Unable to save project.' });
    } finally {
      setIsSaving(false);
    }
  };

  const removeProject = async (project: Project) => {
    if (!window.confirm(`Delete ${project.title}? This cannot be undone.`)) return;
    setNotice(null);
    try {
      const response = await fetch(`/api/admin/projects/${project.id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to delete project.');
      setProjects((items) => items.filter((item) => item.id !== project.id));
      setNotice({ type: 'success', text: 'Project deleted.' });
    } catch (error) {
      setNotice({ type: 'error', text: error instanceof Error ? error.message : 'Unable to delete project.' });
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/admin/dashboard" className="mb-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Projects</h1>
            <p className="mt-2 text-gray-600">Create, publish, edit, reorder, or remove portfolio projects.</p>
          </div>
          <button onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">
            <Plus className="h-5 w-5" /> Add Project
          </button>
        </div>

        {notice && <div className={`mb-6 rounded-lg border p-4 ${notice.type === 'success' ? 'border-green-200 bg-green-50 text-green-800' : 'border-red-200 bg-red-50 text-red-800'}`}>{notice.text}</div>}

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Stat label="Production" value={stats.production} color="text-green-600" />
          <Stat label="In Development" value={stats.development} color="text-blue-600" />
          <Stat label="Planned" value={stats.planning} color="text-gray-700" />
        </div>

        {isFormOpen && <ProjectEditor form={form} setForm={setForm} editing={Boolean(editingId)} isSaving={isSaving} onClose={closeForm} onSubmit={submit} />}

        <section className="overflow-hidden rounded-lg bg-white shadow-sm">
          <div className="border-b border-gray-200 p-6"><h2 className="text-xl font-bold text-gray-900">All Projects</h2></div>
          {isLoading ? <p className="p-8 text-gray-600">Loading projects...</p> : projects.length === 0 ? (
            <div className="p-12 text-center"><Code2 className="mx-auto mb-4 h-12 w-12 text-gray-300" /><h3 className="text-lg font-semibold text-gray-900">No projects yet</h3><p className="mt-2 text-gray-600">Add the first project to begin managing the public portfolio.</p></div>
          ) : (
            <div className="divide-y divide-gray-100">
              {projects.map((project) => <ProjectRow key={project.id} project={project} onEdit={() => openEdit(project)} onDelete={() => removeProject(project)} />)}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return <div className="rounded-lg bg-white p-5 shadow-sm"><p className="text-sm text-gray-600">{label}</p><p className={`mt-1 text-3xl font-bold ${color}`}>{value}</p></div>;
}

function ProjectRow({ project, onEdit, onDelete }: { project: Project; onEdit: () => void; onDelete: () => void }) {
  return <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
    <div className="flex min-w-0 items-center gap-4">
      {project.logoUrl ? <img src={project.logoUrl} alt="" className="h-12 w-12 rounded object-contain" /> : <div className="flex h-12 w-12 items-center justify-center rounded bg-blue-50 text-blue-600"><Code2 className="h-6 w-6" /></div>}
      <div className="min-w-0"><p className="truncate font-bold text-gray-900">{project.title}</p><p className="text-sm text-gray-600">{project.category} · {project.status} · order {project.sortOrder}</p></div>
    </div>
    <div className="flex flex-wrap items-center gap-3">
      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold ${project.visibility === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
        {project.visibility === 'published' ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}{project.visibility}
      </span>
      <button onClick={onEdit} className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50" aria-label={`Edit ${project.title}`}><Edit3 className="h-4 w-4" /></button>
      <button onClick={onDelete} className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50" aria-label={`Delete ${project.title}`}><Trash2 className="h-4 w-4" /></button>
    </div>
  </div>;
}

function ProjectEditor({ form, setForm, editing, isSaving, onClose, onSubmit }: { form: ProjectForm; setForm: (value: ProjectForm) => void; editing: boolean; isSaving: boolean; onClose: () => void; onSubmit: (event: FormEvent) => void }) {
  const update = <K extends keyof ProjectForm>(key: K, value: ProjectForm[K]) => setForm({ ...form, [key]: value });
  return <section className="mb-8 rounded-lg bg-white p-6 shadow-sm"><div className="mb-6 flex items-center justify-between"><h2 className="text-xl font-bold text-gray-900">{editing ? 'Edit Project' : 'New Project'}</h2><button onClick={onClose} className="rounded p-2 text-gray-500 hover:bg-gray-100" aria-label="Close editor"><X className="h-5 w-5" /></button></div>
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2"><Text label="Title" value={form.title} onChange={(value) => update('title', value)} required /><Text label="Slug (optional)" value={form.slug || ''} onChange={(value) => update('slug', value)} /><Text label="Category" value={form.category} onChange={(value) => update('category', value)} required /><NumberField label="Sort Order" value={form.sortOrder} onChange={(value) => update('sortOrder', value)} /></div>
      <div className="grid gap-5 md:grid-cols-4"><Select label="Status" value={form.status} options={statuses} onChange={(value) => update('status', value as ProjectStatus)} /><Select label="Visibility" value={form.visibility} options={['draft', 'published']} onChange={(value) => update('visibility', value as ProjectForm['visibility'])} /><Select label="Card Color" value={form.color} options={colors} onChange={(value) => update('color', value as ProjectColor)} /><label className="flex items-end gap-3 pb-3 text-sm font-semibold text-gray-700"><input type="checkbox" checked={form.featured} onChange={(event) => update('featured', event.target.checked)} className="h-4 w-4" /> Feature on homepage</label></div>
      <TextArea label="Description" value={form.description} onChange={(value) => update('description', value)} required />
      <div className="grid gap-5 md:grid-cols-2"><TextArea label="Technologies (one per line)" value={form.technologies.join('\n')} onChange={(value) => update('technologies', splitLines(value))} /><TextArea label="Features (one per line)" value={form.features.join('\n')} onChange={(value) => update('features', splitLines(value))} /></div>
      <div className="grid gap-5 md:grid-cols-3"><Text label="Logo URL" value={form.logoUrl || ''} onChange={(value) => update('logoUrl', value)} /><Text label="Live URL" value={form.liveLink || ''} onChange={(value) => update('liveLink', value)} /><Text label="Download URL" value={form.downloadLink || ''} onChange={(value) => update('downloadLink', value)} /></div>
      <MediaUpload label="Project logo upload" bucket="project-media" kind="image" value={form.logoUrl || ''} onChange={(value) => update('logoUrl', value)} help="JPEG, PNG, WebP, or GIF up to 8 MB. Save the project after uploading." />
      <div className="flex justify-end gap-3"><button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50">Cancel</button><button disabled={isSaving} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"><Save className="h-4 w-4" />{isSaving ? 'Saving...' : editing ? 'Save Project' : 'Create Project'}</button></div>
    </form></section>;
}

function Text({ label, value, onChange, required = false }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) { return <label className="block text-sm font-semibold text-gray-700">{label}<input required={required} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal text-gray-900" /></label>; }
function TextArea({ label, value, onChange, required = false }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) { return <label className="block text-sm font-semibold text-gray-700">{label}<textarea required={required} rows={4} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal text-gray-900" /></label>; }
function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) { return <label className="block text-sm font-semibold text-gray-700">{label}<input min="0" type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal text-gray-900" /></label>; }
function Select({ label, value, options, onChange }: { label: string; value: string; options: readonly string[]; onChange: (value: string) => void }) { return <label className="block text-sm font-semibold text-gray-700">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal text-gray-900">{options.map((option) => <option key={option}>{option}</option>)}</select></label>; }
function splitLines(value: string) { return value.split('\n').map((item) => item.trim()).filter(Boolean); }
