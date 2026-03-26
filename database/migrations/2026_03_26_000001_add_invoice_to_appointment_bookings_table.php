<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('appointment_bookings', function (Blueprint $table) {
            $table->string('invoice', 14)->nullable()->after('customer_id')->unique();
        });
    }

    public function down(): void
    {
        Schema::table('appointment_bookings', function (Blueprint $table) {
            $table->dropUnique('appointment_bookings_invoice_unique');
            $table->dropColumn('invoice');
        });
    }
};
