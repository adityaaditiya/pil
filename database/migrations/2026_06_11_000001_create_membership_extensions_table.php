<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('membership_extensions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_membership_id')->constrained('user_memberships')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('membership_plan_id')->constrained('membership_plans')->cascadeOnDelete();
            $table->dateTime('previous_expires_at');
            $table->dateTime('new_expires_at');
            $table->unsignedInteger('duration_days')->nullable();
            $table->date('extension_date')->nullable();
            $table->unsignedBigInteger('fee_amount')->default(0);
            $table->string('payment_method')->default('complimentary');
            $table->text('notes');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index(['user_membership_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('membership_extensions');
    }
};
