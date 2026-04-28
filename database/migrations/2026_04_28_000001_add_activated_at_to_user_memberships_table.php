<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_memberships', function (Blueprint $table) {
            if (! Schema::hasColumn('user_memberships', 'activated_at')) {
                $table->timestamp('activated_at')->nullable()->after('starts_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('user_memberships', function (Blueprint $table) {
            if (Schema::hasColumn('user_memberships', 'activated_at')) {
                $table->dropColumn('activated_at');
            }
        });
    }
};
