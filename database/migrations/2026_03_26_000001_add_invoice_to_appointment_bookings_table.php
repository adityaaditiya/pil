<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// return new class extends Migration
// {
//     public function up(): void
//     {
//         Schema::table('appointment_bookings', function (Blueprint $table) {
//             $table->string('invoice', 14)->nullable()->after('customer_id')->unique();
//             $table->foreignId('user_membership_id')->nullable()->after('payment_method')->constrained('user_memberships')->nullOnDelete();
//             $table->unsignedInteger('credit_used')->default(0)->after('user_membership_id');
//         });
//     }

//     public function down(): void
//     {
//         Schema::table('appointment_bookings', function (Blueprint $table) {
//             $table->dropUnique('appointment_bookings_invoice_unique');
//             $table->dropConstrainedForeignId('user_membership_id');
//             $table->dropColumn(['invoice', 'credit_used']);
//         });
//     }
// };


return new class extends Migration
{
    public function up(): void
    {
        Schema::table('appointment_bookings', function (Blueprint $table) {
            // Cek jika kolom invoice belum ada, baru buat
            if (!Schema::hasColumn('appointment_bookings', 'invoice')) {
                $table->string('invoice', 14)->nullable()->after('customer_id')->unique();
            }

            // Tambahkan kolom membership jika belum ada
            if (!Schema::hasColumn('appointment_bookings', 'user_membership_id')) {
                $table->foreignId('user_membership_id')
                    ->nullable()
                    ->after('payment_method')
                    ->constrained('user_memberships')
                    ->nullOnDelete();
            }

            // Tambahkan kolom credit_used jika belum ada
            if (!Schema::hasColumn('appointment_bookings', 'credit_used')) {
                $table->unsignedInteger('credit_used')->default(0)->after('user_membership_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('appointment_bookings', function (Blueprint $table) {
            // Hapus Unique secara spesifik
            if (Schema::hasColumn('appointment_bookings', 'invoice')) {
                // Gunakan try-catch agar tidak error jika index memang tidak ada
                try {
                    $table->dropUnique(['invoice']);
                } catch (\Exception $e) {}
            }

            $table->dropConstrainedForeignIdIfExists('user_membership_id');
            $table->dropColumn(['invoice', 'credit_used']);
        });
    }
};