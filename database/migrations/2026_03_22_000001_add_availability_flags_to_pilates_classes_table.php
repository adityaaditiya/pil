<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pilates_classes', function (Blueprint $table) {
            $table->boolean('available_for_timetable')->default(false)->after('price');
            $table->boolean('available_for_appointment')->default(false)->after('available_for_timetable');
        });
    }

    public function down(): void
    {
        Schema::table('pilates_classes', function (Blueprint $table) {
            $table->dropColumn(['available_for_timetable', 'available_for_appointment']);
        });
    }
};
