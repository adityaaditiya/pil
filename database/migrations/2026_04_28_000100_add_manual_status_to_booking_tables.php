<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE pilates_bookings MODIFY COLUMN status ENUM('pending','confirmed','cancelled','expired','manual') NOT NULL DEFAULT 'confirmed'");
        DB::statement("ALTER TABLE appointment_bookings MODIFY COLUMN status ENUM('pending','pending_payment','confirmed','expired','cancelled','manual') NOT NULL DEFAULT 'confirmed'");
    }

    public function down(): void
    {
        DB::statement("UPDATE pilates_bookings SET status = 'cancelled' WHERE status = 'manual'");
        DB::statement("UPDATE appointment_bookings SET status = 'cancelled' WHERE status = 'manual'");
        DB::statement("ALTER TABLE pilates_bookings MODIFY COLUMN status ENUM('pending','confirmed','cancelled','expired') NOT NULL DEFAULT 'confirmed'");
        DB::statement("ALTER TABLE appointment_bookings MODIFY COLUMN status ENUM('pending','pending_payment','confirmed','expired','cancelled') NOT NULL DEFAULT 'confirmed'");
    }
};
