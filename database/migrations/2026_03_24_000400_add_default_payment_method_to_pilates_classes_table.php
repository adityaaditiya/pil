<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pilates_classes', function (Blueprint $table) {
            $table->enum('default_payment_method', ['drop_in', 'credit'])
                ->default('drop_in')
                ->after('price');
        });
    }

    public function down(): void
    {
        Schema::table('pilates_classes', function (Blueprint $table) {
            $table->dropColumn('default_payment_method');
        });
    }
};
