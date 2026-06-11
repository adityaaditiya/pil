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
            $table->dateTime('old_expires_at')->nullable();
            $table->dateTime('new_expires_at');
            $table->unsignedInteger('duration_days')->nullable();
            $table->decimal('extension_fee', 15, 2)->default(0);
            $table->string('payment_method')->default('complimentary');
            $table->text('notes');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('membership_extensions');
    }
};
