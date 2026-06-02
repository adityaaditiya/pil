<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MembershipPlan extends Model
{
    use HasFactory;

    public const ACTIVATION_ON_FIRST_CREDIT_USE = 'on_first_credit_use';
    public const ACTIVATION_IMMEDIATE = 'immediate';

    protected $fillable = [
        'name',
        'credits',
        'price',
        'valid_days',
        'activation_setting',
        'is_active',
        'description',
        'tag',
        'order_position',
    ];

    protected $casts = [
        'credits' => 'integer',
        'price' => 'decimal:2',
        'valid_days' => 'integer',
        'activation_setting' => 'string',
        'is_active' => 'boolean',
        'order_position' => 'integer',
    ];

    public static function activationSettingOptions(): array
    {
        return [
            self::ACTIVATION_ON_FIRST_CREDIT_USE,
            self::ACTIVATION_IMMEDIATE,
        ];
    }

    public function activatesImmediately(): bool
    {
        return $this->activation_setting === self::ACTIVATION_IMMEDIATE;
    }

    public function activationDates($activatedAt = null): array
    {
        $activatedAt = $activatedAt ?: now();
        $validDays = (int) ($this->valid_days ?? 0);

        return [
            'activated_at' => $activatedAt,
            'expires_at' => $validDays > 0 ? $activatedAt->copy()->addDays($validDays) : null,
        ];
    }

    public function classRules()
    {
        return $this->hasMany(MembershipPlanClass::class);
    }

    public function classes()
    {
        return $this->belongsToMany(PilatesClass::class, 'membership_plan_classes')
            ->withPivot('credit_cost')
            ->withTimestamps();
    }

    public function userMemberships()
    {
        return $this->hasMany(UserMembership::class);
    }
}
