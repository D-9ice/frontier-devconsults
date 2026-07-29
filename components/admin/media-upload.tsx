'use client';

import { ChangeEvent, DragEvent, useRef, useState } from 'react';
import { FileImage, FileVideo, LoaderCircle, RotateCcw, Trash2, Upload } from 'lucide-react';

export type MediaBucket = 'project-media' | 'app-media' | 'site-media';
type MediaKind = 'image' | 'video';

type MediaUploadProps = {
  label: string;
  bucket: MediaBucket;
  kind: MediaKind;
  value: string;
  onChange: (url: string) => void;
  help?: string;
  showEmptyState?: boolean;
};

const maxImageBytes = 8 * 1024 * 1024;
const maxVideoBytes = 50 * 1024 * 1024;
type UploadPhase = 'idle' | 'preparing' | 'uploading' | 'complete' | 'error';

function mediaPathForUrl(value: string, bucket: MediaBucket) {
  try {
    const url = new URL(value);
    const prefix = `/storage/v1/object/public/${bucket}/`;
    const index = url.pathname.indexOf(prefix);
    return index === -1 ? null : decodeURIComponent(url.pathname.slice(index + prefix.length));
  } catch {
    return null;
  }
}

export async function deleteUploadedMedia(value: string, bucket: MediaBucket) {
  const path = mediaPathForUrl(value, bucket);
  if (!path) return;
  const response = await fetch('/api/admin/media', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bucket, path }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Unable to remove the media asset.');
}

export function MediaUpload({ label, bucket, kind, value, onChange, help, showEmptyState = true }: MediaUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const retryFileRef = useRef<File | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [phase, setPhase] = useState<UploadPhase>('idle');
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const isUploading = phase === 'preparing' || phase === 'uploading';
  const accept = kind === 'image' ? 'image/jpeg,image/png,image/webp,image/gif' : 'video/mp4,video/webm';

  const uploadFile = async (file: File) => {
    const maximum = kind === 'image' ? maxImageBytes : maxVideoBytes;
    if (!file.type.startsWith(`${kind}/`) || !accept.split(',').includes(file.type)) {
      retryFileRef.current = null;
      setProgress(null);
      setPhase('error');
      setError(`Choose a supported ${kind} file.`);
      return;
    }
    if (file.size > maximum) {
      retryFileRef.current = null;
      setProgress(null);
      setPhase('error');
      setError(`${kind === 'image' ? 'Images' : 'Videos'} must be ${maximum / 1024 / 1024} MB or smaller.`);
      return;
    }

    retryFileRef.current = file;
    setError('');
    setProgress(0);
    setPhase('preparing');
    try {
      const response = await fetch('/api/admin/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bucket, fileName: file.name, contentType: file.type, size: file.size }),
      });
      const target = await response.json();
      if (!response.ok) throw new Error(target.error || 'Unable to prepare the upload.');

      setPhase('uploading');
      await new Promise<void>((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open('PUT', target.signedUrl);
        request.setRequestHeader('Content-Type', file.type);
        request.upload.onprogress = (event) => {
          if (event.lengthComputable) setProgress(Math.round((event.loaded / event.total) * 100));
        };
        request.onerror = () => reject(new Error('The file upload could not be completed.'));
        request.onload = () => request.status >= 200 && request.status < 300
          ? resolve()
          : reject(new Error('The file upload was rejected by storage.'));
        request.send(file);
      });
      onChange(target.publicUrl);
      setProgress(100);
      setPhase('complete');
      retryFileRef.current = null;
      if (value && value !== target.publicUrl) {
        try {
          await deleteUploadedMedia(value, bucket);
        } catch {
          setError('Upload complete, but the replaced asset could not be deleted. Try removing it again.');
        }
      }
    } catch (uploadError) {
      setPhase('error');
      setError(uploadError instanceof Error ? uploadError.message : 'Unable to upload the file.');
    }
  };

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const [file] = Array.from(event.target.files || []);
    event.target.value = '';
    if (file) void uploadFile(file);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (isUploading) return;
    const [file] = Array.from(event.dataTransfer.files);
    if (file) void uploadFile(file);
  };

  const remove = async () => {
    if (!window.confirm(`Remove this ${kind}?`)) return;
    retryFileRef.current = null;
    setProgress(null);
    setPhase('idle');
    setError('');
    try {
      await deleteUploadedMedia(value, bucket);
      onChange('');
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'Unable to remove the media asset.');
    }
  };

  return <div
    onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
    onDragLeave={(event) => { if (event.currentTarget === event.target) setIsDragging(false); }}
    onDrop={onDrop}
    className={`rounded-lg border border-dashed p-4 transition-colors ${isDragging ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-gray-50'}`}
  >
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><p className="text-sm font-semibold text-gray-900">{label}</p>{help && <p className="mt-1 text-sm text-gray-600">{help}</p>}</div>
      <input ref={inputRef} onChange={onFileChange} type="file" accept={accept} className="sr-only" />
      <button type="button" onClick={() => inputRef.current?.click()} disabled={isUploading} className="inline-flex items-center gap-2 rounded-lg border border-blue-600 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 disabled:cursor-wait disabled:opacity-60">
        {isUploading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {phase === 'preparing' ? 'Preparing...' : phase === 'uploading' ? 'Uploading...' : value ? 'Replace' : 'Upload'}
      </button>
    </div>
    {progress !== null && <div className="mt-3" aria-live="polite">
      <div role="progressbar" aria-label={`${label} upload progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} className="h-2 overflow-hidden rounded-full bg-gray-200">
        <div className={`h-full transition-all ${phase === 'error' ? 'bg-red-600' : phase === 'complete' ? 'bg-green-600' : 'bg-blue-600'}`} style={{ width: `${progress}%` }} />
      </div>
      <p className={`mt-1 text-xs ${phase === 'error' ? 'text-red-700' : phase === 'complete' ? 'text-green-700' : 'text-gray-600'}`}>
        {phase === 'preparing' ? 'Preparing secure upload...' : phase === 'error' ? `Upload failed at ${progress}%.` : phase === 'complete' ? 'Upload complete.' : `${progress}% uploaded`}
      </p>
    </div>}
    {error && <div className="mt-3 flex flex-wrap items-center gap-3" aria-live="assertive">
      <p className="text-sm text-red-700">{error}</p>
      {retryFileRef.current && <button type="button" onClick={() => { const file = retryFileRef.current; if (file) void uploadFile(file); }} disabled={isUploading} className="inline-flex items-center gap-1 rounded border border-red-300 px-2 py-1 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60">
        <RotateCcw className="h-4 w-4" />Retry upload
      </button>}
    </div>}
    {value && <div className="mt-4 flex items-start gap-4 rounded-lg bg-white p-3">
      {kind === 'image' ? <img src={value} alt="Uploaded preview" className="h-20 w-20 rounded-lg border border-gray-200 object-contain" /> : <video src={value} className="h-20 w-32 rounded-lg bg-black object-cover" controls muted playsInline />}
      <div className="min-w-0 flex-1"><p className="break-all text-xs text-gray-600">{value}</p><button type="button" onClick={() => void remove()} className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-700"><Trash2 className="h-4 w-4" />Remove</button></div>
    </div>}
    {!value && showEmptyState && <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">{kind === 'image' ? <FileImage className="h-4 w-4" /> : <FileVideo className="h-4 w-4" />}{isDragging ? `Drop the ${kind} here.` : `Drop a ${kind} here or use Upload.`}</div>}
  </div>;
}
