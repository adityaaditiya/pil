<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pilates_bookings', function (Blueprint $table) {
            $table->foreignId('user_membership_id')->nullable()->after('user_id')->constrained('user_memberships')->nullOnDelete();
            $table->foreignId('membership_plan_id')->nullable()->after('user_membership_id')->constrained('membership_plans')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('pilates_bookings', function (Blueprint $table) {
            $table->dropConstrainedForeignId('membership_plan_id');
            $table->dropConstrainedForeignId('user_membership_id');
        });
    }
};
