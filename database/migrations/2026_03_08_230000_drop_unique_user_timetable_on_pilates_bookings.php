<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pilates_bookings', function (Blueprint $table) {
            // 1. Drop foreign keys first (MySQL requires an index for FKs)
            $table->dropForeign(['user_id']);
            $table->dropForeign(['timetable_id']);

            // 2. Now drop the unique index
            $table->dropUnique('pilates_bookings_user_id_timetable_id_unique');

            // 3. Re-add the foreign keys (Laravel will create new non-unique indexes for them)
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('timetable_id')->references('id')->on('pilates_timetables')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('pilates_bookings', function (Blueprint $table) {
            // Reverse: Drop the standalone FKs/indexes
            $table->dropForeign(['user_id']);
            $table->dropForeign(['timetable_id']);

            // Put the unique constraint back
            $table->unique(['user_id', 'timetable_id']);

            // Restore the foreign keys linked to that unique index
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('timetable_id')->references('id')->on('pilates_timetables')->cascadeOnDelete();
        });
    }
};

