<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pilates_appointments', function (Blueprint $table) {
            $table->foreignId('appointment_session_id')->nullable()->after('parent_id')->constrained('appointment_sessions')->nullOnDelete();
            $table->text('admin_notes')->nullable()->after('description');
        });
    }

    public function down(): void
    {
        Schema::table('pilates_appointments', function (Blueprint $table) {
            $table->dropConstrainedForeignId('appointment_session_id');
            $table->dropColumn('admin_notes');
        });
    }
};
