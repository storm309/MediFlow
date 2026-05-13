import React, { useCallback, useRef, useState } from 'react';
import api from '../../services/api';

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_LABELS = ['Report', 'Prescription', 'Scan', 'X-Ray', 'Other'];
const MAX_SIZE_MB = 10;

export default function FileUpload({ patientId, onUploaded }) {
    const inputRef = useRef(null);
    const [dragging, setDragging] = useState(false);
    const [file,     setFile]     = useState(null);
    const [preview,  setPreview]  = useState(null);
    const [label,    setLabel]    = useState('Report');
    const [type,     setType]     = useState('report');
    const [progress, setProgress] = useState(0);
    const [error,    setError]    = useState('');
    const [done,     setDone]     = useState(false);

    const reset = () => {
        setFile(null);
        setPreview(null);
        setProgress(0);
        setError('');
        setDone(false);
    };

    const validateAndSet = (f) => {
        setError('');
        if (!ALLOWED_TYPES.includes(f.type)) {
            setError('File type not allowed. Use PDF, JPEG, PNG, WEBP, or GIF.');
            return;
        }
        if (f.size > MAX_SIZE_MB * 1024 * 1024) {
            setError(`File exceeds ${MAX_SIZE_MB} MB limit.`);
            return;
        }
        setFile(f);
        if (f.type.startsWith('image/')) {
            setPreview(URL.createObjectURL(f));
        } else {
            setPreview(null);
        }
    };

    const onDrop = useCallback((e) => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files?.[0];
        if (f) validateAndSet(f);
    }, []);

    const upload = async () => {
        if (!file || !patientId) return;
        setProgress(1);
        setError('');
        setDone(false);

        const form = new FormData();
        form.append('file',       file);
        form.append('patient_id', patientId);
        form.append('type',       type);
        form.append('label',      label);

        try {
            const { data } = await api.post('/uploads', form, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (e) => {
                    setProgress(Math.round((e.loaded / e.total) * 100));
                },
            });
            setDone(true);
            onUploaded?.(data.data);
        } catch (err) {
            setError(err.response?.data?.message ?? 'Upload failed');
            setProgress(0);
        }
    };

    return (
        <div className="space-y-4">
            {/* Drop zone */}
            <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => !file && inputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed cursor-pointer transition-all min-h-40 ${
                    dragging
                        ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : file
                        ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-900/10'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-blue-300'
                }`}
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.webp,.gif"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) validateAndSet(f); }}
                />

                {file ? (
                    <div className="flex flex-col items-center gap-2 p-4">
                        {preview ? (
                            <img src={preview} alt="Preview" className="w-24 h-24 object-cover rounded-xl shadow" />
                        ) : (
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                </svg>
                            </div>
                        )}
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{file.name}</p>
                        <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        <button
                            onClick={(e) => { e.stopPropagation(); reset(); }}
                            className="text-xs text-red-500 hover:underline"
                        >
                            Remove
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 p-6">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                            </svg>
                        </div>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Drop file here or click to browse</p>
                        <p className="text-xs text-slate-400">PDF, JPEG, PNG, WEBP, GIF — max {MAX_SIZE_MB} MB</p>
                    </div>
                )}
            </div>

            {/* Metadata */}
            {file && !done && (
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="input-base w-full text-sm"
                        >
                            <option value="report">Report</option>
                            <option value="prescription">Prescription</option>
                            <option value="scan">Scan</option>
                            <option value="xray">X-Ray</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Label</label>
                        <input
                            type="text"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            className="input-base w-full text-sm"
                            placeholder="e.g. Blood Test"
                            maxLength={80}
                        />
                    </div>
                </div>
            )}

            {/* Progress */}
            {progress > 0 && !done && (
                <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-500">
                        <span>Uploading…</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                        <div
                            className="bg-blue-500 h-1.5 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Success */}
            {done && (
                <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Uploaded successfully!
                    <button onClick={reset} className="ml-auto text-xs text-blue-600 underline">Upload another</button>
                </div>
            )}

            {/* Error */}
            {error && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                </p>
            )}

            {/* Upload button */}
            {file && !done && (
                <button
                    onClick={upload}
                    disabled={progress > 0}
                    className="btn-primary w-full"
                >
                    {progress > 0 ? 'Uploading…' : 'Upload File'}
                </button>
            )}
        </div>
    );
}
