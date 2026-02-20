<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PilatesClass extends Model
{
    use HasFactory;

    protected $fillable = [
        'image',
        'name',
        'scheduled_at',
        'slot',
        'duration',
        'difficulty_level',
        'about',
        'equipment',
        'trainers',
        'credit',
        'price',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'slot' => 'integer',
        'duration' => 'integer',
        'credit' => 'decimal:2',
        'price' => 'decimal:2',
    ];
}
