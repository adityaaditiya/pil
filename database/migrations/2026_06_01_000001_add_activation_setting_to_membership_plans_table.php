<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('membership_plans', function (Blueprint $table) {
            if (! Schema::hasColumn('membership_plans', 'activation_setting')) {
                $table->string('activation_setting', 50)
                    ->default('on_first_credit_use')
                    ->after('valid_days');
            }
        });
    }

    public function down(): void
    {
        Schema::table('membership_plans', function (Blueprint $table) {
            if (Schema::hasColumn('membership_plans', 'activation_setting')) {
                $table->dropColumn('activation_setting');
            }
        });
    }
};
