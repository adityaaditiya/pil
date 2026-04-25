<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('trainers', function (Blueprint $table) {
            $table->dropColumn([
                'name',
                'photo',
                'date_of_birth',
                'gender',
                'address',
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('trainers', function (Blueprint $table) {
            $table->string('name')->after('user_id');
            $table->string('photo')->nullable()->after('name');
            $table->enum('gender', ['Laki-laki', 'Perempuan'])->nullable()->after('photo');
            $table->date('date_of_birth')->nullable()->after('gender');
            $table->text('address')->nullable()->after('expertise');
        });
    }
};
