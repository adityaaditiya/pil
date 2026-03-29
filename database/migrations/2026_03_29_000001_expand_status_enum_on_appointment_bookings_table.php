<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        DB::statement("ALTER TABLE appointment_bookings MODIFY COLUMN status ENUM('pending','pending_payment','confirmed','expired','cancelled') NOT NULL DEFAULT 'confirmed'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE appointment_bookings MODIFY COLUMN status ENUM('confirmed','cancelled') NOT NULL DEFAULT 'confirmed'");
    }
};
