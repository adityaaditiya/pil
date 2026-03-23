<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pilates_appointments', function (Blueprint $table) {
            $table->dropColumn('invoice');
        });

        Schema::create('appointment_trainer', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pilates_appointment_id')->constrained('pilates_appointments')->cascadeOnDelete();
            $table->foreignId('trainer_id')->constrained('trainers')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['pilates_appointment_id', 'trainer_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointment_trainer');

        Schema::table('pilates_appointments', function (Blueprint $table) {
            $table->string('invoice')->nullable()->after('trainer_id');
        });
    }
};
