<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pilates_bookings', function (Blueprint $table) {
            $table->timestamp('canceled_at')->nullable()->after('updated_at');
            $table->text('cancellation_note')->nullable()->after('canceled_at');
            $table->string('canceled_by_email')->nullable()->after('cancellation_note');
        });

        Schema::table('appointment_bookings', function (Blueprint $table) {
            $table->timestamp('canceled_at')->nullable()->after('updated_at');
            $table->text('cancellation_note')->nullable()->after('canceled_at');
            $table->string('canceled_by_email')->nullable()->after('cancellation_note');
        });

        Schema::table('user_memberships', function (Blueprint $table) {
            $table->timestamp('canceled_at')->nullable()->after('updated_at');
            $table->text('cancellation_note')->nullable()->after('canceled_at');
            $table->string('canceled_by_email')->nullable()->after('cancellation_note');
        });
    }

    public function down(): void
    {
        Schema::table('pilates_bookings', function (Blueprint $table) {
            $table->dropColumn(['canceled_at', 'cancellation_note', 'canceled_by_email']);
        });

        Schema::table('appointment_bookings', function (Blueprint $table) {
            $table->dropColumn(['canceled_at', 'cancellation_note', 'canceled_by_email']);
        });

        Schema::table('user_memberships', function (Blueprint $table) {
            $table->dropColumn(['canceled_at', 'cancellation_note', 'canceled_by_email']);
        });
    }
};
