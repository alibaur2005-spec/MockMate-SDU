'use client';

import { ThemeProvider, type ThemeProviderProps, useTheme } from 'next-themes';
import { IconButton } from '@chakra-ui/react';
import { FaSun, FaMoon } from 'react-icons/fa';
import { useEffect, useState } from 'react';

export function ColorModeProvider(props: ThemeProviderProps) {
    return (
        <ThemeProvider
            attribute="class"
            disableTransitionOnChange
            {...props}
        />
    );
}

export function useColorMode() {
    const { theme, setTheme } = useTheme();
    return {
        colorMode: theme,
        toggleColorMode: () => setTheme(theme === 'light' ? 'dark' : 'light'),
    };
}

export function ColorModeButton(props: any) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <IconButton
            variant="ghost"
            aria-label="Toggle color mode"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            {...props}
        >
            {theme === 'light' ? <FaMoon /> : <FaSun />}
        </IconButton>
    );
}
