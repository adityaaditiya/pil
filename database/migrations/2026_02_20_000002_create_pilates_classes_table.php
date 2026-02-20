<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pilates_classes', function (Blueprint $table) {
            $table->id();
            $table->string('image');
            $table->string('name');
            $table->dateTime('scheduled_at');
            $table->unsignedInteger('slot');
            $table->unsignedInteger('duration');
            $table->enum('difficulty_level', ['Beginner', 'Intermediate', 'Advanced', 'Open to all']);
            $table->text('about');
            $table->text('equipment');
            $table->string('trainers');
            $table->decimal('credit', 12, 2)->default(0);
            $table->decimal('price', 12, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pilates_classes');
    }
};
