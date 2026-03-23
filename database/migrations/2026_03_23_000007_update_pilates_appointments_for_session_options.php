<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pilates_appointments', function (Blueprint $table) {
            $table->json('session_options')->nullable()->after('session_name');
            $table->dropColumn('description');
        });
    }

    public function down(): void
    {
        Schema::table('pilates_appointments', function (Blueprint $table) {
            $table->text('description')->nullable()->after('session_name');
            $table->dropColumn('session_options');
        });
    }
};
