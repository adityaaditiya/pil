<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pilates_bookings', function (Blueprint $table) {
            $table->timestamp('expired_at')->nullable()->after('booked_at');
        });

        DB::statement("ALTER TABLE pilates_bookings MODIFY status ENUM('pending','confirmed','cancelled','expired') NOT NULL DEFAULT 'confirmed'");
    }

    public function down(): void
    {
        DB::table('pilates_bookings')->where('status', 'expired')->update(['status' => 'cancelled']);

        DB::statement("ALTER TABLE pilates_bookings MODIFY status ENUM('pending','confirmed','cancelled') NOT NULL DEFAULT 'confirmed'");

        Schema::table('pilates_bookings', function (Blueprint $table) {
            $table->dropColumn('expired_at');
        });
    }
};
