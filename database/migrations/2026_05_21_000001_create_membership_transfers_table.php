<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('membership_transfers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('from_user_membership_id')->constrained('user_memberships')->cascadeOnDelete();
            $table->foreignId('to_user_membership_id')->constrained('user_memberships')->cascadeOnDelete();
            $table->foreignId('from_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('to_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('membership_plan_id')->nullable()->constrained('membership_plans')->nullOnDelete();
            $table->unsignedInteger('credits_transferred');
            $table->text('notes')->nullable();
            $table->foreignId('processed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('membership_transfers');
    }
};
