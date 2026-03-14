<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->enum('gender', ['Laki-laki', 'Perempuan'])->nullable()->after('address');
            $table->date('date_of_birth')->nullable()->after('gender');
            $table->string('photo')->nullable()->after('date_of_birth');
        });

        Schema::table('trainers', function (Blueprint $table) {
            $table->date('date_of_birth')->nullable()->after('gender');
            $table->string('expertise')->nullable()->after('date_of_birth');
            $table->dropColumn('age');
        });
    }

    public function down(): void
    {
        Schema::table('trainers', function (Blueprint $table) {
            $table->unsignedTinyInteger('age')->nullable()->after('photo');
            $table->dropColumn(['date_of_birth', 'expertise']);
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn(['gender', 'date_of_birth', 'photo']);
        });
    }
};
