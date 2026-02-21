<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pilates_bookings', function (Blueprint $table) {
            $table->unsignedInteger('participants')->default(1)->after('timetable_id');
            $table->string('payment_method')->nullable()->after('payment_type');
        });
    }

    public function down(): void
    {
        Schema::table('pilates_bookings', function (Blueprint $table) {
            $table->dropColumn(['participants', 'payment_method']);
        });
    }
};
