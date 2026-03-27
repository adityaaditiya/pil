<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('appointment_bookings', function (Blueprint $table) {
            $table->dropUnique('appointment_bookings_appointment_id_customer_id_unique');
        });
    }

    public function down(): void
    {
        Schema::table('appointment_bookings', function (Blueprint $table) {
            $table->unique(['appointment_id', 'customer_id']);
        });
    }
};
