<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->text('question_text');
            $table->string('input_type');
            $table->boolean('is_required')->default(false);
            $table->json('options')->nullable();
            $table->timestamps();
        });

        Schema::create('customer_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('question_id')->constrained('questions')->cascadeOnDelete();
            $table->text('answer_value')->nullable();
            $table->timestamps();

            $table->unique(['customer_id', 'question_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_answers');
        Schema::dropIfExists('questions');
    }
};
