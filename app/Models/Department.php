<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Department extends Model
{
    use HasFactory;

    protected $fillable = [
        'department_code',
        'department_name',
        'office_location',
    ];

    public function courses(): HasMany
    {
        return $this->hasMany(Course::class);
    }

    public function students(): HasManyThrough
    {
        return $this->hasManyThrough(Student::class, Course::class);
    }

    public function clearanceRecords(): HasMany
    {
        return $this->hasMany(ClearanceRecord::class);
    }
}
