<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pilates_timetables', function (Blueprint $table) {
            if (! Schema::hasColumn('pilates_timetables', 'parent_id')) {
                $table->unsignedBigInteger('parent_id')->nullable()->after('id');
                $table->foreign('parent_id')->references('id')->on('pilates_timetables')->nullOnDelete();
                $table->index('parent_id');
            }

            if (! Schema::hasColumn('pilates_timetables', 'admin_notes')) {
                $table->text('admin_notes')->nullable()->after('status');
            }
        });
    }

    public function down(): void
    {
        Schema::table('pilates_timetables', function (Blueprint $table) {
            if (Schema::hasColumn('pilates_timetables', 'parent_id')) {
                $table->dropForeign(['parent_id']);
                $table->dropIndex(['parent_id']);
                $table->dropColumn('parent_id');
            }

            if (Schema::hasColumn('pilates_timetables', 'admin_notes')) {
                $table->dropColumn('admin_notes');
            }
        });
    }
};
