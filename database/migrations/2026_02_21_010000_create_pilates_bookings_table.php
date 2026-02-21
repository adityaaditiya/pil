<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pilates_bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('timetable_id')->constrained('pilates_timetables')->cascadeOnDelete();
            $table->enum('status', ['pending', 'confirmed', 'cancelled'])->default('confirmed');
            $table->timestamp('booked_at');
            $table->enum('payment_type', ['drop_in', 'credit'])->nullable();
            $table->decimal('price_amount', 12, 2)->nullable();
            $table->decimal('credit_used', 12, 2)->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'timetable_id']);
            $table->index(['timetable_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pilates_bookings');
    }
};
