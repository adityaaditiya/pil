<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointment_bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('appointment_id')->constrained('pilates_appointments')->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('appointment_session_id')->nullable();
            $table->string('session_name')->nullable();
            $table->decimal('price_amount', 12, 2)->default(0);
            $table->enum('payment_type', ['drop_in', 'credit'])->default('drop_in');
            $table->string('payment_method')->default('cash');
            $table->enum('status', ['confirmed', 'cancelled'])->default('confirmed');
            $table->timestamp('booked_at');
            $table->timestamps();

            $table->index(['appointment_id', 'status']);
            $table->unique(['appointment_id', 'customer_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointment_bookings');
    }
};
