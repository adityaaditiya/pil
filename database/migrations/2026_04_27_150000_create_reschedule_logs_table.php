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
            $table->morphs('reschedulable');
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('from_session_id');
            $table->unsignedBigInteger('to_session_id');
            $table->timestamp('rescheduled_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reschedule_logs');
    }
};
