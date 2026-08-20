import React from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import Swal from 'sweetalert2';
import { Transition } from '@headlessui/react';

export default function Account({ user }) {
    const { data, setData, put, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        put(route('settings.account.update'), {
            preserveScroll: true,
            onSuccess: () => {
                setData('password', '');
                setData('password_confirmation', '');
                Swal.fire({
                    title: 'Berhasil!',
                    text: 'Pengaturan akun berhasil diperbarui.',
                    icon: 'success',
                    confirmButtonText: 'Tutup',
                    confirmButtonColor: '#10b981',
                });
            },
        });
    };

    return (
        <DashboardLayout>
            <Head title="Pengaturan Akun" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-zinc-900 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <header>
                                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                    Informasi Akun
                                </h2>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                    Perbarui nama lengkap dan kata sandi akun Anda.
                                </p>
                            </header>

                            <form onSubmit={submit} className="mt-6 space-y-6">
                                <div>
                                    <InputLabel htmlFor="name" value="Nama Lengkap" />

                                    <TextInput
                                        id="name"
                                        className="mt-1 block w-full"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                        isFocused
                                        autoComplete="name"
                                    />

                                    <InputError className="mt-2" message={errors.name} />
                                </div>

                                <div>
                                    <InputLabel htmlFor="password" value="Kata Sandi Baru" />

                                    <TextInput
                                        id="password"
                                        type="password"
                                        className="mt-1 block w-full"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Kosongkan jika tidak diubah"
                                        autoComplete="new-password"
                                    />

                                    <InputError className="mt-2" message={errors.password} />
                                </div>

                                <div>
                                    <InputLabel htmlFor="password_confirmation" value="Konfirmasi Kata Sandi" />

                                    <TextInput
                                        id="password_confirmation"
                                        type="password"
                                        className="mt-1 block w-full"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        placeholder="Ulangi kata sandi baru"
                                        autoComplete="new-password"
                                    />

                                    <InputError className="mt-2" message={errors.password_confirmation} />
                                </div>

                                <div className="flex items-center gap-4">
                                    <PrimaryButton disabled={processing}>Simpan Perubahan</PrimaryButton>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Tersimpan.</p>
                                    </Transition>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
