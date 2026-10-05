# CuyoTech University Student Services Information System (SSIS)
## System Implementation & Technical Documentation Report

---

### 1. Executive Summary

The **CuyoTech University Student Services Information System (SSIS)** is an enterprise web application designed to transition manual, queue-heavy student workflows—such as enrollment, academic clearance verification, grade viewing, cashier payments, and document requests—into an integrated, automated, and secure digital platform.

Built with **Laravel 13 (PHP 8.3)** and **React 19**, the system adheres directly to the Systems Analysis and Design (SAD) deliverables, including the **DFD Level 0 Context Diagram**, **Swimlane Activity Diagram**, **Unified Class Diagram**, and **3NF Relational Database Schema**.

---

### 2. System Architecture & Diagram Alignment

```
                                  +-------------------------------------------------+
                                  |         SSIS Unified Web Application            |
                                  |            (React 19 SPA + Tailwind)            |
                                  +-------------------------------------------------+
                                                          |
                                                          | REST API / JSON
                                                          v
                                  +-------------------------------------------------+
                                  |         Laravel 13 Application Layer            |
                                  | (Auth, Student, Registrar, Cashier, Dept, Admin)|
                                  +-------------------------------------------------+
                                                          |
                                                          | Eloquent ORM
                                                          v
                                  +-------------------------------------------------+
                                  |         SQLite / Relational Database            |
                                  |   (3NF Normalized Schema - 10 Core Tables)      |
                                  +-------------------------------------------------+
```

#### A. Data Flow Diagram (DFD Level 0 Context Diagram)
The system models 5 primary external entities and their corresponding bidirectional data streams:
1. **Student**: Submits requests (documents, enrollment, clearance, payments); receives authentication results, schedule confirmations, grades, official receipts, and issued credentials.
2. **Registrar**: Receives enrollment applications, grade sheets, and document requests; submits approvals, encoded grades, and released documents.
3. **Cashier**: Receives payment confirmations and requests; issues official receipts (`OR-XXXXX`) and maintains the collection ledger.
4. **Department**: Receives clearance requests; submits departmental clearance approvals or active holds with accountability reasons.
5. **Admin**: Manages user accounts across all roles and inspects security/transaction audit logs.

#### B. Activity Diagram (Swimlane Workflow for Document Requests)
```
[Student]                                [Registrar]                           [Cashier]
   |                                          |                                    |
   |-- 1. Select Doc Type & Purpose --------->|                                    |
   |                                          |-- 2. Check Academic Clearance      |
   |                                          |      & Department Holds            |
   |                                          |                                    |
   |<-- (Has Hold: Blocked / Hold Notice) ----|                                    |
   |                                          |                                    |
   |-- (Cleared: Pay Assessment Fee) --------------------------------------------->|
   |                                                                               |-- 3. Verify Payment
   |                                                                               |      & Issue Official Receipt
   |<-- 4. Receive Official Receipt ----------+------------------------------------|
   |                                          |
   |                                          |-- 5. Process & Generate Document
   |                                          |-- 6. Release Official Credential
   |<-- 7. Download / Print Document ---------|
```

---

### 3. Database Design & 3NF Normalization

The database strictly implements the 3NF ERD specification with referential integrity constraints (`CASCADE`, `RESTRICT`, `SET NULL`):

| Table Name | Primary Key | Foreign Keys | Key Attributes & Constraints |
| :--- | :--- | :--- | :--- |
| **`departments`** | `id` (BIGINT) | None | `department_code` (VARCHAR(20), UNIQUE), `department_name`, `office_location` |
| **`courses`** | `id` (BIGINT) | `department_id` &rarr; `departments.id` (RESTRICT) | `course_code` (VARCHAR(20), UNIQUE), `course_title`, `total_units` |
| **`users`** | `id` (BIGINT) | None | `name`, `email` (UNIQUE), `password`, `role` (ENUM: student, registrar, cashier, department, admin), `status` (active, inactive, suspended) |
| **`students`** | `id` (BIGINT) | `user_id` &rarr; `users.id` (CASCADE), `course_id` &rarr; `courses.id` (RESTRICT) | `student_number` (VARCHAR(30), UNIQUE), `year_level` (INT), `clearance_status` (BOOLEAN) |
| **`document_requests`** | `id` (BIGINT) | `student_id` &rarr; `students.id` (RESTRICT), `assigned_admin_id` &rarr; `users.id` (SET NULL) | `tracking_number` (VARCHAR(50), UNIQUE), `document_type` (TOR, COR, Certification), `purpose`, `processing_status` (pending_payment, paid, processing, ready_for_pickup, released, rejected), `assessment_fee`, `requested_date`, `release_date` |
| **`payments`** | `id` (BIGINT) | `document_request_id` &rarr; `document_requests.id` (RESTRICT), `processed_by_user_id` &rarr; `users.id` (SET NULL) | `official_receipt_no` (VARCHAR(50), UNIQUE), `amount_paid`, `payment_method` (cash, online, bank_transfer), `payment_status` (pending, verified, failed), `transaction_date` |
| **`subjects`** | `id` (BIGINT) | `course_id` &rarr; `courses.id` (CASCADE) | `subject_code`, `subject_title`, `units`, `semester`, `year_level` |
| **`enrollments`** | `id` (BIGINT) | `student_id` &rarr; `students.id` (CASCADE), `subject_id` &rarr; `subjects.id` (CASCADE) | `academic_year`, `semester`, `grade` (DECIMAL(3,2)), `remarks`, `enrollment_status` |
| **`clearance_records`**| `id` (BIGINT) | `student_id` &rarr; `students.id` (CASCADE), `department_id` &rarr; `departments.id` (SET NULL) | `signatory_name`, `status` (cleared, hold), `hold_reason`, `cleared_at` |
| **`audit_logs`** | `id` (BIGINT) | `user_id` &rarr; `users.id` (SET NULL) | `action`, `details`, `ip_address`, `created_at` |

---

### 4. Implementation Details by Module

#### 1. Student Portal
- **Dashboard**: Displays student profile, enrolled degree program, GWA calculation, credit units, and active clearance badge.
- **Clearance Hold Decision Tree**: If any department hold exists, displays prominent warning banner and blocks document submission until obligations are cleared.
- **Grades & Subjects**: Displays course curriculum, enrolled subjects, numerical grades (1.00 - 5.00), and academic standing.
- **Document Request Submission**: Real-time fee computation (TOR = ₱150, COR = ₱75, Certification = ₱50 per copy) and tracking ID generation (`TRK-2026-XXXXX`).
- **Printable Document & Receipt Viewer**: Generates institutional transcripts, certificates with security verification hashes, and official payment receipts.

#### 2. Registrar Module
- **Enrollment Approval**: Inspects student rosters, evaluates academic load, and confirms official enrollment.
- **Grades Encoding**: Subject-based grade sheet allowing instructors and registrar staff to encode and update student marks with range validation.
- **Document Requests Queue**: Status management pipeline (`processing` &rarr; `ready_for_pickup` &rarr; `released`) with release timestamping.

#### 3. Cashier Module
- **Billing & Assessment Queue**: Lists unpaid document requests and pending fees.
- **Official Receipt Issuance**: Generates unique `OR-2026-XXXXX` records, validates amounts, supports multiple payment methods (Cash, Online / GCash, Bank Transfer), and transitions requests to `processing`.
- **Receipts Ledger**: Provides search, transaction audit trail, and total collection accounting.

#### 4. Department Module
- **Clearance Processing**: View department students, toggle hold / cleared status, and record specific hold reasons (e.g., unreturned library books or lab equipment).
- **Live Sync**: Clearing holds immediately updates the student's eligibility across the platform.

#### 5. Admin Module
- **User Account Management**: Create, view, edit, activate, deactivate, or suspend accounts across all 5 roles.
- **System Metrics**: Visual overview of total users, enrolled students, pending requests, collections, and clearance rates.
- **Audit Logs**: Immutable log table recording event actions, user identity, details, and client IP addresses.

---

### 5. Codebase Inventory & File Changes

```
FrontEndSSIS12/
├── app/
│   ├── Http/Controllers/
│   │   ├── AdminController.php             # User management, system metrics, audit logs
│   │   ├── AuthController.php              # Multi-role authentication & session state
│   │   ├── DepartmentController.php        # Clearance records, hold placements & clearing
│   │   ├── DocumentRequestController.php   # Swimlane workflow, clearance checks, fee calculation
│   │   ├── PaymentController.php           # Cashier receipt issuance & collections ledger
│   │   ├── RegistrarController.php         # Enrollment approval & grade encoding
│   │   └── StudentController.php           # Dashboard, grades, subjects, clearance summary
│   └── Models/
│       ├── AuditLog.php                    # System security event logging
│       ├── ClearanceRecord.php             # Departmental clearance holds & timestamps
│       ├── Course.php                      # Academic degree programs
│       ├── Department.php                  # University colleges & service units
│       ├── DocumentRequest.php             # Request lifecycle & fee calculation logic
│       ├── Enrollment.php                  # Subject enrollments & grades
│       ├── Payment.php                     # Official receipt generation & payment status
│       ├── Student.php                     # Student profile & clearance evaluation
│       ├── Subject.php                     # Academic curriculum subjects
│       └── User.php                        # User authentication, role, and status
├── database/
│   ├── migrations/                         # 10 3NF-compliant database migrations
│   └── seeders/
│       └── DatabaseSeeder.php              # Comprehensive sample dataset for all roles
├── resources/
│   ├── css/
│   │   └── app.css                         # Tailwind CSS v4 + University design tokens & print stylesheets
│   └── js/
│       ├── api.js                          # Standardized HTTP API client
│       ├── config.js                       # Roles, routes, demo accounts & fee constants
│       ├── AppRouter.jsx                   # React Router DOM layout & declarative route tree
│       ├── app.jsx                         # Application entrypoint
│       ├── context/
│       │   └── AuthContext.jsx             # Global authentication & role-switching context
│       ├── components/
│       │   ├── Navbar.jsx                  # Top navigation & role switcher dropdown
│       │   ├── Sidebar.jsx                 # NavLink sidebar with user profile & badges
│       │   ├── StatusBadge.jsx             # Status pill badge component
│       │   ├── StatCard.jsx                # Key metrics card
│       │   ├── BannerAlert.jsx             # Alert notification component
│       │   ├── OfficialDocumentModal.jsx   # Printable TOR / COR / Certification preview
│       │   └── OfficialReceiptModal.jsx    # Cashier printable official receipt preview
│       └── pages/
│           ├── Login.jsx                   # Sign-in portal with quick demo switcher
│           ├── student/                    # StudentDashboard, GradesAndSubjects, ClearanceStatus, DocumentRequests
│           ├── registrar/                  # DocumentQueue, GradesEncoding, Enrollment
│           ├── cashier/                    # PaymentQueue, ReceiptsLedger
│           ├── department/                 # ClearanceProcessing
│           └── admin/                      # SystemOverview, UserAccounts, AuditLogs
├── routes/
│   └── web.php                             # 24 REST API endpoints + SPA catch-all route
└── tests/
    └── Feature/
        └── DocumentRequestWorkflowTest.php # Comprehensive test suite for SSIS workflow
```

---

### 6. Verification & Automated Test Results

#### Automated Feature Test Execution (`php artisan test`)
All 6 end-to-end feature tests executed successfully with zero failures:
```text
   PASS  Tests\Feature\DocumentRequestWorkflowTest
  ✓ student can fetch dashboard and grades                                     0.15s
  ✓ clearance hold blocks document request in swimlane                         0.10s
  ✓ cleared student can successfully submit document request                   0.12s
  ✓ cashier can issue official receipt and advance status                      0.11s
  ✓ registrar can release document                                             0.09s
  ✓ department can clear hold                                                  0.08s

  Tests:    6 passed (27 assertions)
  Duration: 0.91s
```

#### Code Quality & Standards (`vendor/bin/pint`)
All modified PHP files were verified and passed PSR-12 code style checks.

#### UI/UX, Font & Printing Optimizations
- **Font Integration**: Imported and configured Google Font `Inter` across all headings, cards, and UI components.
- **Strict 1-Page Print Stylesheet**: Engineered `@media print` rules enforcing single-page fit for credentials (TOR, COR, Certifications) and official receipts, eliminating page spillovers.
- **Real-Time Module Navigation**: Instant route synchronization on role switch with immediate layout re-render.
- **Data Freshness & Header Auth**: Integrated `ResolveHeaderUser` middleware and `localStorage` auth token synchronization to ensure zero delay in fetching updated database states (audit logs, clearance status, etc.).

---

### 7. Test Personas & Quick Login Credentials

| Role | Name | Email / ID | Password | Key Testing Feature |
| :--- | :--- | :--- | :--- | :--- |
| **Student (Cleared)** | Juan Dela Cruz | `2026-00123` | `password` | Submits TOR/COR/Cert requests, views grades & GWA |
| **Student (Hold)** | Pedro Reyes | `2026-00125` | `password` | Triggers Swimlane Clearance Hold blocking modal |
| **Registrar** | Dr. Elena Ramos | `registrar@cuyotech.edu.ph` | `password` | Encodes grades, approves enrollments, releases documents |
| **Cashier** | Ben Cruz | `cashier@cuyotech.edu.ph` | `password` | Issues `OR-2026-XXXXX` and inspects collections |
| **Department** | Prof. Rolando Diaz | `department@cuyotech.edu.ph` | `password` | Places / clears student accountability holds |
| **Administrator** | System Admin | `admin@cuyotech.edu.ph` | `password` | Manages accounts, checks audit logs & system stats |
