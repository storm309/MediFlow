<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Services\ReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ReportController extends Controller
{
    public function __construct(protected ReportService $reportService) {}

    /**
     * GET /reports — Paginated reports list.
     */
    public function index(Request $request): JsonResponse
    {
        $perPage   = min((int) $request->get('per_page', 15), 100);
        $patientId = $request->get('patient_id');
        $period    = $request->get('period');

        $query = Report::with(['patient.user:_id,name', 'doctor:_id,name']);

        if ($request->user()->isPatient()) {
            $patient = $request->user()->patientProfile;
            if ($patient) $query->where('patient_id', (string) $patient->_id);
        }

        if ($patientId) $query->where('patient_id', $patientId);
        if ($period)    $query->where('period', $period);

        $reports = $query->latest()->paginate($perPage);

        return response()->json(['success' => true, 'data' => $reports]);
    }

    /**
     * POST /reports/generate — Generate a new report.
     */
    public function generate(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'patient_id' => 'required|string|regex:/^[a-f\d]{24}$/i',
            'period'     => 'required|in:daily,weekly,monthly',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        // Check if patient has assigned doctor
        $patient = \App\Models\Patient::findOrFail($request->patient_id);
        if (!$patient->doctor_id) {
            return response()->json([
                'success' => false,
                'message' => 'Patient must have an assigned doctor before generating a report. Please request a doctor assignment first.',
            ], 422);
        }

        $doctorId = $request->user()->isDoctor() ? (string) $request->user()->_id : null;

        $report = $this->reportService->generate(
            $request->patient_id,
            $request->period,
            $doctorId
        );

        return response()->json(['success' => true, 'data' => $report, 'message' => 'Report generated.'], 201);
    }

    /**
     * GET /reports/{id} — Single report detail.
     */
    public function show(string $id): JsonResponse
    {
        $report = Report::with(['patient.user:_id,name,email', 'doctor:_id,name'])->findOrFail($id);
        return response()->json(['success' => true, 'data' => $report]);
    }

    /**
     * GET /reports/{id}/pdf — Download PDF report.
     */
    public function downloadPdf(string $id): \Symfony\Component\HttpFoundation\BinaryFileResponse|\Illuminate\Http\JsonResponse
    {
        $report = Report::findOrFail($id);

        if (!$report->pdf_path || !Storage::disk('local')->exists($report->pdf_path)) {
            $path = $this->reportService->generatePdf($id);
        } else {
            $path = $report->pdf_path;
        }

        $fullPath = Storage::disk('local')->path($path);
        return response()->download($fullPath, "report-{$id}.pdf", ['Content-Type' => 'application/pdf']);
    }

    /**
     * PATCH /reports/{id}/notes — Add doctor notes to report.
     */
    public function addNotes(Request $request, string $id): JsonResponse
    {
        // Only doctors and admins can add clinical notes
        if ($request->user()->isPatient()) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'doctor_notes' => 'required|string|max:5000',
            'status'       => 'sometimes|in:reviewed,finalized',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $report = Report::findOrFail($id);
        $report->update([
            'doctor_notes' => $request->doctor_notes,
            'status'       => $request->get('status', 'reviewed'),
            'doctor_id'    => (string) $request->user()->_id,
        ]);

        return response()->json(['success' => true, 'data' => $report]);
    }
}
