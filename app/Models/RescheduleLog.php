<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RescheduleLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_type',
        'booking_id',
        'from_session_id',
        'to_session_id',
        'moved_by',
    ];

    public function movedBy()
    {
        return $this->belongsTo(User::class, 'moved_by');
    }

    public function fromSession()
    {
        return $this->belongsTo(PilatesTimetable::class, 'from_session_id');
    }

    public function toSession()
    {
        return $this->belongsTo(PilatesTimetable::class, 'to_session_id');
    }

    public function fromAppointment()
    {
        return $this->belongsTo(PilatesAppointment::class, 'from_session_id');
    }

    public function toAppointment()
    {
        return $this->belongsTo(PilatesAppointment::class, 'to_session_id');
    }
}
