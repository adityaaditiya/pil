<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('cash_entries', function (Blueprint $table) {
            $table->string('transaction_category')->default('UANG LAIN LAIN')->after('category');
        });

        DB::table('cash_entries')->update([
            'transaction_category' => 'UANG LAIN LAIN',
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cash_entries', function (Blueprint $table) {
            $table->dropColumn('transaction_category');
        });
    }
};
