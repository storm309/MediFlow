<?php

namespace App\Http\Controllers;

use App\Services\PatientService;
use App\Repositories\PatientRepository;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PatientController extends Controller
{
    public function __construct(
        protected PatientService    $patientService,
        protected PatientRepository $patientRepo,
    ) {}

    /**
     * GET /patients — Paginated list with search & doctor filter.
     */
    public function index(Request $request): JsonResponse
    {
        $perPage  = min((int) $request->get('per_page', 15), 100);
        $search   = $request->get('search');
        $doctorId = $request->get('doctor_id');

        // Doctors can only see their assigned patients
        if ($request->user()->isDoctor()) {
            $doctorId = (string) $request->user()->_id;
        }

        $patients = $this->patientService->list($perPage, $search, $doctorId);

        return response()->json(['success' => true, 'data' => $patients]);
    }

    /**
     * POST /patients — Create new patient.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name'       => 'required|string|max:255',
            'email'      => 'required|email|unique:mongodb.users,email',
            'password'   => 'required|string|min:8',
            'phone'      => 'sometimes|string|max:20',
            'age'        => 'required|integer|min:0|max:150',
            'gender'     => 'required|in:male,female,other',
            'blood_group'=> 'sometimes|string|max:5',
            'doctor_id'  => 'sometimes|string',
            'address'    => 'sometimes|string',
            'medical_history'     => 'sometimes|array',
            'allergies'           => 'sometimes|array',
            'current_medications' => 'sometimes|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $data    = $validator->validated();
        $userData  = ['name' => $data['name'], 'email' => $data['email'], 'password' => $data['password'], 'phone' => $data['phone'] ?? null];
        $profileData = collect($data)->except(['name', 'email', 'password', 'phone'])->toArray();

        try {
            $result = $this->patientService->createPatient($userData, $profileData);
            return response()->json(['success' => true, 'message' => 'Patient created.', 'data' => $result], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * GET /patients/{id} — Patient detail.
     */
    public function show(string $id): JsonResponse
    {
        $patient = $this->patientRepo->findOrFail($id);
        $patient->load(['user:_id,name,email,phone,avatar', 'latestMetric']);
        return response()->json(['success' => true, 'data' => $patient]);
    }

    /**
     * PUT /patients/{id} — Update patient profile.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'age'         => 'sometimes|integer|min:0',
            'gender'      => 'sometimes|in:male,female,other',
            'blood_group' => 'sometimes|string|max:5',
            'doctor_id'   => 'sometimes|string',
            'address'     => 'sometimes|string',
            'medical_history'     => 'sometimes|array',
            'allergies'           => 'sometimes|array',
            'current_medications' => 'sometimes|array',
            'emergency_contact'   => 'sometimes|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $patient = $this->patientService->updateProfile($id, $validator->validated());
        return response()->json(['success' => true, 'data' => $patient]);
    }

    /**
     * DELETE /patients/{id} — Delete patient (Admin only).
     */
    public function destroy(string $id): JsonResponse
    {
        $this->patientRepo->delete($id);
        return response()->json(['success' => true, 'message' => 'Patient deleted.']);
    }

    /**
     * POST /patients/{id}/assign-doctor — Assign doctor to patient.
     */
    public function assignDoctor(Request $request, string $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'doctor_id' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $patient = $this->patientService->assignDoctor($id, $request->doctor_id);
        return response()->json(['success' => true, 'data' => $patient, 'message' => 'Doctor assigned.']);
    }
}
