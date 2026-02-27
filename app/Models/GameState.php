<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GameState extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'state_key', 'state_payload'];

    protected function casts(): array
    {
        return [
            'state_payload' => 'array',
        ];
    }
}
