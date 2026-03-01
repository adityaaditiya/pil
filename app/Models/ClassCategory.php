<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClassCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'image',
        'name',
        'description',
    ];

    public function classes()
    {
        return $this->hasMany(PilatesClass::class);
    }

    protected function image(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => asset('/storage/class-categories/' . $value),
        );
    }
}
