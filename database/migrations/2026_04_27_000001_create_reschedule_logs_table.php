<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reschedule_logs', function (Blueprint $table) {
            $table->id();
            $table->enum('booking_type', ['timetable', 'appointment']);
            $table->foreignId('booking_id')->index();
            $table->unsignedBigInteger('from_session_id');
            $table->unsignedBigInteger('to_session_id');
            $table->foreignId('moved_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->index(['booking_type', 'booking_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reschedule_logs');
    }
};
