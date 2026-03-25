<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('appointment_sessions', function (Blueprint $table) {
            $table->decimal('default_price_drop_in', 12, 2)->default(0)->after('description');
            $table->decimal('default_price_credit', 12, 2)->default(0)->after('default_price_drop_in');
            $table->enum('default_payment_method', ['credit_only', 'allow_drop_in'])
                ->default('allow_drop_in')
                ->after('default_price_credit');
        });
    }

    public function down(): void
    {
        Schema::table('appointment_sessions', function (Blueprint $table) {
            $table->dropColumn([
                'default_price_drop_in',
                'default_price_credit',
                'default_payment_method',
            ]);
        });
    }
};
