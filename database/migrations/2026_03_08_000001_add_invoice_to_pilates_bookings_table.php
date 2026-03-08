<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pilates_bookings', function (Blueprint $table) {
            $table->string('invoice', 14)->nullable()->after('timetable_id');
        });

        $bookings = DB::table('pilates_bookings')->select('id')->whereNull('invoice')->orderBy('id')->get();

        foreach ($bookings as $booking) {
            do {
                $invoice = 'INV-' . strtoupper(Str::random(10));
                $exists = DB::table('pilates_bookings')->where('invoice', $invoice)->exists();
            } while ($exists);

            DB::table('pilates_bookings')->where('id', $booking->id)->update(['invoice' => $invoice]);
        }

        Schema::table('pilates_bookings', function (Blueprint $table) {
            $table->unique('invoice');
        });
    }

    public function down(): void
    {
        Schema::table('pilates_bookings', function (Blueprint $table) {
            $table->dropUnique(['invoice']);
            $table->dropColumn('invoice');
        });
    }
};
