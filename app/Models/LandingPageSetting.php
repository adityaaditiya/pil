<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LandingPageSetting extends Model
{
    use HasFactory;

    public const DEFAULT_HERO_BACKGROUND = 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80';
    public const DEFAULT_SCHEDULE_BACKGROUND = 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80';
    public const DEFAULT_CLASSES_BACKGROUND = 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80';

    protected $fillable = [
        'hero_background_image',
        'schedule_background_image',
        'classes_background_image',
    ];

    public static function defaultAttributes(): array
    {
        return [
            'hero_background_image' => self::DEFAULT_HERO_BACKGROUND,
            'schedule_background_image' => self::DEFAULT_SCHEDULE_BACKGROUND,
            'classes_background_image' => self::DEFAULT_CLASSES_BACKGROUND,
        ];
    }
}
