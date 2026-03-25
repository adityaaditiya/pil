<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('appointment_bookings', function (Blueprint $table) {
            // Sesuaikan tipenya, jika isinya 'credit' atau 'drop_in' gunakan string
            $table->string('payment_type')->nullable()->after('price_amount');
        });
    }

    public function down(): void
    {
        Schema::table('appointment_bookings', function (Blueprint $table) {
            $table->dropColumn('payment_type');
        });
    }
};
