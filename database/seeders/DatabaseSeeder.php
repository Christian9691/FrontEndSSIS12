<?php

namespace Database\Seeders;

use App\Models\AuditLog;
use App\Models\ClearanceRecord;
use App\Models\Course;
use App\Models\Department;
use App\Models\DocumentRequest;
use App\Models\Enrollment;
use App\Models\Notification;
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
            'total_units' => 157,
        ]);

        $bsis = Course::create([
            'department_id' => $ccs->id,
            'course_code' => 'BSIS',
            'course_title' => 'Bachelor of Science in Information Systems',
            'total_units' => 142,
        ]);

        // 3. Official University Curricula for CCS Programs (BSIT, BSCS, BSIS)

        // =========================================================================
        // 3.1 BACHELOR OF SCIENCE IN INFORMATION TECHNOLOGY (BSIT) - 45 Subjects
        // =========================================================================
        // 1st Year : 1st Semester (24 units)
        Subject::create(['course_id' => $bsit->id, 'subject_code' => 'IT101', 'subject_title' => 'Introduction to Information Technology', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 1]);
        Subject::create(['course_id' => $bsit->id, 'subject_code' => 'IT102', 'subject_title' => 'Computer Programming 1 (Python)', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 1]);
        Subject::create(['course_id' => $bsit->id, 'subject_code' => 'ITGAD1', 'subject_title' => 'Gender and Development', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 1]);
        Subject::create(['course_id' => $bsit->id, 'subject_code' => 'ITMAT1', 'subject_title' => 'Mathematics in the Modern World', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 1]);
        Subject::create(['course_id' => $bsit->id, 'subject_code' => 'ITNSTP1', 'subject_title' => 'National Service Training Program 1', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 1]);
        Subject::create(['course_id' => $bsit->id, 'subject_code' => 'ITPED1', 'subject_title' => 'Physical Activities Toward Health and Fitness 1', 'units' => 2, 'semester' => '1st Semester', 'year_level' => 1]);
        Subject::create(['course_id' => $bsit->id, 'subject_code' => 'ITPHD1', 'subject_title' => 'PnCians Holistic Development 1', 'units' => 1, 'semester' => '1st Semester', 'year_level' => 1]);
        Subject::create(['course_id' => $bsit->id, 'subject_code' => 'ITPSY1', 'subject_title' => 'Understanding the Self', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 1]);
        Subject::create(['course_id' => $bsit->id, 'subject_code' => 'ITREAD1', 'subject_title' => 'Science and Development of Reading', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 1]);

        // 1st Year : 2nd Semester (24 units)
        Subject::create(['course_id' => $bsit->id, 'subject_code' => 'IT103', 'subject_title' => 'Computer Programming 2 (Advanced OOP)', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 1]);
        Subject::create(['course_id' => $bsit->id, 'subject_code' => 'IT104', 'subject_title' => 'Discrete Mathematics for IT', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 1]);
        Subject::create(['course_id' => $bsit->id, 'subject_code' => 'IT105', 'subject_title' => 'Human Computer Interaction', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 1]);
        Subject::create(['course_id' => $bsit->id, 'subject_code' => 'ITCOM1', 'subject_title' => 'Purposive Communication', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 1]);
        Subject::create(['course_id' => $bsit->id, 'subject_code' => 'ITHIS1', 'subject_title' => 'Readings in Philippine History', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 1]);
        Subject::create(['course_id' => $bsit->id, 'subject_code' => 'ITHMN1', 'subject_title' => 'Art Appreciation', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 1]);
        Subject::create(['course_id' => $bsit->id, 'subject_code' => 'ITNSTP2', 'subject_title' => 'National Service Training Program 2', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 1]);
        Subject::create(['course_id' => $bsit->id, 'subject_code' => 'ITPED2', 'subject_title' => 'Physical Activities Toward Health and Fitness 2', 'units' => 2, 'semester' => '2nd Semester', 'year_level' => 1]);
        Subject::create(['course_id' => $bsit->id, 'subject_code' => 'ITPHD2', 'subject_title' => 'PnCians Holistic Development 2', 'units' => 1, 'semester' => '2nd Semester', 'year_level' => 1]);

        // 2nd Year : 1st Semester (23 units)
        $it201 = Subject::create(['course_id' => $bsit->id, 'subject_code' => 'IT201', 'subject_title' => 'Data Structures and Algorithms', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 2]);
        $it202 = Subject::create(['course_id' => $bsit->id, 'subject_code' => 'IT202', 'subject_title' => 'Systems Analysis and Design', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 2]);
        $it203 = Subject::create(['course_id' => $bsit->id, 'subject_code' => 'IT203', 'subject_title' => 'Web Systems and Technologies', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 2]);
        $ge104 = Subject::create(['course_id' => $bsit->id, 'subject_code' => 'GE104', 'subject_title' => 'Ethics and Professional Conduct', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 2]);
        $it205 = Subject::create(['course_id' => $bsit->id, 'subject_code' => 'IT205', 'subject_title' => 'Database Management Systems 1', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 2]);
        Subject::create(['course_id' => $bsit->id, 'subject_code' => 'ITENT1', 'subject_title' => 'The Entrepreneurial Mind', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 2]);
        Subject::create(['course_id' => $bsit->id, 'subject_code' => 'ITPED3', 'subject_title' => 'Physical Activities Toward Health and Fitness 3', 'units' => 2, 'semester' => '1st Semester', 'year_level' => 2]);
        Subject::create(['course_id' => $bsit->id, 'subject_code' => 'ITSTS1', 'subject_title' => 'Science, Technology and Society', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 2]);

        // 2nd Year : 2nd Semester (26 units)
        Subject::create(['course_id' => $bsit->id, 'subject_code' => 'IT206', 'subject_title' => 'Database Management Systems 2 (Advanced)', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 2]);
        Subject::create(['course_id' => $bsit->id, 'subject_code' => 'IT207', 'subject_title' => 'Advanced Web Development & API Design', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 2]);
        Subject::create(['course_id' => $bsit->id, 'subject_code' => 'IT208', 'subject_title' => 'Networking 1 (Fundamentals & Routing)', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 2]);
        Subject::create(['course_id' => $bsit->id, 'subject_code' => 'IT209', 'subject_title' => 'Quantitative Methods and Modeling', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 2]);
        Subject::create(['course_id' => $bsit->id, 'subject_code' => 'IT210', 'subject_title' => 'Platform Technologies & Operating Systems', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 2]);
        Subject::create(['course_id' => $bsit->id, 'subject_code' => 'ITSOC1', 'subject_title' => 'The Contemporary World', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 2]);
        Subject::create(['course_id' => $bsit->id, 'subject_code' => 'ITETH1', 'subject_title' => 'Ethics in Information Age', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 2]);
        Subject::create(['course_id' => $bsit->id, 'subject_code' => 'ITPED4', 'subject_title' => 'Physical Activities Toward Health and Fitness 4', 'units' => 2, 'semester' => '2nd Semester', 'year_level' => 2]);
        Subject::create(['course_id' => $bsit->id, 'subject_code' => 'ITRIZ1', 'subject_title' => 'Life and Works of Rizal', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 2]);

        // 3rd Year : 1st Semester (21 units)
        Subject::create(['course_id' => $bsit->id, 'subject_code' => 'IT301', 'subject_title' => 'Information Assurance and Security 1', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 3]);
        Subject::create(['course_id' => $bsit->id, 'subject_code' => 'IT302', 'subject_title' => 'Networking 2 (Enterprise Infrastructure)', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 3]);
        Subject::create(['course_id' => $bsit->id, 'subject_code' => 'IT303', 'subject_title' => 'Mobile Applications Development', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 3]);
        Subject::create(['course_id' => $bsit->id, 'subject_code' => 'IT304', 'subject_title' => 'Systems Integration and Architecture 1', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 3]);
        Subject::create(['course_id' => $bsit->id, 'subject_code' => 'IT305', 'subject_title' => 'Cloud Computing Foundations & DevOps', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 3]);
        Subject::create(['course_id' => $bsit->id, 'subject_code' => 'ITENV1', 'subject_title' => 'Environmental Science', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 3]);
        Subject::create(['course_id' => $bsit->id, 'subject_code' => 'ITTEC1', 'subject_title' => 'Technopreneurship in IT', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 3]);

        // 3rd Year : 2nd Semester (18 units)
        Subject::create(['course_id' => $bsit->id, 'subject_code' => 'IT306', 'subject_title' => 'Information Assurance and Security 2', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 3]);
        Subject::create(['course_id' => $bsit->id, 'subject_code' => 'IT307', 'subject_title' => 'Systems Administration and Maintenance', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 3]);
        Subject::create(['course_id' => $bsit->id, 'subject_code' => 'IT308', 'subject_title' => 'Systems Integration and Architecture 2', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 3]);
        Subject::create(['course_id' => $bsit->id, 'subject_code' => 'IT309', 'subject_title' => 'IT Capstone Project 1', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 3]);
        Subject::create(['course_id' => $bsit->id, 'subject_code' => 'IT310', 'subject_title' => 'Social Issues and Professional Practice', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 3]);
        Subject::create(['course_id' => $bsit->id, 'subject_code' => 'IT311', 'subject_title' => 'Enterprise Architecture', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 3]);

        // 4th Year : 1st Semester (17 units)
        Subject::create(['course_id' => $bsit->id, 'subject_code' => 'IT401', 'subject_title' => 'IT Capstone Project 2', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 4]);
        Subject::create(['course_id' => $bsit->id, 'subject_code' => 'IT402', 'subject_title' => 'Network Administration and Automation', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 4]);
        Subject::create(['course_id' => $bsit->id, 'subject_code' => 'IT403', 'subject_title' => 'Data Analytics and Business Intelligence', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 4]);
        Subject::create(['course_id' => $bsit->id, 'subject_code' => 'IT404', 'subject_title' => 'Virtualization and Cloud Infrastructure', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 4]);
        Subject::create(['course_id' => $bsit->id, 'subject_code' => 'IT405', 'subject_title' => 'IT Audit and Risk Management', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 4]);
        Subject::create(['course_id' => $bsit->id, 'subject_code' => 'IT406', 'subject_title' => 'Applied Machine Learning for IT', 'units' => 2, 'semester' => '1st Semester', 'year_level' => 4]);

        // 4th Year : 2nd Semester (4 units)
        Subject::create(['course_id' => $bsit->id, 'subject_code' => 'IT407', 'subject_title' => 'IT Practicum / Industry Internship (486 hours)', 'units' => 4, 'semester' => '2nd Semester', 'year_level' => 4]);

        // =========================================================================
        // 3.2 BACHELOR OF SCIENCE IN INFORMATION SYSTEMS (BSIS) - 45 Subjects
        // =========================================================================
        // 1st Year : 1st Semester (24 units)
        $is101 = Subject::create(['course_id' => $bsis->id, 'subject_code' => 'IS101', 'subject_title' => 'Fundamentals of Information Systems', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 1]);
        $is102 = Subject::create(['course_id' => $bsis->id, 'subject_code' => 'IS102', 'subject_title' => 'Computer Programming 1 (Python)', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 1]);
        Subject::create(['course_id' => $bsis->id, 'subject_code' => 'ISGAD1', 'subject_title' => 'Gender and Development', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 1]);
        Subject::create(['course_id' => $bsis->id, 'subject_code' => 'ISMAT1', 'subject_title' => 'Mathematics in the Modern World', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 1]);
        Subject::create(['course_id' => $bsis->id, 'subject_code' => 'ISNSTP1', 'subject_title' => 'National Service Training Program 1', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 1]);
        Subject::create(['course_id' => $bsis->id, 'subject_code' => 'ISPED1', 'subject_title' => 'Physical Activities Toward Health and Fitness 1', 'units' => 2, 'semester' => '1st Semester', 'year_level' => 1]);
        Subject::create(['course_id' => $bsis->id, 'subject_code' => 'ISPHD1', 'subject_title' => 'PnCians Holistic Development 1', 'units' => 1, 'semester' => '1st Semester', 'year_level' => 1]);
        Subject::create(['course_id' => $bsis->id, 'subject_code' => 'ISPSY1', 'subject_title' => 'Understanding the Self', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 1]);
        Subject::create(['course_id' => $bsis->id, 'subject_code' => 'ISREAD1', 'subject_title' => 'Science and Development of Reading', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 1]);

        // 1st Year : 2nd Semester (24 units)
        Subject::create(['course_id' => $bsis->id, 'subject_code' => 'IS103', 'subject_title' => 'Computer Programming 2 (Java & Business Logic)', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 1]);
        Subject::create(['course_id' => $bsis->id, 'subject_code' => 'IS104', 'subject_title' => 'Organization and Management Concepts', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 1]);
        Subject::create(['course_id' => $bsis->id, 'subject_code' => 'IS105', 'subject_title' => 'Web Application Development for Business', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 1]);
        Subject::create(['course_id' => $bsis->id, 'subject_code' => 'ISCOM1', 'subject_title' => 'Purposive Communication', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 1]);
        Subject::create(['course_id' => $bsis->id, 'subject_code' => 'ISHIS1', 'subject_title' => 'Readings in Philippine History', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 1]);
        Subject::create(['course_id' => $bsis->id, 'subject_code' => 'ISHMN1', 'subject_title' => 'Art Appreciation', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 1]);
        Subject::create(['course_id' => $bsis->id, 'subject_code' => 'ISNSTP2', 'subject_title' => 'National Service Training Program 2', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 1]);
        Subject::create(['course_id' => $bsis->id, 'subject_code' => 'ISPED2', 'subject_title' => 'Physical Activities Toward Health and Fitness 2', 'units' => 2, 'semester' => '2nd Semester', 'year_level' => 1]);
        Subject::create(['course_id' => $bsis->id, 'subject_code' => 'ISPHD2', 'subject_title' => 'PnCians Holistic Development 2', 'units' => 1, 'semester' => '2nd Semester', 'year_level' => 1]);

        // 2nd Year : 1st Semester (23 units)
        Subject::create(['course_id' => $bsis->id, 'subject_code' => 'IS201', 'subject_title' => 'Data Structures and Algorithms for Business', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 2]);
        Subject::create(['course_id' => $bsis->id, 'subject_code' => 'IS202', 'subject_title' => 'Financial Accounting and Business Transactions', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 2]);
        Subject::create(['course_id' => $bsis->id, 'subject_code' => 'IS203', 'subject_title' => 'Enterprise Database Management Systems 1', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 2]);
        Subject::create(['course_id' => $bsis->id, 'subject_code' => 'IS204', 'subject_title' => 'Business Process Management and Modeling', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 2]);
        Subject::create(['course_id' => $bsis->id, 'subject_code' => 'ISENT1', 'subject_title' => 'The Entrepreneurial Mind', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 2]);
        Subject::create(['course_id' => $bsis->id, 'subject_code' => 'ISETH1', 'subject_title' => 'Ethics in Business and Technology', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 2]);
        Subject::create(['course_id' => $bsis->id, 'subject_code' => 'ISPED3', 'subject_title' => 'Physical Activities Toward Health and Fitness 3', 'units' => 2, 'semester' => '1st Semester', 'year_level' => 2]);
        Subject::create(['course_id' => $bsis->id, 'subject_code' => 'ISSTS1', 'subject_title' => 'Science, Technology and Society', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 2]);

        // 2nd Year : 2nd Semester (26 units)
        Subject::create(['course_id' => $bsis->id, 'subject_code' => 'IS205', 'subject_title' => 'Enterprise Database Management Systems 2', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 2]);
        Subject::create(['course_id' => $bsis->id, 'subject_code' => 'IS206', 'subject_title' => 'Systems Analysis and Design for IS', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 2]);
        Subject::create(['course_id' => $bsis->id, 'subject_code' => 'IS207', 'subject_title' => 'Marketing and Consumer Analytics', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 2]);
        Subject::create(['course_id' => $bsis->id, 'subject_code' => 'IS208', 'subject_title' => 'Discrete Mathematics for Business', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 2]);
        Subject::create(['course_id' => $bsis->id, 'subject_code' => 'IS209', 'subject_title' => 'Quantitative Business Analysis', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 2]);
        Subject::create(['course_id' => $bsis->id, 'subject_code' => 'IS210', 'subject_title' => 'IT Infrastructure and Network Fundamentals', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 2]);
        Subject::create(['course_id' => $bsis->id, 'subject_code' => 'ISSOC1', 'subject_title' => 'The Contemporary World', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 2]);
        Subject::create(['course_id' => $bsis->id, 'subject_code' => 'ISPED4', 'subject_title' => 'Physical Activities Toward Health and Fitness 4', 'units' => 2, 'semester' => '2nd Semester', 'year_level' => 2]);
        Subject::create(['course_id' => $bsis->id, 'subject_code' => 'ISRIZ1', 'subject_title' => 'Life and Works of Rizal', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 2]);

        // 3rd Year : 1st Semester (21 units)
        Subject::create(['course_id' => $bsis->id, 'subject_code' => 'IS301', 'subject_title' => 'Enterprise Systems Architecture (ERP)', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 3]);
        Subject::create(['course_id' => $bsis->id, 'subject_code' => 'IS302', 'subject_title' => 'IS Project Management & Quality Assurance', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 3]);
        Subject::create(['course_id' => $bsis->id, 'subject_code' => 'IS303', 'subject_title' => 'Business Intelligence & Decision Support Systems', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 3]);
        Subject::create(['course_id' => $bsis->id, 'subject_code' => 'IS304', 'subject_title' => 'IT Security, Governance and Compliance', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 3]);
        Subject::create(['course_id' => $bsis->id, 'subject_code' => 'IS305', 'subject_title' => 'E-Commerce and Digital Business Strategy', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 3]);
        Subject::create(['course_id' => $bsis->id, 'subject_code' => 'ISENV1', 'subject_title' => 'Environmental Science', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 3]);
        Subject::create(['course_id' => $bsis->id, 'subject_code' => 'ISTEC1', 'subject_title' => 'Technopreneurship in Information Systems', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 3]);

        // 3rd Year : 2nd Semester (18 units)
        Subject::create(['course_id' => $bsis->id, 'subject_code' => 'IS306', 'subject_title' => 'Enterprise Resource Planning Configuration', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 3]);
        Subject::create(['course_id' => $bsis->id, 'subject_code' => 'IS307', 'subject_title' => 'Customer Relationship Management Systems', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 3]);
        Subject::create(['course_id' => $bsis->id, 'subject_code' => 'IS308', 'subject_title' => 'Big Data Analytics for Organizations', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 3]);
        Subject::create(['course_id' => $bsis->id, 'subject_code' => 'IS309', 'subject_title' => 'IS Capstone Project 1', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 3]);
        Subject::create(['course_id' => $bsis->id, 'subject_code' => 'IS310', 'subject_title' => 'IS Strategy, Management and Acquisition', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 3]);
        Subject::create(['course_id' => $bsis->id, 'subject_code' => 'IS311', 'subject_title' => 'Human Resource Information Systems', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 3]);

        // 4th Year : 1st Semester (17 units)
        Subject::create(['course_id' => $bsis->id, 'subject_code' => 'IS401', 'subject_title' => 'IS Capstone Project 2', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 4]);
        Subject::create(['course_id' => $bsis->id, 'subject_code' => 'IS402', 'subject_title' => 'IT Service Management and ITIL', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 4]);
        Subject::create(['course_id' => $bsis->id, 'subject_code' => 'IS403', 'subject_title' => 'Knowledge Management Systems', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 4]);
        Subject::create(['course_id' => $bsis->id, 'subject_code' => 'IS404', 'subject_title' => 'Strategic IT Leadership and Innovation', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 4]);
        Subject::create(['course_id' => $bsis->id, 'subject_code' => 'IS405', 'subject_title' => 'Information Systems Audit and Controls', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 4]);
        Subject::create(['course_id' => $bsis->id, 'subject_code' => 'IS406', 'subject_title' => 'Applied Business AI and Automation', 'units' => 2, 'semester' => '1st Semester', 'year_level' => 4]);

        // 4th Year : 2nd Semester (4 units)
        Subject::create(['course_id' => $bsis->id, 'subject_code' => 'IS407', 'subject_title' => 'IS Practicum / Industry Internship (486 hours)', 'units' => 4, 'semester' => '2nd Semester', 'year_level' => 4]);

        // =========================================================================
        // 3.3 BACHELOR OF SCIENCE IN COMPUTER SCIENCE (BSCS) - 45 Subjects
        // =========================================================================
        // 1st Year : 1st Semester (24 units)
        Subject::create(['course_id' => $bscs->id, 'subject_code' => 'CCS101', 'subject_title' => 'Introduction to Computing', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 1]);
        Subject::create(['course_id' => $bscs->id, 'subject_code' => 'CCS102', 'subject_title' => 'Computer Programming 1', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 1]);
        Subject::create(['course_id' => $bscs->id, 'subject_code' => 'GAD101', 'subject_title' => 'Gender and Development', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 1]);
        Subject::create(['course_id' => $bscs->id, 'subject_code' => 'MAT101', 'subject_title' => 'Mathematics in the Modern World', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 1]);
        Subject::create(['course_id' => $bscs->id, 'subject_code' => 'NSTP1', 'subject_title' => 'National Service Training Program 1', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 1]);
        Subject::create(['course_id' => $bscs->id, 'subject_code' => 'PED101', 'subject_title' => 'Physical Activities Toward Health and Fitness 1', 'units' => 2, 'semester' => '1st Semester', 'year_level' => 1]);
        Subject::create(['course_id' => $bscs->id, 'subject_code' => 'PHD101', 'subject_title' => 'PnCians Holistic Development 1', 'units' => 1, 'semester' => '1st Semester', 'year_level' => 1]);
        Subject::create(['course_id' => $bscs->id, 'subject_code' => 'PSY100', 'subject_title' => 'Understanding the Self', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 1]);
        Subject::create(['course_id' => $bscs->id, 'subject_code' => 'READ100', 'subject_title' => 'Science and Development of Reading', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 1]);

        // 1st Year : 2nd Semester (24 units)
        Subject::create(['course_id' => $bscs->id, 'subject_code' => 'CCS103', 'subject_title' => 'Computer Programming 2', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 1]);
        Subject::create(['course_id' => $bscs->id, 'subject_code' => 'CCS105', 'subject_title' => 'Human Computer Interaction 1', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 1]);
        Subject::create(['course_id' => $bscs->id, 'subject_code' => 'CCS114', 'subject_title' => 'Web Technologies', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 1]);
        Subject::create(['course_id' => $bscs->id, 'subject_code' => 'COM101', 'subject_title' => 'Purposive Communication', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 1]);
        Subject::create(['course_id' => $bscs->id, 'subject_code' => 'HIS101', 'subject_title' => 'Readings in Philippine History', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 1]);
        Subject::create(['course_id' => $bscs->id, 'subject_code' => 'HMN101', 'subject_title' => 'Art Appreciation', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 1]);
        Subject::create(['course_id' => $bscs->id, 'subject_code' => 'NSTP2', 'subject_title' => 'National Service Training Program 2', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 1]);
        Subject::create(['course_id' => $bscs->id, 'subject_code' => 'PED102', 'subject_title' => 'Physical Activities Toward Health and Fitness 2', 'units' => 2, 'semester' => '2nd Semester', 'year_level' => 1]);
        Subject::create(['course_id' => $bscs->id, 'subject_code' => 'PHD102', 'subject_title' => 'PnCians Holistic Development 2', 'units' => 1, 'semester' => '2nd Semester', 'year_level' => 1]);

        // 2nd Year : 1st Semester (23 units)
        $ccs104 = Subject::create(['course_id' => $bscs->id, 'subject_code' => 'CCS104', 'subject_title' => 'Discrete Structures 1', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 2]);
        $ccs107 = Subject::create(['course_id' => $bscs->id, 'subject_code' => 'CCS107', 'subject_title' => 'Data Structures and Algorithms', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 2]);
        $csp101 = Subject::create(['course_id' => $bscs->id, 'subject_code' => 'CSP101', 'subject_title' => 'Differential Calculus with Analytical Geometry', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 2]);
        $ent101 = Subject::create(['course_id' => $bscs->id, 'subject_code' => 'ENT101', 'subject_title' => 'The Entrepreneurial Mind', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 2]);
        $eth101 = Subject::create(['course_id' => $bscs->id, 'subject_code' => 'ETH101', 'subject_title' => 'Ethics', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 2]);
        $ped103 = Subject::create(['course_id' => $bscs->id, 'subject_code' => 'PED103', 'subject_title' => 'Physical Activities Toward Health and Fitness 3', 'units' => 2, 'semester' => '1st Semester', 'year_level' => 2]);
        $soc101 = Subject::create(['course_id' => $bscs->id, 'subject_code' => 'SOC101', 'subject_title' => 'The Contemporary World', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 2]);
        $sts101 = Subject::create(['course_id' => $bscs->id, 'subject_code' => 'STS101', 'subject_title' => 'Science, Technology and Society', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 2]);

        // 2nd Year : 2nd Semester (26 units)
        Subject::create(['course_id' => $bscs->id, 'subject_code' => 'CCS108', 'subject_title' => 'Object-Oriented Programming', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 2]);
        Subject::create(['course_id' => $bscs->id, 'subject_code' => 'CCS110', 'subject_title' => 'Information Management 1', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 2]);
        Subject::create(['course_id' => $bscs->id, 'subject_code' => 'CCS113', 'subject_title' => 'Information Assurance Security', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 2]);
        Subject::create(['course_id' => $bscs->id, 'subject_code' => 'CNT101', 'subject_title' => 'Number Theory', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 2]);
        Subject::create(['course_id' => $bscs->id, 'subject_code' => 'CSP102', 'subject_title' => 'Discrete Structures 2', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 2]);
        Subject::create(['course_id' => $bscs->id, 'subject_code' => 'CSP104', 'subject_title' => 'Integral Calculus with Differential Equation', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 2]);
        Subject::create(['course_id' => $bscs->id, 'subject_code' => 'CSP107', 'subject_title' => 'Computer Organization and Assembly Language', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 2]);
        Subject::create(['course_id' => $bscs->id, 'subject_code' => 'PED104', 'subject_title' => 'Physical Activities Toward Health and Fitness 4', 'units' => 2, 'semester' => '2nd Semester', 'year_level' => 2]);
        Subject::create(['course_id' => $bscs->id, 'subject_code' => 'RIZ101', 'subject_title' => 'Life and Works of Rizal', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 2]);

        // 3rd Year : 1st Semester (21 units)
        $ccs106 = Subject::create(['course_id' => $bscs->id, 'subject_code' => 'CCS106', 'subject_title' => 'Social Issues and Professional Practice', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 3]);
        $ccs109 = Subject::create(['course_id' => $bscs->id, 'subject_code' => 'CCS109', 'subject_title' => 'System Analysis and Design', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 3]);
        $ccs112 = Subject::create(['course_id' => $bscs->id, 'subject_code' => 'CCS112', 'subject_title' => 'Applications Development and Emerging Technologies', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 3]);
        $cseg1 = Subject::create(['course_id' => $bscs->id, 'subject_code' => 'CSEG1', 'subject_title' => 'Game Concepts and Production', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 3]);
        $csp105 = Subject::create(['course_id' => $bscs->id, 'subject_code' => 'CSP105', 'subject_title' => 'Algorithms and Complexity', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 3]);
        $csp108 = Subject::create(['course_id' => $bscs->id, 'subject_code' => 'CSP108', 'subject_title' => 'Programming Languages', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 3]);
        $env101 = Subject::create(['course_id' => $bscs->id, 'subject_code' => 'ENV101', 'subject_title' => 'Environmental Science', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 3]);

        // 3rd Year : 2nd Semester (18 units)
        Subject::create(['course_id' => $bscs->id, 'subject_code' => 'CSEG2', 'subject_title' => 'Game Programming 1', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 3]);
        Subject::create(['course_id' => $bscs->id, 'subject_code' => 'CSP106', 'subject_title' => 'Automata Theory and Formal Languages', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 3]);
        Subject::create(['course_id' => $bscs->id, 'subject_code' => 'CSP109', 'subject_title' => 'Software Engineering 1', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 3]);
        Subject::create(['course_id' => $bscs->id, 'subject_code' => 'CSP111', 'subject_title' => 'Thesis 1', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 3]);
        Subject::create(['course_id' => $bscs->id, 'subject_code' => 'CSP112', 'subject_title' => 'Operating Systems', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 3]);
        Subject::create(['course_id' => $bscs->id, 'subject_code' => 'TEC101', 'subject_title' => 'Technopreneurship', 'units' => 3, 'semester' => '2nd Semester', 'year_level' => 3]);

        // 4th Year : 1st Semester (17 units)
        Subject::create(['course_id' => $bscs->id, 'subject_code' => 'CCS111', 'subject_title' => 'Networking and Communication 1', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 4]);
        Subject::create(['course_id' => $bscs->id, 'subject_code' => 'CPS101', 'subject_title' => 'Probability and Statistics', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 4]);
        Subject::create(['course_id' => $bscs->id, 'subject_code' => 'CSEG3', 'subject_title' => 'Game Programming 2', 'units' => 2, 'semester' => '1st Semester', 'year_level' => 4]);
        Subject::create(['course_id' => $bscs->id, 'subject_code' => 'CSP110', 'subject_title' => 'Numerical Analysis', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 4]);
        Subject::create(['course_id' => $bscs->id, 'subject_code' => 'CSP113', 'subject_title' => 'Software Engineering 2', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 4]);
        Subject::create(['course_id' => $bscs->id, 'subject_code' => 'CSP114', 'subject_title' => 'Thesis 2', 'units' => 3, 'semester' => '1st Semester', 'year_level' => 4]);

        // 4th Year : 2nd Semester (4 units)
        Subject::create(['course_id' => $bscs->id, 'subject_code' => 'CSP115', 'subject_title' => 'CS Practicum (300 hours)', 'units' => 4, 'semester' => '2nd Semester', 'year_level' => 4]);

        // 4. Staff Users
        $adminUser = User::create([
            'name' => 'System Administrator',
            'email' => 'admin@cuyotech.edu.ph',
            'password' => Hash::make('CuyoTech2026!'),
            'role' => 'admin',
            'status' => 'active',
            'must_change_password' => true,
        ]);

        $registrarUser = User::create([
            'name' => 'Dr. Elena Ramos (Registrar)',
            'email' => 'registrar@cuyotech.edu.ph',
            'password' => Hash::make('CuyoTech2026!'),
            'role' => 'registrar',
            'status' => 'active',
            'must_change_password' => true,
        ]);

        $cashierUser = User::create([
            'name' => 'Ben Cruz (Cashier Officer)',
            'email' => 'cashier@cuyotech.edu.ph',
            'password' => Hash::make('CuyoTech2026!'),
            'role' => 'cashier',
            'status' => 'active',
            'must_change_password' => true,
        ]);

        $deptUser = User::create([
            'name' => 'Prof. Rolando Diaz (CCS Dept Head)',
            'email' => 'department@cuyotech.edu.ph',
            'password' => Hash::make('CuyoTech2026!'),
            'role' => 'department',
            'status' => 'active',
            'must_change_password' => true,
        ]);

        // 5. Student Users & Profiles
        // Student 1: Juan Dela Cruz (Enrolled, Cleared)
        $studentUser1 = User::create([
            'name' => 'Juan Dela Cruz',
            'email' => 'student@cuyotech.edu.ph',
            'password' => Hash::make('2026-00123'),
            'role' => 'student',
            'status' => 'active',
            'must_change_password' => true,
        ]);

        $student1 = Student::create([
            'user_id' => $studentUser1->id,
            'course_id' => $bsit->id,
            'student_number' => '2026-00123',
            'year_level' => 2,
            'clearance_status' => true,
        ]);
        $student1->seedPreviousYearsAsPassed();

        // Enrollments & Grades for Juan (Current Year 2 Semester 1)
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
            'password' => Hash::make('2026-00124'),
            'role' => 'student',
            'status' => 'active',
            'must_change_password' => true,
        ]);

        $student2 = Student::create([
            'user_id' => $studentUser2->id,
            'course_id' => $bscs->id,
            'student_number' => '2026-00124',
            'year_level' => 3,
            'clearance_status' => true,
        ]);
        $student2->seedPreviousYearsAsPassed();

        // Enrollments & Grades for Maria Santos (BSCS 3rd Year Current Semester)
        Enrollment::create(['student_id' => $student2->id, 'subject_id' => $ccs109->id, 'academic_year' => '2026-2027', 'semester' => '1st Semester', 'grade' => 1.25, 'remarks' => 'Passed', 'enrollment_status' => 'enrolled']);
        Enrollment::create(['student_id' => $student2->id, 'subject_id' => $ccs106->id, 'academic_year' => '2026-2027', 'semester' => '1st Semester', 'grade' => 1.50, 'remarks' => 'Passed', 'enrollment_status' => 'enrolled']);
        Enrollment::create(['student_id' => $student2->id, 'subject_id' => $ccs112->id, 'academic_year' => '2026-2027', 'semester' => '1st Semester', 'grade' => 1.50, 'remarks' => 'Passed', 'enrollment_status' => 'enrolled']);
        Enrollment::create(['student_id' => $student2->id, 'subject_id' => $cseg1->id, 'academic_year' => '2026-2027', 'semester' => '1st Semester', 'grade' => 1.75, 'remarks' => 'Passed', 'enrollment_status' => 'enrolled']);
        Enrollment::create(['student_id' => $student2->id, 'subject_id' => $csp105->id, 'academic_year' => '2026-2027', 'semester' => '1st Semester', 'grade' => 1.25, 'remarks' => 'Passed', 'enrollment_status' => 'enrolled']);
        Enrollment::create(['student_id' => $student2->id, 'subject_id' => $csp108->id, 'academic_year' => '2026-2027', 'semester' => '1st Semester', 'grade' => 1.50, 'remarks' => 'Passed', 'enrollment_status' => 'enrolled']);
        Enrollment::create(['student_id' => $student2->id, 'subject_id' => $env101->id, 'academic_year' => '2026-2027', 'semester' => '1st Semester', 'grade' => 1.75, 'remarks' => 'Passed', 'enrollment_status' => 'enrolled']);

        ClearanceRecord::create(['student_id' => $student2->id, 'department_id' => $ccs->id, 'signatory_name' => 'CCS Department Office', 'status' => 'cleared', 'cleared_at' => now()]);
        ClearanceRecord::create(['student_id' => $student2->id, 'department_id' => $library->id, 'signatory_name' => 'University Library', 'status' => 'cleared', 'cleared_at' => now()]);

        // Student 2.1: Carlos Mendoza (BSCS 2nd Year)
        $studentUserCarlos = User::create([
            'name' => 'Carlos Mendoza',
            'email' => 'carlos@cuyotech.edu.ph',
            'password' => Hash::make('2026-00126'),
            'role' => 'student',
            'status' => 'active',
            'must_change_password' => true,
        ]);

        $studentCarlos = Student::create([
            'user_id' => $studentUserCarlos->id,
            'course_id' => $bscs->id,
            'student_number' => '2026-00126',
            'year_level' => 2,
            'clearance_status' => true,
        ]);
        $studentCarlos->seedPreviousYearsAsPassed();

        Enrollment::create(['student_id' => $studentCarlos->id, 'subject_id' => $ccs104->id, 'academic_year' => '2026-2027', 'semester' => '1st Semester', 'grade' => 1.50, 'remarks' => 'Passed', 'enrollment_status' => 'enrolled']);
        Enrollment::create(['student_id' => $studentCarlos->id, 'subject_id' => $ccs107->id, 'academic_year' => '2026-2027', 'semester' => '1st Semester', 'grade' => 1.25, 'remarks' => 'Passed', 'enrollment_status' => 'enrolled']);
        Enrollment::create(['student_id' => $studentCarlos->id, 'subject_id' => $csp101->id, 'academic_year' => '2026-2027', 'semester' => '1st Semester', 'grade' => 1.75, 'remarks' => 'Passed', 'enrollment_status' => 'enrolled']);
        Enrollment::create(['student_id' => $studentCarlos->id, 'subject_id' => $ent101->id, 'academic_year' => '2026-2027', 'semester' => '1st Semester', 'grade' => 1.50, 'remarks' => 'Passed', 'enrollment_status' => 'enrolled']);
        Enrollment::create(['student_id' => $studentCarlos->id, 'subject_id' => $eth101->id, 'academic_year' => '2026-2027', 'semester' => '1st Semester', 'grade' => 1.25, 'remarks' => 'Passed', 'enrollment_status' => 'enrolled']);
        Enrollment::create(['student_id' => $studentCarlos->id, 'subject_id' => $ped103->id, 'academic_year' => '2026-2027', 'semester' => '1st Semester', 'grade' => 1.00, 'remarks' => 'Passed', 'enrollment_status' => 'enrolled']);
        Enrollment::create(['student_id' => $studentCarlos->id, 'subject_id' => $soc101->id, 'academic_year' => '2026-2027', 'semester' => '1st Semester', 'grade' => 1.75, 'remarks' => 'Passed', 'enrollment_status' => 'enrolled']);
        Enrollment::create(['student_id' => $studentCarlos->id, 'subject_id' => $sts101->id, 'academic_year' => '2026-2027', 'semester' => '1st Semester', 'grade' => 1.50, 'remarks' => 'Passed', 'enrollment_status' => 'enrolled']);

        ClearanceRecord::create(['student_id' => $studentCarlos->id, 'department_id' => $ccs->id, 'signatory_name' => 'CCS Department Office', 'status' => 'cleared', 'cleared_at' => now()]);
        ClearanceRecord::create(['student_id' => $studentCarlos->id, 'department_id' => $library->id, 'signatory_name' => 'University Library', 'status' => 'cleared', 'cleared_at' => now()]);

        // Student 3: Pedro Reyes (Uncleared - for testing clearance hold workflow in swimlane diagram)
        $studentUser3 = User::create([
            'name' => 'Pedro Reyes',
            'email' => 'pedro@cuyotech.edu.ph',
            'password' => Hash::make('2026-00125'),
            'role' => 'student',
            'status' => 'active',
            'must_change_password' => true,
        ]);

        $student3 = Student::create([
            'user_id' => $studentUser3->id,
            'course_id' => $bsis->id,
            'student_number' => '2026-00125',
            'year_level' => 1,
            'clearance_status' => false,
        ]);

        // Enroll Pedro Reyes in 1st Year 1st Sem BSIS Subjects
        $bsisY1S1Subjects = Subject::where('course_id', $bsis->id)
            ->where('year_level', 1)
            ->where('semester', '1st Semester')
            ->get();
        foreach ($bsisY1S1Subjects as $sub) {
            Enrollment::create([
                'student_id' => $student3->id,
                'subject_id' => $sub->id,
                'academic_year' => '2026-2027',
                'semester' => '1st Semester',
                'grade' => null,
                'remarks' => 'Enrolled',
                'enrollment_status' => 'enrolled',
            ]);
        }

        ClearanceRecord::create([
            'student_id' => $student3->id,
            'department_id' => $library->id,
            'signatory_name' => 'University Library',
            'status' => 'hold',
            'hold_reason' => 'Unreturned borrowed textbook: Systems Analysis Principles',
            'appeal_notes' => 'Returned book to Library Receiving Counter on Oct 16. Awaiting acknowledgement slip #LIB-8812.',
            'appeal_status' => 'pending',
            'appeal_submitted_at' => now()->subDay(),
        ]);
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
        $req1->issueVerificationSeal();

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

        // 8. In-App Notifications
        Notification::send(
            $studentUser1->id,
            'Official Document Certified & Released',
            'Your Transcript of Records (TRK-2026-10001) has been cryptographically certified and released by the Registrar.',
            'document',
            '/student/requests'
        );
        Notification::send(
            $studentUser1->id,
            'Official Receipt Issued',
            'Payment of ₱150.00 verified. Official Receipt #OR-2026-00841 issued.',
            'payment',
            '/student/requests'
        );
        Notification::send(
            $studentUser1->id,
            'Enrollment Cleared',
            'Your enrollment for AY 2026-2027 1st Semester has been cleared and approved.',
            'success',
            '/student/grades'
        );
        Notification::send(
            $cashierUser->id,
            'New Assessment Fee Pending',
            'Document request TRK-2026-10003 by Maria Santos is pending payment assessment of ₱50.00.',
            'payment',
            '/cashier'
        );
        Notification::send(
            $registrarUser->id,
            'Document Request Ready for Processing',
            'Request TRK-2026-10002 has been paid and is waiting in your processing queue.',
            'document',
            '/registrar'
        );
        Notification::send(
            $deptUser->id,
            'New Clearance Appeal Submitted',
            'Student Pedro Reyes (2026-00125) submitted an appeal regarding Library textbook accountability.',
            'clearance',
            '/department'
        );
    }
}
