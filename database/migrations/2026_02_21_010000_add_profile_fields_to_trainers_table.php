<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('trainers', function (Blueprint $table) {
            $table->string('photo')->nullable()->after('name');
            $table->unsignedTinyInteger('age')->nullable()->after('photo');
            $table->enum('gender', ['Laki-laki', 'Perempuan'])->nullable()->after('age');
            $table->text('address')->nullable()->after('gender');
        });
    }

    public function down(): void
    {
        Schema::table('trainers', function (Blueprint $table) {
            $table->dropColumn(['photo', 'age', 'gender', 'address']);
        });
    }
};
