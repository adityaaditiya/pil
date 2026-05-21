<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('membership_credit_transfers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sender_customer_id')->constrained('customers')->cascadeOnDelete();
            $table->foreignId('receiver_customer_id')->constrained('customers')->cascadeOnDelete();
            $table->unsignedInteger('credits_transferred');
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('membership_credit_transfers');
    }
};
