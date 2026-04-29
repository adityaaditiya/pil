import './bootstrap';
import '../css/app.css';

import { useEffect } from 'react'; // Tambahkan import useEffect
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { ThemeSwitcherProvider } from './Context/ThemeSwitcherContext';

const appName = import.meta.env.VITE_APP_NAME || 'ORO Pilates Studio';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        // Komponen Wrapper untuk menangani event global
        const AppWrapper = ({ children }) => {
            useEffect(() => {
                const handleWheel = (event) => {
                    // Mencegah perubahan angka saat scroll jika input type="number" sedang fokus
                    if (document.activeElement && document.activeElement.type === 'number') {
                        document.activeElement.blur();
                    }
                };

                document.addEventListener('wheel', handleWheel, { passive: false });

                return () => {
                    document.removeEventListener('wheel', handleWheel);
                };
            }, []);

            return children;
        };

        root.render(
            <ThemeSwitcherProvider>
                <AppWrapper>
                    <App {...props} />
                </AppWrapper>
            </ThemeSwitcherProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});