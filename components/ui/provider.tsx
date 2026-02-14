'use client';

import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { ColorModeProvider } from './color-mode';
import { system } from '@/theme/index';
import EmotionRegistry from './emotion-registry';

export function Provider(props: { children: React.ReactNode }) {
    return (
        <EmotionRegistry>
            <ColorModeProvider {...props}>
                <ChakraProvider value={system || defaultSystem}>
                    {props.children}
                </ChakraProvider>
            </ColorModeProvider>
        </EmotionRegistry>
    );
}
