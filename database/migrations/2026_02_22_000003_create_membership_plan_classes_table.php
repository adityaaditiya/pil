<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('membership_plan_classes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('membership_plan_id')->constrained()->cascadeOnDelete();
            $table->foreignId('pilates_class_id')->constrained()->cascadeOnDelete();
            $table->integer('credit_cost')->default(1);
            $table->timestamps();

            $table->unique(['membership_plan_id', 'pilates_class_id'], 'mpc_plan_class_uq');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('membership_plan_classes');
    }
};
