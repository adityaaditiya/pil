<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use App\Models\PaymentSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PaymentSettingController extends Controller
{
    public function edit()
    {
        $setting = PaymentSetting::firstOrCreate([], [
            'default_gateway' => 'cash',
        ]);

        return Inertia::render('Dashboard/Settings/Payment', [
            'setting' => $setting,
            'supportedGateways' => [
                ['value' => 'cash', 'label' => 'Tunai'],
                ['value' => PaymentSetting::GATEWAY_QRIS, 'label' => 'QRIS'],
                ['value' => PaymentSetting::GATEWAY_BANK_TRANSFER, 'label' => 'Transfer Bank'],
                ['value' => PaymentSetting::GATEWAY_DEBIT, 'label' => 'Debit'],
                ['value' => PaymentSetting::GATEWAY_AYO, 'label' => 'AYO'],
                ['value' => PaymentSetting::GATEWAY_CREDIT_CARD, 'label' => 'Credit Card'],
                ['value' => PaymentSetting::GATEWAY_MIDTRANS, 'label' => 'Midtrans'],
                ['value' => PaymentSetting::GATEWAY_XENDIT, 'label' => 'Xendit'],
            ],
        ]);
    }

    public function update(Request $request)
    {
        $setting = PaymentSetting::firstOrCreate([], [
            'default_gateway' => 'cash',
        ]);

        $data = $request->validate([
            'default_gateway' => [
                'required',
                Rule::in([
                    'cash',
                    PaymentSetting::GATEWAY_QRIS,
                    PaymentSetting::GATEWAY_BANK_TRANSFER,
                    PaymentSetting::GATEWAY_DEBIT,
                    PaymentSetting::GATEWAY_AYO,
                    PaymentSetting::GATEWAY_CREDIT_CARD,
                    PaymentSetting::GATEWAY_MIDTRANS,
                    PaymentSetting::GATEWAY_XENDIT,
                ]),
            ],
            'qris_enabled' => ['boolean'],
            'bank_transfer_enabled' => ['boolean'],
            'debit_enabled' => ['boolean'],
            'qris_full_name' => ['nullable', 'string', 'max:255'],
            'qris_image' => ['nullable', 'image', 'max:2048'],
            'bank_name' => ['nullable', 'string', 'max:255'],
            'bank_account_name' => ['nullable', 'string', 'max:255'],
            'bank_account_number' => ['nullable', 'string', 'max:100'],
            'ayo_enabled' => ['boolean'],
            'credit_card_enabled' => ['boolean'],
            'midtrans_enabled' => ['boolean'],
            'midtrans_server_key' => ['nullable', 'string'],
            'midtrans_client_key' => ['nullable', 'string'],
            'midtrans_production' => ['boolean'],
            'xendit_enabled' => ['boolean'],
            'xendit_secret_key' => ['nullable', 'string'],
            'xendit_public_key' => ['nullable', 'string'],
            'xendit_production' => ['boolean'],
        ]);

        $midtransEnabled = (bool) ($data['midtrans_enabled'] ?? false);
        $xenditEnabled = (bool) ($data['xendit_enabled'] ?? false);
        $qrisEnabled = (bool) ($data['qris_enabled'] ?? false);
        $bankTransferEnabled = (bool) ($data['bank_transfer_enabled'] ?? false);
        $debitEnabled = (bool) ($data['debit_enabled'] ?? false);
        $ayoEnabled = (bool) ($data['ayo_enabled'] ?? false);
        $creditCardEnabled = (bool) ($data['credit_card_enabled'] ?? false);

        if ($qrisEnabled && empty($data['qris_full_name'])) {
            return back()->withErrors([
                'qris_full_name' => 'Nama lengkap QRIS wajib diisi saat mengaktifkan QRIS.',
            ])->withInput();
        }

        if ($qrisEnabled && !$request->hasFile('qris_image') && empty($setting->qris_image)) {
            return back()->withErrors([
                'qris_image' => 'Gambar QRIS wajib diunggah saat mengaktifkan QRIS.',
            ])->withInput();
        }

        if ($bankTransferEnabled && (empty($data['bank_name']) || empty($data['bank_account_name']) || empty($data['bank_account_number']))) {
            return back()->withErrors([
                'bank_name' => 'Nama bank, nama lengkap, dan nomor rekening wajib diisi saat mengaktifkan transfer bank.',
            ])->withInput();
        }

        if ($midtransEnabled && (empty($data['midtrans_server_key']) || empty($data['midtrans_client_key']))) {
            return back()->withErrors([
                'midtrans_server_key' => 'Server key dan Client key Midtrans wajib diisi saat mengaktifkan Midtrans.',
            ])->withInput();
        }

        if ($xenditEnabled && empty($data['xendit_secret_key'])) {
            return back()->withErrors([
                'xendit_secret_key' => 'Secret key Xendit wajib diisi saat mengaktifkan Xendit.',
            ])->withInput();
        }

        if (
            $data['default_gateway'] !== 'cash'
            && !(($data['default_gateway'] === PaymentSetting::GATEWAY_MIDTRANS && $midtransEnabled)
                || ($data['default_gateway'] === PaymentSetting::GATEWAY_XENDIT && $xenditEnabled)
                || ($data['default_gateway'] === PaymentSetting::GATEWAY_QRIS && $qrisEnabled)
                || ($data['default_gateway'] === PaymentSetting::GATEWAY_BANK_TRANSFER && $bankTransferEnabled)
                || ($data['default_gateway'] === PaymentSetting::GATEWAY_DEBIT && $debitEnabled)
                || ($data['default_gateway'] === PaymentSetting::GATEWAY_AYO && $ayoEnabled)
                || ($data['default_gateway'] === PaymentSetting::GATEWAY_CREDIT_CARD && $creditCardEnabled))
        ) {
            return back()->withErrors([
                'default_gateway' => 'Gateway default harus dalam kondisi aktif.',
            ])->withInput();
        }

        $qrisImage = $setting->qris_image;
        if ($request->hasFile('qris_image')) {
            if (filled($setting->qris_image)) {
                Storage::disk('local')->delete('public/payment-settings/' . basename($setting->qris_image));
            }

            $image = $request->file('qris_image');
            $image->storeAs('public/payment-settings', $image->hashName());
            $qrisImage = $image->hashName();
        }

        $setting->update([
            'default_gateway' => $data['default_gateway'],
            'qris_enabled' => $qrisEnabled,
            'bank_transfer_enabled' => $bankTransferEnabled,
            'debit_enabled' => $debitEnabled,
            'qris_full_name' => $data['qris_full_name'] ?? null,
            'qris_image' => $qrisImage,
            'bank_name' => $data['bank_name'] ?? null,
            'bank_account_name' => $data['bank_account_name'] ?? null,
            'bank_account_number' => $data['bank_account_number'] ?? null,
            'ayo_enabled' => $ayoEnabled,
            'credit_card_enabled' => $creditCardEnabled,
            'midtrans_enabled' => $midtransEnabled,
            'midtrans_server_key' => $data['midtrans_server_key'],
            'midtrans_client_key' => $data['midtrans_client_key'],
            'midtrans_production' => (bool) ($data['midtrans_production'] ?? false),
            'xendit_enabled' => $xenditEnabled,
            'xendit_secret_key' => $data['xendit_secret_key'],
            'xendit_public_key' => $data['xendit_public_key'],
            'xendit_production' => (bool) ($data['xendit_production'] ?? false),
        ]);

        return redirect()
            ->route('settings.payments.edit')
            ->with('success', 'Konfigurasi payment gateway berhasil disimpan.');
    }
}
