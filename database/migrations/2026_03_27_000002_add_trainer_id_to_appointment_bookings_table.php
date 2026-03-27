<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('appointment_bookings', function (Blueprint $table) {
            $table->foreignId('trainer_id')
                ->nullable()
                ->after('customer_id')
                ->constrained('trainers')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('appointment_bookings', function (Blueprint $table) {
            $table->dropConstrainedForeignId('trainer_id');
        });
    }
};
