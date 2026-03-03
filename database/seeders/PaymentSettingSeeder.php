<?php

namespace Database\Seeders;

use App\Models\PaymentSetting;
use Illuminate\Database\Seeder;

class PaymentSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        PaymentSetting::firstOrCreate([], [
            'default_gateway' => 'cash',
            'qris_enabled' => false,
            'bank_transfer_enabled' => false,
            'debit_enabled' => false,
            'qris_full_name' => null,
            'qris_image' => null,
            'bank_name' => null,
            'bank_account_name' => null,
            'bank_account_number' => null,
            'ayo_enabled' => false,
            'credit_card_enabled' => false,
            'midtrans_enabled' => false,
            'xendit_enabled' => false,
        ]);
    }
}
