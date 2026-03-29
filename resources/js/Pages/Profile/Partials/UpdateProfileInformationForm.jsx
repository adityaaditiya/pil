import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Link, useForm, usePage } from '@inertiajs/react';
import { Transition } from '@headlessui/react';

export default function UpdateProfileInformation({ mustVerifyEmail, status, customer, className = '' }) {
    const user = usePage().props.auth.user;

    const { data, setData, post, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
        no_telp: customer?.no_telp ? String(customer.no_telp) : '',
        address: customer?.address || '',
        gender: customer?.gender || 'Laki-laki',
        date_of_birth: customer?.date_of_birth || '',
        photo: null,
        _method: 'patch',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('profile.update'), {
            forceFormData: true,
        });
    };

    return (
        <section className={className}>
            {/* <header>
                <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>

                <p className="mt-1 text-sm text-gray-600">
                    Update your account's profile information and email address.
                </p>
            </header> */}

            <form onSubmit={submit} className="mt-6 space-y-6" encType="multipart/form-data">
                <div>
                    <InputLabel htmlFor="name" value="Name" />

                    <TextInput
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value.replace(/[^\p{L}\s]/gu, ''))}
                        required
                        isFocused
                        autoComplete="name"
                    />

                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />

                    <InputError className="mt-2" message={errors.email} />
                </div>

                <div>
                    <InputLabel htmlFor="no_telp" value="No. Handphone" />

                    <TextInput
                        id="no_telp"
                        type="text"
                        className="mt-1 block w-full"
                        value={data.no_telp}
                        onChange={(e) => setData('no_telp', e.target.value.replace(/\D/g, ''))}
                        required
                        inputMode="numeric"
                        autoComplete="tel"
                    />

                    <InputError className="mt-2" message={errors.no_telp} />
                </div>

                <div>
                    <InputLabel htmlFor="address" value="Alamat" />

                    <textarea
                        id="address"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        value={data.address}
                        onChange={(e) => setData('address', e.target.value)}
                        required
                        rows={3}
                        autoComplete="street-address"
                    />

                    <InputError className="mt-2" message={errors.address} />
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                        <InputLabel htmlFor="gender" value="Gender" />
                        <select
                            id="gender"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            value={data.gender}
                            onChange={(e) => setData('gender', e.target.value)}
                            required
                        >
                            <option value="Laki-laki">Laki-laki</option>
                            <option value="Perempuan">Perempuan</option>
                        </select>
                        <InputError className="mt-2" message={errors.gender} />
                    </div>
                    <div>
                        <InputLabel htmlFor="date_of_birth" value="Tanggal Lahir" />
                        <TextInput
                            id="date_of_birth"
                            type="date"
                            className="mt-1 block w-full"
                            value={data.date_of_birth}
                            onChange={(e) => setData('date_of_birth', e.target.value)}
                            required
                        />
                        <InputError className="mt-2" message={errors.date_of_birth} />
                    </div>
                </div>

                <div>
                    <InputLabel htmlFor="photo" value="Foto (Opsional)" />
                    {customer?.photo && (
                        <img src={`/storage/customers/${customer.photo}`} alt="Foto Profil" className="mt-2 h-20 w-20 rounded-lg object-cover" />
                    )}
                    <TextInput
                        id="photo"
                        type="file"
                        className="mt-1 block w-full"
                        onChange={(e) => setData('photo', e.target.files[0])}
                        accept="image/*"
                    />
                    <InputError className="mt-2" message={errors.photo} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="text-sm mt-2 text-gray-800">
                            Your email address is unverified.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Click here to re-send the verification email.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 font-medium text-sm text-green-600">
                                A new verification link has been sent to your email address.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Save</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600">Saved.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
