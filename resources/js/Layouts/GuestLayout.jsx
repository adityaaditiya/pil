import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function Guest({ children }) {
    return (
        <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-wellness-soft">
            <div>
                <Link href="/">
                    <ApplicationLogo className="w-20 h-20 fill-current text-primary-600" />
                </Link>
            </div>

            <div className="w-full sm:max-w-md mt-6 px-6 py-4 bg-wellness-greige border border-primary-200 shadow-md overflow-hidden sm:rounded-lg">
                {children}
            </div>
        </div>
    );
}
