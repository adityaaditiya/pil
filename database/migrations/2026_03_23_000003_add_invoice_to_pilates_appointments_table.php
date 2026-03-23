<?php

use App\Models\PilatesAppointment;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pilates_appointments', function (Blueprint $table) {
            $table->string('invoice')->nullable()->after('trainer_id');
        });

        PilatesAppointment::query()
            ->whereNull('invoice')
            ->lazyById()
            ->each(function (PilatesAppointment $appointment) {
                do {
                    $invoice = 'APT-'.Str::upper(Str::random(10));
                } while (PilatesAppointment::query()->where('invoice', $invoice)->exists());

                $appointment->updateQuietly(['invoice' => $invoice]);
            });

        Schema::table('pilates_appointments', function (Blueprint $table) {
            $table->unique('invoice');
        });
    }

    public function down(): void
    {
        Schema::table('pilates_appointments', function (Blueprint $table) {
            $table->dropUnique(['invoice']);
            $table->dropColumn('invoice');
        });
    }
};
