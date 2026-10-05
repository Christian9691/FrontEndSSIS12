<?php

namespace Database\Seeders;

use App\Models\AuditLog;
use App\Models\ClearanceRecord;
use App\Models\Course;
use App\Models\Department;
use App\Models\DocumentRequest;
use App\Models\Enrollment;
use App\Models\Payment;
use App\Models\Student;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $defaultPassword = Hash::make('password');

        // 1. Departments
        $ccs = Department::create([
            'department_code' => 'CCS',
            'department_name' => 'College of Computing Studies',
            'office_location' => 'Main Building, 3rd Floor, Room 301',
        ]);

        $coe = Department::create([
            'department_code' => 'COE',
            'department_name' => 'College of Engineering',
            'office_location' => 'Engineering Wing, 2nd Floor, Room 204',
        ]);

        $cba = Department::create([
            'department_code' => 'CBA',
            'department_name' => 'College of Business Administration',
            'office_location' => 'West Wing, 1st Floor, Room 105',
        ]);

        $library = Department::create([
            'department_code' => 'LIB',
            'department_name' => 'University Library Services',
            'office_location' => 'Library Building, Ground Floor',
        ]);

        // 2. Courses
        $bsit = Course::create([
            'department_id' => $ccs->id,
            'course_code' => 'BSIT',
            'course_title' => 'Bachelor of Science in Information Technology',
            'total_units' => 146,
        ]);

        $bscs = Course::create([
            'department_id' => $ccs->id,
            'course_code' => 'BSCS',
            'course_title' => 'Bachelor of Science in Computer Science',
            'total_units' => 150,
        ]);

        $bsis = Course::create([
            'department_id' => $ccs->id,
            'course_code' => 'BSIS',
            'course_title' => 'Bachelor of Science in Information Systems',
            'total_units' => 142,
        ]);

        // 3. Subjects for BSIT / BSCS
        $it201 = Subject::create(['course_id' => $bsit->id, 'subject_code' => 'IT201', 'subject_title' => 'Data Structures and Algorithms', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 2]);
        $it202 = Subject::create(['course_id' => $bsit->id, 'subject_code' => 'IT202', 'subject_title' => 'Systems Analysis and Design', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 2]);
        $it203 = Subject::create(['course_id' => $bsit->id, 'subject_code' => 'IT203', 'subject_title' => 'Web Systems and Technologies', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 2]);
        $ge104 = Subject::create(['course_id' => $bsit->id, 'subject_code' => 'GE104', 'subject_title' => 'Ethics and Professional Conduct', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 2]);
        $it205 = Subject::create(['course_id' => $bsit->id, 'subject_code' => 'IT205', 'subject_title' => 'Database Management Systems 1', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 2]);

        $cs301 = Subject::create(['course_id' => $bscs->id, 'subject_code' => 'CS301', 'subject_title' => 'Automata Theory and Formal Languages', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 3]);
        $cs302 = Subject::create(['course_id' => $bscs->id, 'subject_code' => 'CS302', 'subject_title' => 'Software Engineering', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 3]);

        // 4. Staff Users
        $adminUser = User::create([
            'name' => 'System Administrator',
            'email' => 'admin@cuyotech.edu.ph',
            'password' => $defaultPassword,
            'role' => 'admin',
            'status' => 'active',
        ]);

        $registrarUser = User::create([
            'name' => 'Dr. Elena Ramos (Registrar)',
            'email' => 'registrar@cuyotech.edu.ph',
            'password' => $defaultPassword,
            'role' => 'registrar',
            'status' => 'active',
        ]);

        $cashierUser = User::create([
            'name' => 'Ben Cruz (Cashier Officer)',
            'email' => 'cashier@cuyotech.edu.ph',
            'password' => $defaultPassword,
            'role' => 'cashier',
            'status' => 'active',
        ]);

        $deptUser = User::create([
            'name' => 'Prof. Rolando Diaz (CCS Dept Head)',
            'email' => 'department@cuyotech.edu.ph',
            'password' => $defaultPassword,
            'role' => 'department',
            'status' => 'active',
        ]);

        // 5. Student Users & Profiles
        // Student 1: Juan Dela Cruz (Enrolled, Cleared)
        $studentUser1 = User::create([
            'name' => 'Juan Dela Cruz',
            'email' => 'student@cuyotech.edu.ph',
            'password' => $defaultPassword,
            'role' => 'student',
            'status' => 'active',
        ]);

        $student1 = Student::create([
            'user_id' => $studentUser1->id,
            'course_id' => $bsit->id,
            'student_number' => '2026-00123',
            'year_level' => 2,
            'clearance_status' => true,
        ]);

        // Enrollments & Grades for Juan
        Enrollment::create(['student_id' => $student1->id, 'subject_id' => $it201->id, 'academic_year' => '2026-2027', 'semester' => '1st Semester', 'grade' => 1.50, 'remarks' => 'Passed', 'enrollment_status' => 'enrolled']);
        Enrollment::create(['student_id' => $student1->id, 'subject_id' => $it202->id, 'academic_year' => '2026-2027', 'semester' => '1st Semester', 'grade' => 1.75, 'remarks' => 'Passed', 'enrollment_status' => 'enrolled']);
        Enrollment::create(['student_id' => $student1->id, 'subject_id' => $it203->id, 'academic_year' => '2026-2027', 'semester' => '1st Semester', 'grade' => 1.25, 'remarks' => 'Passed', 'enrollment_status' => 'enrolled']);
        Enrollment::create(['student_id' => $student1->id, 'subject_id' => $ge104->id, 'academic_year' => '2026-2027', 'semester' => '1st Semester', 'grade' => 2.00, 'remarks' => 'Passed', 'enrollment_status' => 'enrolled']);
        Enrollment::create(['student_id' => $student1->id, 'subject_id' => $it205->id, 'academic_year' => '2026-2027', 'semester' => '1st Semester', 'grade' => 1.50, 'remarks' => 'Passed', 'enrollment_status' => 'enrolled']);

        // Clearances for Juan (Cleared)
        ClearanceRecord::create(['student_id' => $student1->id, 'department_id' => $ccs->id, 'signatory_name' => 'CCS Department Office', 'status' => 'cleared', 'cleared_at' => now()]);
        ClearanceRecord::create(['student_id' => $student1->id, 'department_id' => $library->id, 'signatory_name' => 'University Library', 'status' => 'cleared', 'cleared_at' => now()]);

        // Student 2: Maria Santos (BSCS 3rd Year)
        $studentUser2 = User::create([
            'name' => 'Maria Santos',
            'email' => 'maria@cuyotech.edu.ph',
            'password' => $defaultPassword,
            'role' => 'student',
            'status' => 'active',
        ]);

        $student2 = Student::create([
            'user_id' => $studentUser2->id,
            'course_id' => $bscs->id,
            'student_number' => '2026-00124',
            'year_level' => 3,
            'clearance_status' => true,
        ]);

        Enrollment::create(['student_id' => $student2->id, 'subject_id' => $cs301->id, 'academic_year' => '2026-2027', 'semester' => '1st Semester', 'grade' => 1.25, 'remarks' => 'Passed', 'enrollment_status' => 'enrolled']);
        Enrollment::create(['student_id' => $student2->id, 'subject_id' => $cs302->id, 'academic_year' => '2026-2027', 'semester' => '1st Semester', 'grade' => 1.50, 'remarks' => 'Passed', 'enrollment_status' => 'enrolled']);

        ClearanceRecord::create(['student_id' => $student2->id, 'department_id' => $ccs->id, 'signatory_name' => 'CCS Department Office', 'status' => 'cleared', 'cleared_at' => now()]);
        ClearanceRecord::create(['student_id' => $student2->id, 'department_id' => $library->id, 'signatory_name' => 'University Library', 'status' => 'cleared', 'cleared_at' => now()]);

        // Student 3: Pedro Reyes (Uncleared - for testing clearance hold workflow in swimlane diagram)
        $studentUser3 = User::create([
            'name' => 'Pedro Reyes',
            'email' => 'pedro@cuyotech.edu.ph',
            'password' => $defaultPassword,
            'role' => 'student',
            'status' => 'active',
        ]);

        $student3 = Student::create([
            'user_id' => $studentUser3->id,
            'course_id' => $bsis->id,
            'student_number' => '2026-00125',
            'year_level' => 1,
            'clearance_status' => false,
        ]);

        ClearanceRecord::create(['student_id' => $student3->id, 'department_id' => $library->id, 'signatory_name' => 'University Library', 'status' => 'hold', 'hold_reason' => 'Unreturned borrowed textbook: Systems Analysis Principles']);
        ClearanceRecord::create(['student_id' => $student3->id, 'department_id' => $ccs->id, 'signatory_name' => 'CCS Department Office', 'status' => 'hold', 'hold_reason' => 'Pending College Membership & Laboratory clearance']);

        // 6. Initial Document Requests matching the Swimlane & ERD
        // Request 1: Released TOR for Juan Dela Cruz
        $req1 = DocumentRequest::create([
            'tracking_number' => 'TRK-2026-10001',
            'student_id' => $student1->id,
            'assigned_admin_id' => $registrarUser->id,
            'document_type' => 'TOR',
            'purpose' => 'Scholarship and Internship Application',
            'processing_status' => 'released',
            'assessment_fee' => 150.00,
            'requested_date' => now()->subDays(5),
            'release_date' => now()->subDay(),
        ]);

        Payment::create([
            'document_request_id' => $req1->id,
            'processed_by_user_id' => $cashierUser->id,
            'official_receipt_no' => 'OR-2026-00841',
            'amount_paid' => 150.00,
            'payment_method' => 'online',
            'payment_status' => 'verified',
            'transaction_date' => now()->subDays(4),
        ]);

        // Request 2: Paid & Processing COR for Juan
        $req2 = DocumentRequest::create([
            'tracking_number' => 'TRK-2026-10002',
            'student_id' => $student1->id,
            'assigned_admin_id' => $registrarUser->id,
            'document_type' => 'COR',
            'purpose' => 'Passport and Visa requirement',
            'processing_status' => 'processing',
            'assessment_fee' => 75.00,
            'requested_date' => now()->subDays(2),
            'release_date' => null,
        ]);

        Payment::create([
            'document_request_id' => $req2->id,
            'processed_by_user_id' => $cashierUser->id,
            'official_receipt_no' => 'OR-2026-00842',
            'amount_paid' => 75.00,
            'payment_method' => 'cash',
            'payment_status' => 'verified',
            'transaction_date' => now()->subDay(),
        ]);

        // Request 3: Pending Payment Certification for Maria Santos
        DocumentRequest::create([
            'tracking_number' => 'TRK-2026-10003',
            'student_id' => $student2->id,
            'assigned_admin_id' => null,
            'document_type' => 'Certification',
            'purpose' => 'Good Moral / Certificate of Enrollment for Insurance',
            'processing_status' => 'pending_payment',
            'assessment_fee' => 50.00,
            'requested_date' => now()->subHours(6),
            'release_date' => null,
        ]);

        // 7. Audit Logs
        AuditLog::record($adminUser->id, 'System Initialization', 'SSIS database seeded with academic departments, courses, and baseline user accounts.');
        AuditLog::record($studentUser1->id, 'Document Requested', 'Requested Transcript of Records (TOR) with tracking #TRK-2026-10001');
        AuditLog::record($cashierUser->id, 'Payment Received', 'Issued Official Receipt #OR-2026-00841 for document request');
        AuditLog::record($registrarUser->id, 'Document Released', 'Approved and marked TOR as released for Juan Dela Cruz');
    }
}
