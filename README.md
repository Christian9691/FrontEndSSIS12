# CuyoTech University Student Services Information System (SSIS)

An integrated, enterprise-grade academic management and student services portal designed for **CuyoTech University (Pamantasan ng Cabuyao - College of Computing Studies)**. Built with **Laravel 13 (PHP 8.3)**, **React 19**, **React Router DOM**, and **Tailwind CSS v4**, this application digitizes student workflows—including admissions/enrollment, academic clearance, grade encoding, cashier payments, official credential requests, and security audit logs.

---

## 1. System Architecture

The application is structured as a decoupled Single Page Application (SPA) powered by a robust Laravel REST API backend with a 3NF normalized database.

```
                              +-------------------------------------------------+
                              |          SSIS React 19 Frontend (SPA)           |
                              |   React Router DOM · Tailwind CSS v4 · Inter    |
                              +-------------------------------------------------+
                                                      |
                                                      | JSON / REST API (HTTP)
                                                      | X-User-Id & X-User-Role Headers
                                                      v
                              +-------------------------------------------------+
                              |          Laravel 13 Application Layer           |
                              |      Controllers · Middleware · Eloquent ORM    |
                              +-------------------------------------------------+
                                                      |
                                                      | SQLite / MySQL Driver
                                                      v
                              +-------------------------------------------------+
                              |          Relational Database Layer              |
                              |    3NF Normalized Schema (10 Core Tables)       |
                              +-------------------------------------------------+
```

---

## 2. Directory Structure

```
FrontEndSSIS12/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── AdminController.php             # User management, audit logs, system statistics
│   │   │   ├── AuthController.php              # Multi-role authentication & session resolution
│   │   │   ├── DepartmentController.php        # Clearance processing & accountability holds
│   │   │   ├── DocumentRequestController.php   # Document request pipeline, fee calculations, clearance hold checks
│   │   │   ├── PaymentController.php           # Cashier receipt issuance (OR-XXXXX) & collections ledger
│   │   │   ├── RegistrarController.php         # Enrollment approvals, grade encoding sheets, credential release
│   │   │   └── StudentController.php           # Student profile, grades, GWA calculation, curriculum subjects
│   │   └── Middleware/
│   │       └── ResolveHeaderUser.php           # Binds user session via X-User-Id / X-User-Role headers
│   └── Models/
│       ├── AuditLog.php                        # System audit trail records
│       ├── ClearanceRecord.php                 # Department clearance sign-offs & holds
│       ├── Course.php                          # Degree programs (e.g., BSCS, BSIT)
│       ├── Department.php                      # Academic and administrative departments
│       ├── DocumentRequest.php                 # Requested credentials (TOR, COR, Certifications)
│       ├── Enrollment.php                      # Student course enrollment status
│       ├── Payment.php                         # Official receipts and transaction ledger
│       ├── Student.php                         # Extended student profile and clearance state
│       ├── Subject.php                         # Curriculum courses, units, and prerequisites
│       └── User.php                            # Base user accounts across all 5 roles
├── database/
│   ├── migrations/                             # 10 3NF migration files
│   └── seeders/
│       └── DatabaseSeeder.php                  # Realistic university dataset with demo personas
├── resources/
│   ├── css/
│   │   └── app.css                             # Tailwind CSS v4 setup, Inter typography, 1-page print styles
│   ├── js/
│   │   ├── components/                         # Modular shared UI components
│   │   │   ├── BannerAlert.jsx                 # Dynamic status alerts & messages
│   │   │   ├── Navbar.jsx                      # Top navigation bar & instant module switcher
│   │   │   ├── OfficialDocumentModal.jsx       # 1-page printable credential preview (TOR, COR, Cert)
│   │   │   ├── OfficialReceiptModal.jsx        # 1-page printable Cashier official receipt (OR-XXXXX)
│   │   │   ├── Sidebar.jsx                     # Role-scoped dynamic sidebar navigation
│   │   │   ├── StatCard.jsx                    # Metric card for dashboard statistics
│   │   │   └── StatusBadge.jsx                 # Standardized status badges
│   │   ├── context/
│   │   │   └── AuthContext.jsx                 # Auth state management, optimistic role switching, storage sync
│   │   ├── pages/                              # Modular page components grouped by role
│   │   │   ├── Login.jsx                       # Multi-role authentication screen
│   │   │   ├── admin/                          # Admin: Overview, User Accounts, Audit Logs
│   │   │   ├── cashier/                        # Cashier: Payment Queue, Receipts Ledger
│   │   │   ├── department/                     # Department: Clearance Processing & Holds
│   │   │   ├── registrar/                      # Registrar: Document Queue, Grades Encoding, Enrollment
│   │   │   └── student/                        # Student: Dashboard, Grades, Clearance, Requests
│   │   ├── api.js                              # Fetch client wrapper with authentication header injection
│   │   ├── app.jsx                             # React root entry point
│   │   ├── AppRouter.jsx                       # React Router DOM declarative routing & route guards
│   │   └── config.js                           # Role definitions, routes, demo users, fee schedule
│   └── views/
│       └── app.blade.php                       # Single-page host Blade view with Inter Google Font
├── routes/
│   └── web.php                                 # SPA catch-all route & API endpoints
├── tests/
│   └── Feature/
│       └── DocumentRequestWorkflowTest.php     # 8 end-to-end automated tests with 29 assertions
└── PROJECT_DOCUMENTATION.md                    # Detailed architectural and SAD compliance documentation
```

---

## 3. How the System Works

The system operates across five distinct roles, faithfully implementing the university's **DFD Level 0 Context Diagram** and **Swimlane Activity Diagram**:

```
[ Student ] ------------> [ Department ] -----------> [ Cashier ] -----------> [ Registrar ]
    |                            |                          |                        |
Submits Document             Validates                  Collects Fee &           Processes & Releases
Request                      Clearance Status           Issues Official Receipt  Official Credential
                             (Hold / Cleared)           (OR-2026-XXXXX)          (TOR, COR, Cert)
```

### A. Student Portal (`/student`)
- **Dashboard**: Displays active academic profile, course, year level, GWA summary, and clearance status.
- **Grades & Subjects**: Displays enrolled subjects, midterm/final grades, completion status, and semester GPA.
- **Clearance Status**: Checklist of clearance sign-offs across University Library, Accounting, Prefect of Discipline, College Department, and Clinic.
- **Document Requests & Swimlane Decision Branch**:
  - Students can request **Transcript of Records (TOR)**, **Certificate of Registration (COR)**, or **Certifications**.
  - **Decision Logic**: If the student has an active hold (e.g. library fine or missing requirement), the request is blocked and displays an accountability modal detailing the hold reasons and issuing offices.
  - Cleared students immediately receive a tracking number and an assessed fee.

### B. Registrar Module (`/registrar`)
- **Document Queue**: Tracks document requests through their lifecycle:
  `pending_clearance` &rarr; `pending_payment` &rarr; `paid` &rarr; `processing` &rarr; `ready_for_pickup` &rarr; `released`.
- **Credential Release & Printing**: Generates verified, watermarked credentials with QR security hashes ready for single-page printing.
- **Grades Encoding**: Allows faculty and registrar staff to encode midterm, final, and remark grades with automatic GWA calculation.
- **Enrollment Approvals**: Reviews and approves student course enrollments.

### C. Cashier Module (`/cashier`)
- **Payment Queue**: Surfaces all document requests marked `pending_payment`.
- **Receipt Issuance**: Generates sequential Official Receipts (`OR-2026-XXXXX`) with payment method validation (Cash, Online Transfer, Cheque).
- **Receipts Ledger**: Comprehensive audit ledger of all issued receipts with filtering, date tracking, and revenue calculation.
- **Printable Receipts**: Renders clean, single-page official receipts.

### D. Department Module (`/department`)
- **Clearance Processing**: Department heads and staff view student rosters and inspect compliance status.
- **Accountability Holds**: Allows staff to place holds on students with specific reasons (e.g., "Unreturned Laboratory Equipment") or clear pending requirements.

### E. Administrator Module (`/admin`)
- **System Overview**: Live metric counters for total users, enrolled students, document requests, collections, and clearance completion rates.
- **User Accounts**: Role-based access control (RBAC) management to create accounts, toggle active/inactive statuses, and assign roles.
- **Audit Logs**: Real-time trail recording timestamps, client IP addresses, actor identities, and specific event descriptions for every system transaction.

---

## 4. Key Engineering Highlights

### ⚡ Real-Time Database Synchronization
All critical views (Audit Logs, Payment Queue, Document Queue, Clearance Processing, Student Tracker) feature automated background polling (every 3.5 seconds) and window focus listeners (`window.addEventListener('focus', ...)`). Updates made by any user reflect instantly without requiring full browser refreshes.

### 🔀 Instant Module Switching
The top navigation bar contains an instant role switcher. State and storage update optimistically on click while `React Router DOM` redirects to the new module's base route synchronously, eliminating layout lag.

### 🖨️ Strict 1-Page Printing
Dedicated `@media print` rules in `resources/css/app.css` format documents (TOR, COR, Certifications) and official receipts to fit strictly within a single page on both standard **Letter** and **A4** paper sizes, hiding all navigation chrome and modal backdrops.

### 🎨 Design System & Typography
The interface is styled with **Tailwind CSS v4** utilizing an academic forest green palette (`#1b5334`), modern glassmorphism, responsive tables, and typography powered by Google Font **Inter**.

---

## 5. Getting Started & Installation

### Prerequisites
- **PHP 8.3+** with SQLite, BCMath, and PDO extensions
- **Composer 2+**
- **Node.js 20+** and **npm**

### Step-by-Step Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd FrontEndSSIS12
   ```

2. **Install PHP dependencies**:
   ```bash
   composer install
   ```

3. **Install JavaScript dependencies**:
   ```bash
   npm install
   ```

4. **Environment Setup**:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

5. **Initialize Database and Seeders**:
   ```bash
   php artisan migrate:fresh --seed
   ```

6. **Build Frontend Assets**:
   ```bash
   npm run build
   ```

7. **Start Development Servers**:
   In terminal 1 (Backend):
   ```bash
   php artisan serve
   ```
   In terminal 2 (Frontend with Hot Reload):
   ```bash
   npm run dev
   ```

Visit the application at `http://127.0.0.1:8000`.

---

## 6. Demo User Personas

You can switch between these demo personas instantly using the **Switch Module** dropdown in the top navbar or by logging in with the default password `password`:

| Role | Name | Email / Student ID | Key Testing Feature |
| :--- | :--- | :--- | :--- |
| **Student (Cleared)** | Juan Dela Cruz | `2026-00123` | Request TOR/COR/Cert, view grades, check clearance |
| **Student (Has Hold)** | Pedro Reyes | `2026-00125` | Triggers the Swimlane Clearance Hold blocking modal |
| **Registrar** | Dr. Elena Ramos | `registrar@cuyotech.edu.ph` | Approve enrollments, encode grades, release credentials |
| **Cashier** | Ben Cruz | `cashier@cuyotech.edu.ph` | Process payments, issue `OR-XXXXX`, view ledger |
| **Department Staff** | Prof. Rolando Diaz | `department@cuyotech.edu.ph` | View student clearance, place/clear accountability holds |
| **Administrator** | System Administrator | `admin@cuyotech.edu.ph` | Manage users, view system metrics, inspect security audit logs |

---

## 7. Running Automated Tests

Run the full PHPUnit test suite covering the swimlane document request and clearance workflow:

```bash
php artisan test
```

All 8 tests (29 assertions) will execute against the in-memory/test database.

---

## 8. License

This project is developed for academic purposes under the **College of Computing Studies, Pamantasan ng Cabuyao / CuyoTech University**. All rights reserved.
