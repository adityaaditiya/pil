<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pilates_appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('pilates_appointments')->nullOnDelete();
            $table->foreignId('pilates_class_id')->constrained('pilates_classes')->cascadeOnDelete();
            $table->foreignId('trainer_id')->constrained('trainers')->cascadeOnDelete();
            $table->string('session_name');
            $table->text('description')->nullable();
            $table->decimal('price', 12, 2)->default(0);
            $table->unsignedInteger('duration_minutes');
            $table->dateTime('start_at');
            $table->dateTime('end_at');
            $table->timestamps();

            $table->index(['start_at', 'end_at']);
            $table->index(['trainer_id', 'start_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pilates_appointments');
    }
};
