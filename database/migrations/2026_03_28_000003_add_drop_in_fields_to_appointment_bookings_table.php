<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('appointment_bookings', function (Blueprint $table) {
            if (! Schema::hasColumn('appointment_bookings', 'payment_proof_image')) {
                $table->string('payment_proof_image')->nullable()->after('credit_used');
            }

            if (! Schema::hasColumn('appointment_bookings', 'expired_at')) {
                $table->timestamp('expired_at')->nullable()->after('booked_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('appointment_bookings', function (Blueprint $table) {
            if (Schema::hasColumn('appointment_bookings', 'payment_proof_image')) {
                $table->dropColumn('payment_proof_image');
            }

            if (Schema::hasColumn('appointment_bookings', 'expired_at')) {
                $table->dropColumn('expired_at');
            }
        });
    }
};
