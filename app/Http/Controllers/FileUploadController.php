<?php

namespace App\Http\Controllers;

use App\Models\UploadedFile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * FileUploadController — Handles secure file uploads for medical documents.
 * Uses local storage by default; can be extended for Cloudinary.
 */
class FileUploadController extends Controller
{
    private const ALLOWED_TYPES = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
    ];

    private const MAX_SIZE_MB = 10;

    /**
     * POST /uploads — Upload a new file.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'file'       => 'required|file|max:' . (self::MAX_SIZE_MB * 1024),
            'type'       => 'required|in:report,prescription,scan,xray,other',
            'patient_id' => 'sometimes|string',
            'label'      => 'sometimes|string|max:100',
        ]);

        $user = $request->user();
        $patientId = $request->patient_id;

        // Patients can only upload files for themselves
        if ($user->isPatient()) {
            $own = $user->patientProfile;
            if (!$own) {
                return response()->json(['success' => false, 'message' => 'Patient profile not found.'], 404);
            }
            // Force patient_id to be their own profile id regardless of what was sent
            $patientId = (string) $own->_id;
        } elseif ($user->isDoctor() && $patientId) {
            $patient = \App\Models\Patient::find($patientId);
            if (!$patient || (string) $patient->doctor_id !== (string) $user->_id) {
                return response()->json(['success' => false, 'message' => 'You are not assigned to this patient.'], 403);
            }
        }

        $file     = $request->file('file');
        $mimeType = $file->getMimeType();

        if (!in_array($mimeType, self::ALLOWED_TYPES)) {
            return response()->json([
                'success' => false,
                'message' => 'File type not allowed. Allowed: PDF, JPEG, PNG, WEBP.',
            ], 422);
        }

        // Generate a safe unique filename — never expose original name directly
        $ext      = $file->getClientOriginalExtension();
        $filename = Str::uuid() . '.' . $ext;
        $path     = $file->storeAs('uploads/' . $request->type, $filename, 'local');

        $record = UploadedFile::create([
            'user_id'    => (string) $user->_id,
            'patient_id' => $patientId,
            'type'       => $request->type,
            'label'      => $request->label ?? $file->getClientOriginalName(),
            'filename'   => $filename,
            'path'       => $path,
            'mime_type'  => $mimeType,
            'size_bytes' => $file->getSize(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'File uploaded successfully.',
            'data'    => [
                'id'       => (string) $record->_id,
                'label'    => $record->label,
                'type'     => $record->type,
                'url'      => url('/api/v1/uploads/serve/' . $record->_id),
                'size'     => $record->size_bytes,
                'uploaded' => $record->created_at,
            ],
        ], 201);
    }

    /**
     * GET /uploads/{patientId} — List uploads for a patient.
     */
    public function index(Request $request, string $patientId): JsonResponse
    {
        $user = $request->user();

        // Patients can only list their own files
        if ($user->isPatient()) {
            $patient = $user->patientProfile;
            if (!$patient || (string) $patient->_id !== $patientId) {
                return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
            }
        }

        $files = UploadedFile::where('patient_id', $patientId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn ($f) => [
                'id'       => (string) $f->_id,
                'label'    => $f->label,
                'type'     => $f->type,
                'url'      => url('/api/v1/uploads/serve/' . $f->_id),
                'size'     => $f->size_bytes,
                'uploaded' => $f->created_at,
            ]);

        return response()->json(['success' => true, 'data' => $files]);
    }

    /**
     * GET /uploads/serve/{id} — Securely serve a file.
     */
    public function serve(Request $request, string $id)
    {
        $record = UploadedFile::findOrFail($id);
        $user = $request->user();

        // Authorisation:
        //  - Admins: always allowed
        //  - Patients: must be the owner (user_id) or the patient the file belongs to
        //  - Doctors: must be assigned to the patient the file belongs to
        $allowed = false;
        if ($user->isAdmin()) {
            $allowed = true;
        } elseif ($user->isPatient()) {
            $own = $user->patientProfile;
            $allowed = $record->user_id === (string) $user->_id
                || ($own && (string) $own->_id === (string) $record->patient_id);
        } elseif ($user->isDoctor() && $record->patient_id) {
            $patient = \App\Models\Patient::find($record->patient_id);
            $allowed = $patient && (string) $patient->doctor_id === (string) $user->_id;
        }

        if (!$allowed) {
            abort(403, 'Unauthorized.');
        }

        if (!Storage::disk('local')->exists($record->path)) {
            abort(404, 'File not found.');
        }

        return Storage::disk('local')->response($record->path, $record->label, [
            'Content-Type' => $record->mime_type,
        ]);
    }

    /**
     * DELETE /uploads/{id} — Delete a file.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $record = UploadedFile::findOrFail($id);

        // Only uploader or admin can delete
        $user = $request->user();
        if ($user->role !== 'admin' && $record->user_id !== (string) $user->_id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        Storage::disk('local')->delete($record->path);
        $record->delete();

        return response()->json(['success' => true, 'message' => 'File deleted.']);
    }
}
