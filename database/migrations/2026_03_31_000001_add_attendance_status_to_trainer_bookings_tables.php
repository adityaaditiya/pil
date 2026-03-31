<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('pilates_bookings', function (Blueprint $table) {
            if (! Schema::hasColumn('pilates_bookings', 'attendance_status')) {
                $table->enum('attendance_status', ['pending', 'present', 'absent'])
                    ->default('pending')
                    ->after('status');
            }
        });

        Schema::table('appointment_bookings', function (Blueprint $table) {
            if (! Schema::hasColumn('appointment_bookings', 'attendance_status')) {
                $table->enum('attendance_status', ['pending', 'present', 'absent'])
                    ->default('pending')
                    ->after('status');
            }
        });
    }

    public function down(): void
    {
        Schema::table('pilates_bookings', function (Blueprint $table) {
            if (Schema::hasColumn('pilates_bookings', 'attendance_status')) {
                $table->dropColumn('attendance_status');
            }
        });

        Schema::table('appointment_bookings', function (Blueprint $table) {
            if (Schema::hasColumn('appointment_bookings', 'attendance_status')) {
                $table->dropColumn('attendance_status');
            }
        });
    }
};
