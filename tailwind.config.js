import defaultTheme from "tailwindcss/defaultTheme";
import forms from "@tailwindcss/forms";

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php",
        "./storage/framework/views/*.php",
        "./resources/views/**/*.blade.php",
        "./resources/js/**/*.jsx",
    ],
    darkMode: "class",
    theme: {
        extend: {
            fontFamily: {
                sans: [
                    "Inter",
                    "Plus Jakarta Sans",
                    ...defaultTheme.fontFamily.sans,
                ],
                mono: [
                    "JetBrains Mono",
                    "Fira Code",
                    ...defaultTheme.fontFamily.mono,
                ],
            },
            colors: {
                // Wellness palette - Warm Beige & Gold
                primary: {
                    50: "#f8f3ec",
                    100: "#f1e6d8",
                    200: "#e8d2b8",
                    300: "#d8b286",
                    400: "#bf9158",
                    500: "#A8743B",
                    600: "#8C5E2E",
                    700: "#734a24",
                    800: "#5a391c",
                    900: "#422913",
                    950: "#2c1a0b",
                },
                accent: {
                    50: "#f7f1ea",
                    100: "#eee3d5",
                    200: "#dcc5a9",
                    300: "#c8a076",
                    400: "#b58252",
                    500: "#A8743B",
                    600: "#8C5E2E",
                    700: "#704a27",
                    800: "#58391f",
                    900: "#412815",
                    950: "#2d1a0d",
                },
                success: {
                    50: "#f2f7f1",
                    100: "#e0ecde",
                    200: "#c2d8bf",
                    300: "#9bbd98",
                    400: "#7da07b",
                    500: "#5f8460",
                    600: "#4a694b",
                    700: "#3b523c",
                    800: "#2f4130",
                    900: "#243125",
                    950: "#141d14",
                },
                warning: {
                    50: "#fdf6ec",
                    100: "#faecd8",
                    200: "#f3d4ad",
                    300: "#ebbc82",
                    400: "#de9b55",
                    500: "#c98135",
                    600: "#a56629",
                    700: "#824f21",
                    800: "#643c1b",
                    900: "#472912",
                    950: "#301a0a",
                },
                danger: {
                    50: "#fdf2f1",
                    100: "#fae3e1",
                    200: "#f3c7c4",
                    300: "#e89f99",
                    400: "#d5756c",
                    500: "#bb4f45",
                    600: "#9a3f37",
                    700: "#7a322c",
                    800: "#5f2823",
                    900: "#461e1a",
                    950: "#2e110e",
                },
                wellness: {
                    gold: "#A8743B",
                    brown: "#8C5E2E",
                    beige: "#E9DED2",
                    soft: "#F4EFE6",
                    greige: "#EAE6E1",
                    text: "#3A2E2A",
                    muted: "#6B5E57",
                },
            },
            spacing: {
                18: "4.5rem",
                88: "22rem",
                100: "25rem",
                112: "28rem",
                128: "32rem",
            },
            minHeight: {
                touch: "2.75rem", // 44px - minimum touch target
                "touch-lg": "3rem", // 48px - comfortable touch target
            },
            minWidth: {
                touch: "2.75rem",
                "touch-lg": "3rem",
            },
            borderRadius: {
                "4xl": "2rem",
            },
            boxShadow: {
                glow: "0 0 20px rgba(168, 116, 59, 0.3)",
                "glow-lg": "0 0 40px rgba(168, 116, 59, 0.4)",
                "inner-lg": "inset 0 4px 6px -1px rgb(0 0 0 / 0.1)",
            },
            animation: {
                "slide-in": "slideIn 0.2s ease-out",
                "slide-up": "slideUp 0.2s ease-out",
                "fade-in": "fadeIn 0.15s ease-out",
                "pulse-subtle":
                    "pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                "bounce-subtle":
                    "bounceSubtle 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
                "cart-add": "cartAdd 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            },
            keyframes: {
                slideIn: {
                    "0%": { transform: "translateX(100%)", opacity: "0" },
                    "100%": { transform: "translateX(0)", opacity: "1" },
                },
                slideUp: {
                    "0%": { transform: "translateY(10px)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                },
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                pulseSubtle: {
                    "0%, 100%": { opacity: "1" },
                    "50%": { opacity: "0.7" },
                },
                bounceSubtle: {
                    "0%": { transform: "scale(1)" },
                    "50%": { transform: "scale(1.05)" },
                    "100%": { transform: "scale(1)" },
                },
                cartAdd: {
                    "0%": { transform: "scale(0.8)", opacity: "0" },
                    "50%": { transform: "scale(1.1)" },
                    "100%": { transform: "scale(1)", opacity: "1" },
                },
            },
            backdropBlur: {
                xs: "2px",
            },
            transitionDuration: {
                250: "250ms",
            },
        },
    },
    plugins: [forms],
};
