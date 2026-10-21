<?php

return [
    // Term used when enrolling students (change each semester or set in .env)
    'current_academic_year' => env('SSIS_ACADEMIC_YEAR', '2026-2027'),
    'current_semester' => env('SSIS_SEMESTER', '1st Semester'),

    // Maximum units a student may carry in a single term
    'max_units_per_term' => (int) env('SSIS_MAX_UNITS', 30),

    // Highest numeric grade that still counts as passed (1.00 is best)
    'passing_grade' => 3.00,
];
