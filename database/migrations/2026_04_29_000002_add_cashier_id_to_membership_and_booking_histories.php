<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_memberships', function (Blueprint $table) {
            $table->foreignId('cashier_id')->nullable()->after('user_id')->constrained('users')->nullOnDelete();
        });

        Schema::table('pilates_bookings', function (Blueprint $table) {
            $table->foreignId('cashier_id')->nullable()->after('user_id')->constrained('users')->nullOnDelete();
        });

        Schema::table('appointment_bookings', function (Blueprint $table) {
            $table->foreignId('cashier_id')->nullable()->after('customer_id')->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('appointment_bookings', function (Blueprint $table) {
            $table->dropConstrainedForeignId('cashier_id');
        });

        Schema::table('pilates_bookings', function (Blueprint $table) {
            $table->dropConstrainedForeignId('cashier_id');
        });

        Schema::table('user_memberships', function (Blueprint $table) {
            $table->dropConstrainedForeignId('cashier_id');
        });
    }
};
