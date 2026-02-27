<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentReport extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'report_type', 'report_payload'];

    protected function casts(): array
    {
        return [
            'report_payload' => 'array',
        ];
    }
}
