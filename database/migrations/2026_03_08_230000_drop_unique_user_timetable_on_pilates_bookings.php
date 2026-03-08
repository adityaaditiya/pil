<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pilates_bookings', function (Blueprint $table) {
            $table->dropUnique('pilates_bookings_user_id_timetable_id_unique');
        });
    }

    public function down(): void
    {
        Schema::table('pilates_bookings', function (Blueprint $table) {
            $table->unique(['user_id', 'timetable_id']);
        });
    }
};
