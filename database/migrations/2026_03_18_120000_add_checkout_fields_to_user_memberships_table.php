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
        Schema::table('user_memberships', function (Blueprint $table) {
            $table->string('invoice', 14)->nullable()->after('membership_plan_id');
            $table->string('payment_method')->nullable()->after('expires_at');
            $table->string('payment_proof_image')->nullable()->after('payment_method');
            $table->timestamp('expired_at')->nullable()->after('payment_proof_image');
        });

        DB::table('user_memberships')->select('id')->orderBy('id')->chunkById(100, function ($memberships) {
            foreach ($memberships as $membership) {
                do {
                    $invoice = 'MEM-' . Str::upper(Str::random(10));
                    $exists = DB::table('user_memberships')->where('invoice', $invoice)->exists();
                } while ($exists);

                DB::table('user_memberships')->where('id', $membership->id)->update([
                    'invoice' => $invoice,
                ]);
            }
        });

        Schema::table('user_memberships', function (Blueprint $table) {
            $table->unique('invoice');
        });

        DB::statement("ALTER TABLE user_memberships MODIFY status ENUM('pending', 'pending_payment', 'active', 'expired', 'cancelled') NOT NULL DEFAULT 'active'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE user_memberships MODIFY status ENUM('active', 'expired', 'cancelled') NOT NULL DEFAULT 'active'");

        Schema::table('user_memberships', function (Blueprint $table) {
            $table->dropUnique(['invoice']);
            $table->dropColumn(['invoice', 'payment_method', 'payment_proof_image', 'expired_at']);
        });
    }
};
