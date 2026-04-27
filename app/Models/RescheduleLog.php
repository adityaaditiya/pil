<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RescheduleLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'from_session_id',
        'to_session_id',
        'rescheduled_at',
    ];

    protected $casts = [
        'rescheduled_at' => 'datetime',
    ];

    public function reschedulable()
    {
        return $this->morphTo();
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
