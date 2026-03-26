import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const customConfig = defineConfig({
    theme: {
        tokens: {
            colors: {
                brand: {
                    50: { value: '#f0f4ff' },
                    100: { value: '#e0eaff' },
                    200: { value: '#c7d6fc' },
                    300: { value: '#a3bbf8' },
                    400: { value: '#7b98f2' },
                    500: { value: '#5672ea' },
                    600: { value: '#3f54de' },
                    700: { value: '#3240c9' },
                    800: { value: '#2b35a3' },
                    900: { value: '#262f82' },
                    950: { value: '#1a1e50' },
                },
                accent: {
                    50: { value: '#effcfc' },
                    100: { value: '#d6f8f8' },
                    200: { value: '#b0f1f1' },
                    300: { value: '#7ae6e7' },
                    400: { value: '#3dd3d6' },
                    500: { value: '#1ab1b5' },
                    600: { value: '#138e93' },
                    700: { value: '#137277' },
                    800: { value: '#145c60' },
                    900: { value: '#134c50' },
                    950: { value: '#083235' },
                },
            },
            fonts: {
                heading: { value: 'var(--font-outfit), sans-serif' },
                body: { value: 'var(--font-inter), sans-serif' },
            },
            radii: {
                xl: { value: '1rem' },
                '2xl': { value: '1.5rem' },
                '3xl': { value: '2rem' },
            },
        },
        semanticTokens: {
            colors: {
                bg: {
                    default: { value: '{colors.white}' },
                    _dark: { value: '#08080c' },
                },
                bgSub: {
                    default: { value: '{colors.gray.50}' },
                    _dark: { value: '#0c0c14' },
                },
                fg: {
                    default: { value: '{colors.gray.900}' },
                    _dark: { value: '{colors.white}' },
                },
                fgMuted: {
                    default: { value: '{colors.gray.500}' },
                    _dark: { value: '{colors.gray.400}' },
                },
                border: {
                    default: { value: '{colors.gray.200}' },
                    _dark: { value: '#1a1a2e' },
                },
            },
        },
    },
});

export const system = createSystem(defaultConfig, customConfig);
