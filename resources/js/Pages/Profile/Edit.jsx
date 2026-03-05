import Navbar from "@/Components/Landing/Navbar";
import DeleteUserForm from "./Partials/DeleteUserForm";
import UpdatePasswordForm from "./Partials/UpdatePasswordForm";
import UpdateProfileInformationForm from "./Partials/UpdateProfileInformationForm";
import { Head } from "@inertiajs/react";

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <>
            <Head title="Profile" />

            <div className="min-h-screen bg-gradient-to-b from-wellness-beige to-white text-wellness-text">
                <Navbar currentKey={null} />

                <div className="py-12">
                    <div className="mx-auto max-w-5xl space-y-6 px-4 sm:px-6 lg:px-8">
                        <div className="rounded-3xl border border-primary-100 bg-white p-4 shadow-sm sm:p-8">
                            <h1 className="text-2xl font-semibold">My Profile</h1>
                            <p className="mt-1 text-sm text-wellness-muted">Kelola informasi akun Anda di sini.</p>

                            <div className="mt-6">
                                <UpdateProfileInformationForm
                                    mustVerifyEmail={mustVerifyEmail}
                                    status={status}
                                    className="max-w-xl"
                                />
                            </div>
                        </div>

                        <div className="rounded-3xl border border-primary-100 bg-white p-4 shadow-sm sm:p-8">
                            <UpdatePasswordForm className="max-w-xl" />
                        </div>

                        <div className="rounded-3xl border border-primary-100 bg-white p-4 shadow-sm sm:p-8">
                            <DeleteUserForm className="max-w-xl" />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
